using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Context;
using backend.Entities;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace backend.Controllers

{
    [Authorize]
    [Route("posts")]
    [ApiController]
    public class PostsController : Controller
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly UserManager<IdentityUser> _userManager;

        public PostsController(AppDbContext context, IWebHostEnvironment env, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _env = env;
            _userManager = userManager;
        }

        // Cria post — requer permissão para criar
        [HttpPost]
        public async Task<IActionResult> CreatePost([FromForm] PostCreateDto dto)
        {
            string mediaPath = null;
            var canManageAll = User.HasClaim("CanManageAll", "true");
            var canManageSubordinates = User.HasClaim("CanManageOwnPosts", "true");

            if (!canManageAll && !canManageSubordinates)
            {
                return Forbid();
            }

            if (dto.File != null && dto.File.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileExtension = Path.GetExtension(dto.File.FileName).ToLower();
                var fileName = $"{Guid.NewGuid()}";
                var uploadPath = "";

                if (fileExtension == ".jpg" || fileExtension == ".jpeg" || fileExtension == ".png")
                {
                    using var image = Image.Load(dto.File.OpenReadStream());
                    image.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Mode = ResizeMode.Max,
                        Size = new Size(1200, 0)
                    }));

                    fileName += ".jpg";
                    uploadPath = Path.Combine(uploadsFolder, fileName);
                    image.SaveAsJpeg(uploadPath, new JpegEncoder { Quality = 80 });
                }
                else
                {
                    fileName += fileExtension;
                    uploadPath = Path.Combine(uploadsFolder, fileName);

                    using var stream = new FileStream(uploadPath, FileMode.Create);
                    await dto.File.CopyToAsync(stream);
                }

                mediaPath = $"uploads/{fileName}";
            }

            var user = await _userManager.GetUserAsync(User);
            var colaborador = await _context.Colaboradores
                .FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());

            var post = new Post
            {
                AuthorId = user.Id,
                AuthorName = dto.AuthorName,
                AuthorCargo = dto.AuthorCargo,
                Content = dto.Content,
                MediaPath = mediaPath,
                CreatedAt = DateTime.UtcNow,
                Visibility = dto.Visibility
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return Ok(post);
        }

        // Listagem aberta — filtragem pode ser feita com Policies no futuro
        // Rota: GET /posts
        [HttpGet]
        public async Task<IActionResult> GetPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var user = await _userManager.GetUserAsync(User);
            var colaborador = await _context.Colaboradores
                .FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());

            if (colaborador == null)
            {
                return Forbid();
            }

            var userCC = colaborador.Centro_de_Custo;

            var roles = await _userManager.GetRolesAsync(user);
            var isAdmin = roles.Contains("Admin", StringComparer.OrdinalIgnoreCase);
            var isCA = roles.Any(r => r.Contains("CA", StringComparison.OrdinalIgnoreCase));
            var isUA = roles.Any(r => r.Contains("UA", StringComparison.OrdinalIgnoreCase));

            // Se não for Admin, CA ou UA => Proibido
            if (!isAdmin && !isCA && !isUA)
            {
                return Forbid("Tipo de usuário não identificado como Admin, CA ou UA.");
            }

            // Base query
            var query = _context.Posts
                .Include(p => p.Reactions)
                .Include(p => p.Comments)
                .OrderByDescending(p => p.Id)
                .AsQueryable();

            // Se não for Admin, aplica filtro de visibilidade e centro de custo
            if (!isAdmin)
            {
                query = query.Where(p =>
                    p.Visibility == "Cooperativa" ||
                    (
                        (
                            (isCA && p.Visibility == "Centro Administrativo") ||
                            (isUA && p.Visibility == "Agência")
                        )
                        &&
                        (
                            _context.Colaboradores
                                .Where(c => c.Email.ToLower() ==
                                    (_context.Users.Where(u => u.Id == p.AuthorId)
                                        .Select(u => u.Email.ToLower())
                                        .FirstOrDefault())
                                )
                                .Select(c => c.Centro_de_Custo)
                                .FirstOrDefault() == userCC
                        )
                    )
                );
            }

            var totalPosts = await query.CountAsync();

            var posts = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.Id,
                    p.AuthorName,
                    p.AuthorCargo,
                    p.Content,
                    p.MediaPath,
                    p.CreatedAt,
                    AuthorSupervisorId = (
                        from u in _context.Users
                        join c in _context.Colaboradores on u.Email.ToLower() equals c.Email.ToLower()
                        where u.Id == p.AuthorId
                        select c.SupervisorId
                    ).FirstOrDefault(),
                    Reactions = p.Reactions
                        .GroupBy(r => r.Type)
                        .Select(g => new
                        {
                            Type = g.Key,
                            Count = g.Count(),
                            Users = g.Select(r => r.UserName).ToList()
                        }),
                    Comments = p.Comments
                        .OrderBy(c => c.CreatedAt)
                        .Select(c => new
                        {
                            c.UserName,
                            c.Text,
                            CreatedAt = c.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                        })
                })
                .ToListAsync();

            return Ok(new
            {
                Total = totalPosts,
                Page = page,
                PageSize = pageSize,
                Posts = posts
            });
        }


        // Permite reagir — qualquer logado
        [HttpPost("{id}/reactions")]
        public async Task<IActionResult> ToggleReaction(int id, [FromBody] string type)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound();

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var colaborador = await _context.Colaboradores.FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());
            var userName = colaborador?.Nome ?? user.UserName;

            var existingReaction = await _context.Reactions.FirstOrDefaultAsync(r => r.PostId == id && r.UserName == userName && r.Type == type);

            if (existingReaction != null)
            {
                _context.Reactions.Remove(existingReaction);
                await _context.SaveChangesAsync();
                return Ok(new { action = "removed", type });
            }

            // Se quiser permitir só uma reação por usuário, pode limpar as outras
            var otherReactions = await _context.Reactions
                .Where(r => r.PostId == id && r.UserName == userName && r.Type != type)
                .ToListAsync();

            if (otherReactions.Any())
                _context.Reactions.RemoveRange(otherReactions);

            _context.Reactions.Add(new Reaction { PostId = id, Type = type, UserName = userName });
            await _context.SaveChangesAsync();

            return Ok(new { action = "added", type });
        }

        // Rota: GET /posts/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPost(int id)
        {
            var post = await _context.Posts
                .Include(p => p.Reactions)
                .Include(p => p.Comments)
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.AuthorName,
                    p.AuthorCargo,
                    p.Content,
                    p.MediaPath,
                    p.CreatedAt,
                    AuthorSupervisorId = _context.Colaboradores
                        .Where(c => c.Nome == p.AuthorName)
                        .Select(c => c.SupervisorId)
                        .FirstOrDefault(),

                    Reactions = p.Reactions
                        .GroupBy(r => r.Type)
                        .Select(g => new
                        {
                            Type = g.Key,
                            Count = g.Count(),
                            Users = g.Select(r => r.UserName).ToList()
                        }),
                    Comments = p.Comments
                        .OrderBy(c => c.CreatedAt)
                        .Select(c => new
                        {
                            c.UserName,
                            c.Text,
                            CreatedAt = c.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                        })
                })
                .FirstOrDefaultAsync();

            if (post == null) return NotFound();
            return Ok(post);
        }

        // Permite comentar — qualquer logado
        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(int id, [FromBody] CommentDto dto)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound();

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var colaborador = await _context.Colaboradores.FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());
            var userName = colaborador?.Nome ?? user.UserName;

            var comment = new Comment
            {
                PostId = id,
                Text = dto.Text,
                UserName = userName,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new { comment.Id, comment.UserName, comment.Text, comment.CreatedAt });
        }

        // Atualiza conteúdo do post
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] PostUpdateDto dto)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound();

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var currentColaborador = await _context.Colaboradores
                .FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());
            var currentUserName = currentColaborador?.Nome ?? user.UserName;

            var author = await _context.Colaboradores
                .FirstOrDefaultAsync(c => c.Nome == post.AuthorName);

            var isSupervisor = author?.SupervisorId == user.Id;
            var canManageAll = User.HasClaim("CanManageAll", "true");

            if (post.AuthorName != currentUserName && !canManageAll && !isSupervisor)
            {
                return Forbid();
            }

            post.Content = dto.Content ?? post.Content;
            post.AuthorCargo = dto.AuthorCargo ?? post.AuthorCargo;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Post atualizado com sucesso.", post });
        }


        // Deleta post — mesmo padrão de permissão
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound();

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var currentColaborador = await _context.Colaboradores
                .FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());
            var currentUserName = currentColaborador?.Nome ?? user.UserName;

            var author = await _context.Colaboradores
                .FirstOrDefaultAsync(c => c.Nome == post.AuthorName);

            var isSupervisor = author?.SupervisorId == user.Id;
            var canManageAll = User.HasClaim("CanManageAll", "true");

            if (post.AuthorName != currentUserName && !canManageAll && !isSupervisor)
            {
                return Forbid();
            }

            // Remove reações e comentários
            var reactions = _context.Reactions.Where(r => r.PostId == id);
            var comments = _context.Comments.Where(c => c.PostId == id);

            _context.Reactions.RemoveRange(reactions);
            _context.Comments.RemoveRange(comments);
            _context.Posts.Remove(post);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Post removido com sucesso." });
        }
    }
}
