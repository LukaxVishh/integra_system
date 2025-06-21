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
    [Route("processos")]
    [ApiController]
    public class ProcessosController : Controller
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly UserManager<IdentityUser> _userManager;

        public ProcessosController(AppDbContext context, IWebHostEnvironment env, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _env = env;
            _userManager = userManager;
        }

        // === CREATE ===
        [HttpPost]
        public async Task<IActionResult> CreateProcessosPost([FromForm] PostCreateDto dto)
        {
            var canManageAll = User.HasClaim("CanManageAll", "true");
            var canCreate = User.HasClaim("PqCreatePost", "true");

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

            var post = new ProcessosPost
            {
                AuthorId = user.Id,
                AuthorName = dto.AuthorName,
                AuthorCargo = dto.AuthorCargo,
                Content = dto.Content,
                MediaPath = mediaPath,
                CreatedAt = DateTime.UtcNow,
                Visibility = "Cooperativa" // 🔑 SEMPRE cooperativa
            };

            _context.ProcessosPosts.Add(post);
            await _context.SaveChangesAsync();

            return Ok(post);
        }

        // === GET ===
        [HttpGet]
        public async Task<IActionResult> GetProcessosPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var user = await _userManager.GetUserAsync(User);
            var colaborador = await _context.Colaboradores
                .FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());

            if (colaborador == null) return Forbid();

            var query = _context.ProcessosPosts
                .OrderByDescending(p => p.Id)
                .Select(p => new {
                    p.Id,
                    p.AuthorName,
                    p.AuthorCargo,
                    p.Content,
                    p.MediaPath,
                    p.CreatedAt,
                    AuthorPhotoUrl = _context.Colaboradores
                        .Where(c => c.Nome == p.AuthorName)
                        .Select(c => c.PhotoUrl)
                        .FirstOrDefault()
                });

            var total = await query.CountAsync();
            var posts = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new {
                Total = total,
                Page = page,
                PageSize = pageSize,
                Posts = posts
            });
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProcessosPost(int id, [FromBody] PostUpdateDto dto)
        {
            var post = await _context.ProcessosPosts.FindAsync(id);
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
            var canUpdate = User.HasClaim("PqUpdatePost", "true");

            if (post.AuthorName != currentUserName && !canManageAll && !isSupervisor && !canUpdate)
            {
                return Forbid();
            }

            post.Content = dto.Content ?? post.Content;
            post.AuthorCargo = dto.AuthorCargo ?? post.AuthorCargo;

            await _context.SaveChangesAsync();

            return Ok(new { message = "ProcessosPost atualizado com sucesso.", post });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProcessosPost(int id)
        {
            var post = await _context.ProcessosPosts.FindAsync(id);
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
            var canDelete = User.HasClaim("PqDeletePost", "true");

            if (post.AuthorName != currentUserName && !canManageAll && !isSupervisor && !canDelete)
            {
                return Forbid();
            }

            // REMOVE MEDIA DO DISCO
            if (!string.IsNullOrEmpty(post.MediaPath))
            {
                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", post.MediaPath);
                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                }
            }

            _context.ProcessosPosts.Remove(post);
            await _context.SaveChangesAsync();

            return Ok(new { message = "ProcessosPost removido com sucesso." });
        }

        [HttpGet("orientador/buttons")]
        public async Task<IActionResult> GetButtons()
        {
            var buttons = await _context.ProcessosOrientadorButtons
                .OrderBy(b => b.Order)
                .ToListAsync();
            return Ok(buttons);
        }

        [HttpPost("orientador/buttons")]
        public async Task<IActionResult> CreateButton([FromBody] OrientadorButtonDto dto)
        {
            if (!User.HasClaim("PqCreateOri", "true") && !User.HasClaim("CanManageAll", "true"))
                return Forbid();

            var maxOrder = await _context.ProcessosOrientadorButtons.MaxAsync(b => (int?)b.Order) ?? 0;

            var button = new ProcessosOrientadorButton
            {
                Text = dto.Text,
                Color = dto.Color,
                Bold = dto.Bold,
                TextColor = dto.TextColor,
                Order = maxOrder + 1
            };

            _context.ProcessosOrientadorButtons.Add(button);
            await _context.SaveChangesAsync();

            return Ok(button);
        }

        [HttpPut("orientador/buttons/{id}")]
        public async Task<IActionResult> UpdateButton(int id, [FromBody] OrientadorButtonUpdateDto dto)
        {
            if (!User.HasClaim("PqUpdateOri", "true") && !User.HasClaim("CanManageAll", "true"))
                return Forbid();

            var button = await _context.ProcessosOrientadorButtons.FindAsync(id);
            if (button == null) return NotFound();

            button.Text = dto.Text;
            button.Color = dto.Color;
            button.TextColor = dto.TextColor;
            button.Bold = dto.Bold;
            button.ExternalLink = dto.ExternalLink;
            button.Order = dto.Order;

            await _context.SaveChangesAsync();
            return Ok(button);
        }

        [HttpDelete("orientador/buttons/{id}")]
        public async Task<IActionResult> DeleteButton(int id)
        {
            if (!User.HasClaim("PqDeleteOri", "true") && !User.HasClaim("CanManageAll", "true"))
                return Forbid();

            var button = await _context.ProcessosOrientadorButtons.FindAsync(id);
            if (button == null) return NotFound();

            _context.ProcessosOrientadorButtons.Remove(button);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("orientador/buttons/reorder")]
        public async Task<IActionResult> Reorder([FromBody] List<int> orderedIds)
        {
            if (!User.HasClaim("PqUpdateOri", "true") && !User.HasClaim("CanManageAll", "true"))
                return Forbid();

            var buttons = await _context.ProcessosOrientadorButtons.ToListAsync();

            for (int i = 0; i < orderedIds.Count; i++)
            {
                var button = buttons.FirstOrDefault(b => b.Id == orderedIds[i]);
                if (button != null)
                {
                    button.Order = i + 1;
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("orientador/buttons/{buttonId}/table")]
        public async Task<IActionResult> GetTable(int buttonId)
        {
            var table = await _context.ProcessosOrientadorTables
                .FirstOrDefaultAsync(t => t.ButtonId == buttonId);

            if (table == null)
                return NotFound();

            return Ok(table);
        }

        [HttpPost("orientador/buttons/{buttonId}/table")]
        public async Task<IActionResult> SaveOrUpdateTable(int buttonId, [FromBody] OrientadorTableDto dto)
        {
            if (!User.HasClaim("PqCreateOri", "true") &&
                !User.HasClaim("PqUpdateOri", "true") &&
                !User.HasClaim("CanManageAll", "true"))
                return Forbid();

            var existing = await _context.ProcessosOrientadorTables
                .FirstOrDefaultAsync(t => t.ButtonId == buttonId);

            if (existing == null)
            {
                var newTable = new ProcessosOrientadorTable
                {
                    ButtonId = buttonId,
                    DataJson = dto.DataJson
                };
                _context.ProcessosOrientadorTables.Add(newTable);
            }
            else
            {
                existing.DataJson = dto.DataJson;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("organograma")]
        public async Task<IActionResult> GetProcessosOrganograma()
        {
            var allUsers = await _userManager.Users.ToListAsync();
            var gerentesProcessos = new List<object>();

            foreach (var user in allUsers)
            {
                var userClaims = await _userManager.GetClaimsAsync(user);

                if (userClaims.Any(c => c.Type == "GerenteProcessos" && c.Value == "true"))
                {
                    var colaborador = await _context.Colaboradores
                        .FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());

                    // ⚡ Gerente: atividades, tags, historico
                    var gerenteAtividades = await _context.ProcessosColaboradorAtividades
                        .Where(a => a.ColaboradorEmail.ToLower() == colaborador.Email.ToLower())
                        .OrderByDescending(a => a.DataInicio)
                        .ToListAsync();

                    var gerenteTags = gerenteAtividades
                        .Where(a => a.DataFim == null)
                        .Select(a => new
                        {
                            id = a.Id,
                            name = a.NomeTag,
                            color = a.Cor,
                            descricao = a.Descricao
                        })
                        .ToList();

                    var gerenteHistorico = gerenteAtividades
                        .Select(a => $"{a.NomeTag} — {a.Descricao} ({a.DataInicio:dd/MM/yyyy} até {(a.DataFim?.ToString("dd/MM/yyyy") ?? "Ativo")})")
                        .ToList();

                    // ⚡ Subordinados: cada um com atividades, tags, historico
                    var rawSubordinados = await _context.Colaboradores
                        .Where(c => c.SupervisorId == user.Id)
                        .ToListAsync();

                    var subordinados = rawSubordinados
                        .Select(c =>
                        {
                            var subUser = allUsers.FirstOrDefault(u => u.Email.ToLower() == c.Email.ToLower());
                            var atividades = _context.ProcessosColaboradorAtividades
                                .Where(a => a.ColaboradorEmail.ToLower() == c.Email.ToLower())
                                .OrderByDescending(a => a.DataInicio)
                                .ToList();

                            var tags = atividades
                                .Where(a => a.DataFim == null)
                                .Select(a => new
                                {
                                    id = a.Id,
                                    name = a.NomeTag,
                                    color = a.Cor,
                                    descricao = a.Descricao
                                })
                                .ToList();

                            var historico = atividades
                                .Select(a => $"{a.NomeTag} — {a.Descricao} ({a.DataInicio:dd/MM/yyyy} até {(a.DataFim?.ToString("dd/MM/yyyy") ?? "Ativo")})")
                                .ToList();

                            return new
                            {
                                id = subUser?.Id,
                                nome = c.Nome,
                                cargo = c.Cargo,
                                email = c.Email,
                                photoUrl = c.PhotoUrl,
                                tags,
                                historico
                            };
                        })
                        .ToList();

                    gerentesProcessos.Add(new
                    {
                        id = user.Id,
                        nome = colaborador?.Nome ?? user.UserName,
                        cargo = colaborador?.Cargo ?? "Não informado",
                        email = user.Email,
                        photoUrl = colaborador?.PhotoUrl,
                        tags = gerenteTags,
                        historico = gerenteHistorico,
                        subordinados
                    });
                }
            }

            return Ok(gerentesProcessos);
        }


        [HttpPost("colaboradores/atividades")]
        public async Task<IActionResult> CriarAtividade([FromBody] ProcessosColaboradorAtividade dto)
        {
            var user = await _userManager.GetUserAsync(User);
            var hasPower = User.HasClaim("GerenteProcessos", "true") || User.HasClaim("CanManageAll", "true");

            if (!hasPower && dto.ColaboradorEmail.ToLower() != user.Email.ToLower())
                return Forbid();

            dto.DataInicio = DateTime.UtcNow;
            dto.DataFim = null;

            _context.ProcessosColaboradorAtividades.Add(dto);
            await _context.SaveChangesAsync();

            return Ok(dto);
        }

        [HttpPut("colaboradores/atividades/{id}")]
        public async Task<IActionResult> AtualizarAtividade(int id, [FromBody] ProcessosColaboradorAtividade update)
        {
            var atividade = await _context.ProcessosColaboradorAtividades.FindAsync(id);
            if (atividade == null) return NotFound();

            var user = await _userManager.GetUserAsync(User);
            var hasPower = User.HasClaim("GerenteProcessos", "true") || User.HasClaim("CanManageAll", "true");
            if (!hasPower && atividade.ColaboradorEmail.ToLower() != user.Email.ToLower())
                return Forbid();

            if (!string.IsNullOrWhiteSpace(update.NomeTag))
                atividade.NomeTag = update.NomeTag;

            if (!string.IsNullOrWhiteSpace(update.Cor))
                atividade.Cor = update.Cor;

            if (!string.IsNullOrWhiteSpace(update.Descricao))
                atividade.Descricao = update.Descricao;

            if (update.DataFim.HasValue)
                atividade.DataFim = update.DataFim;

            await _context.SaveChangesAsync();
            return Ok(atividade);
        }

        [HttpDelete("colaboradores/atividades/{id}")]
        public async Task<IActionResult> DeletarAtividade(int id)
        {
            var atividade = await _context.ProcessosColaboradorAtividades.FindAsync(id);
            if (atividade == null) return NotFound();

            var user = await _userManager.GetUserAsync(User);
            var hasPower = User.HasClaim("GerenteProcessos", "true") || User.HasClaim("CanManageAll", "true");
            if (!hasPower && atividade.ColaboradorEmail.ToLower() != user.Email.ToLower())
                return Forbid();

            _context.ProcessosColaboradorAtividades.Remove(atividade);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Atividade removida com sucesso." });
        }

        [HttpGet("colaboradores/atividades/{email}")]
        public async Task<IActionResult> ListarAtividadesPorColaborador(string email)
        {

            var atividades = await _context.ProcessosColaboradorAtividades
                .Where(a => a.ColaboradorEmail.ToLower() == email.ToLower())
                .OrderByDescending(a => a.DataInicio)
                .ToListAsync();

            return Ok(atividades);
        }
    }
}