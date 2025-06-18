using System;
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
    [Route("ciclo")]
    [ApiController]
    public class CicloController : Controller
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly UserManager<IdentityUser> _userManager;

        public CicloController(AppDbContext context, IWebHostEnvironment env, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _env = env;
            _userManager = userManager;
        }

        // === CREATE ===
        [HttpPost]
        public async Task<IActionResult> CreateCicloPost([FromForm] PostCreateDto dto)
        {
            var canManageAll = User.HasClaim("CanManageAll", "true");
            var canCreate = User.HasClaim("CcCreatePost", "true");

            if (!canManageAll && !canCreate)
                return Forbid();

            string mediaPath = null;

            if (dto.File != null && dto.File.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var ext = Path.GetExtension(dto.File.FileName).ToLower();
                var fileName = $"{Guid.NewGuid()}";
                var uploadPath = "";

                if (ext == ".jpg" || ext == ".jpeg" || ext == ".png")
                {
                    using var image = Image.Load(dto.File.OpenReadStream());
                    image.Mutate(x => x.Resize(new ResizeOptions { Mode = ResizeMode.Max, Size = new Size(1200, 0) }));

                    fileName += ".jpg";
                    uploadPath = Path.Combine(uploadsFolder, fileName);
                    image.SaveAsJpeg(uploadPath, new JpegEncoder { Quality = 80 });
                }
                else
                {
                    fileName += ext;
                    uploadPath = Path.Combine(uploadsFolder, fileName);
                    using var stream = new FileStream(uploadPath, FileMode.Create);
                    await dto.File.CopyToAsync(stream);
                }

                mediaPath = $"uploads/{fileName}";
            }

            var user = await _userManager.GetUserAsync(User);
            var colaborador = await _context.Colaboradores.FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());

            var post = new CicloPost
            {
                AuthorId = user.Id,
                AuthorName = dto.AuthorName,
                AuthorCargo = dto.AuthorCargo,
                Content = dto.Content,
                MediaPath = mediaPath,
                CreatedAt = DateTime.UtcNow,
                Visibility = "Cooperativa" // 🔑 SEMPRE cooperativa
            };

            _context.CicloPosts.Add(post);
            await _context.SaveChangesAsync();

            return Ok(post);
        }

        // === GET ===
        [HttpGet]
        public async Task<IActionResult> GetCicloPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var user = await _userManager.GetUserAsync(User);
            var colaborador = await _context.Colaboradores.FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());
            if (colaborador == null) return Forbid();

            var query = _context.CicloPosts
                .OrderByDescending(p => p.Id)
                .AsQueryable();

            var total = await query.CountAsync();
            var posts = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return Ok(new
            {
                Total = total,
                Page = page,
                PageSize = pageSize,
                Posts = posts
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCicloPost(int id, [FromBody] PostUpdateDto dto)
        {
            var post = await _context.CicloPosts.FindAsync(id);
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
            var canUpdate = User.HasClaim("CcUpdatePost", "true");

            if (post.AuthorName != currentUserName && !canManageAll && !isSupervisor && !canUpdate)
            {
                return Forbid();
            }

            post.Content = dto.Content ?? post.Content;
            post.AuthorCargo = dto.AuthorCargo ?? post.AuthorCargo;

            await _context.SaveChangesAsync();

            return Ok(new { message = "CicloPost atualizado com sucesso.", post });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCicloPost(int id)
        {
            var post = await _context.CicloPosts.FindAsync(id);
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
            var canDelete = User.HasClaim("CcDeletePost", "true");

            if (post.AuthorName != currentUserName && !canManageAll && !isSupervisor && !canDelete)
            {
                return Forbid();
            }

            _context.CicloPosts.Remove(post);
            await _context.SaveChangesAsync();

            return Ok(new { message = "CicloPost removido com sucesso." });
        }
    }
}
