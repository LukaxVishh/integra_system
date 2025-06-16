using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using backend.Context;
using backend.Entities;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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

        public PostsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // POST: api/posts
        [HttpPost]
        public async Task<IActionResult> CreatePost([FromForm] PostCreateDto dto)
        {
            string mediaPath = null;

            if (dto.File != null && dto.File.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileExtension = Path.GetExtension(dto.File.FileName).ToLower();

                var fileName = $"{Guid.NewGuid()}";

                var uploadPath = ""; // vamos definir abaixo

                if (fileExtension == ".jpg" || fileExtension == ".jpeg" || fileExtension == ".png")
                {
                    // Processa imagem com ImageSharp
                    using var image = Image.Load(dto.File.OpenReadStream());

                    image.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Mode = ResizeMode.Max,
                        Size = new Size(1200, 0) // Máximo 1200px de largura, altura proporcional
                    }));

                    fileName += ".jpg"; // força JPEG recomprimido
                    uploadPath = Path.Combine(uploadsFolder, fileName);

                    image.SaveAsJpeg(uploadPath, new JpegEncoder
                    {
                        Quality = 80 // recomprime para reduzir tamanho
                    });
                }
                else
                {
                    // Se for vídeo ou outro tipo, salva sem recomprimir
                    fileName += fileExtension;
                    uploadPath = Path.Combine(uploadsFolder, fileName);

                    using var stream = new FileStream(uploadPath, FileMode.Create);
                    await dto.File.CopyToAsync(stream);
                }

                mediaPath = $"uploads/{fileName}";
            }


            var post = new Post
            {
                Author = dto.Author,
                Content = dto.Content,
                MediaPath = mediaPath,
                CreatedAt = DateTime.UtcNow
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return Ok(post);
        }

        // GET: api/posts?page=1&pageSize=20
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var query = _context.Posts
                .Include(p => p.Reactions)
                .Include(p => p.Comments)
                .OrderByDescending(p => p.Id);

            var totalPosts = await query.CountAsync();

            var posts = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.Id,
                    p.Author,
                    p.Content,
                    p.MediaPath,
                    Reactions = p.Reactions
                        .GroupBy(r => r.Type)
                        .Select(g => new {
                            Type = g.Key,
                            Count = g.Count(),
                            Users = g.Select(r => r.UserName).ToList()
                        })
                        .ToList(),
                    Comments = p.Comments
                        .OrderBy(c => c.CreatedAt)
                        .Select(c => new {
                            c.UserName,
                            c.Text,
                            CreatedAt = c.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                        })
                        .ToList()
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


        [HttpPost("{id}/reactions")]
        [Authorize]
        public async Task<IActionResult> ToggleReaction(int id, [FromBody] string type)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound();

            var userName = User.Identity?.Name ?? "Anonymous";

            // Verificar se já existe essa reação
            var existingReaction = await _context.Reactions
                .FirstOrDefaultAsync(r => r.PostId == id && r.UserName == userName && r.Type == type);

            if (existingReaction != null)
            {
                // Se existe, remover (toggle off)
                _context.Reactions.Remove(existingReaction);
                await _context.SaveChangesAsync();
                return Ok(new { action = "removed", type });
            }

            // OPCIONAL: remover reações de outros tipos, se quiser permitir só 1 tipo por vez:
            var otherReactions = await _context.Reactions
                .Where(r => r.PostId == id && r.UserName == userName && r.Type != type)
                .ToListAsync();

            if (otherReactions.Any())
            {
                _context.Reactions.RemoveRange(otherReactions);
            }

            // Adicionar a nova reação
            var reaction = new Reaction
            {
                PostId = id,
                Type = type,
                UserName = userName
            };

            _context.Reactions.Add(reaction);
            await _context.SaveChangesAsync();

            return Ok(new { action = "added", type });
        }

        // GET: /posts/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetPost(int id)
        {
            var post = await _context.Posts
                .Include(p => p.Reactions)
                .Include(p => p.Comments)
                .Where(p => p.Id == id)
                .Select(p => new {
                    p.Id,
                    p.Author,
                    p.Content,
                    p.MediaPath,
                    Reactions = p.Reactions
                        .GroupBy(r => r.Type)
                        .Select(g => new {
                            Type = g.Key,
                            Count = g.Count(),
                            Users = g.Select(r => r.UserName).ToList()
                        })
                        .ToList(),
                    Comments = p.Comments
                        .OrderBy(c => c.CreatedAt)
                        .Select(c => new {
                            c.UserName,
                            c.Text,
                            CreatedAt = c.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (post == null) return NotFound();

            return Ok(post);
        }


        
        public class CommentDto
        {
            public string Text { get; set; } = string.Empty;
        }

        [HttpPost("{id}/comments")]
        [Authorize]
        public async Task<IActionResult> AddComment(int id, [FromBody] CommentDto dto)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound();

            var comment = new Comment
            {
                PostId = id,
                Text = dto.Text,
                UserName = User.Identity?.Name ?? "Anonymous",
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new {
                comment.Id,
                comment.UserName,
                comment.Text,
                comment.CreatedAt
            });
        }
    }
}