using backend.Context;
using backend.Entities;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;

namespace backend.Controllers
{
    [ApiController]
    [Route("users")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly AppDbContext _context;

        public UserController(
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            AppDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        private async Task<List<object>> GetAllGerentesAsync()
        {
            var allUsers = await _userManager.Users.ToListAsync();
            var gerentes = new List<object>();

            foreach (var user in allUsers)
            {
                var roles = await _userManager.GetRolesAsync(user);

                if (roles.Any(r =>
                    r.Equals("Gerente CA", StringComparison.OrdinalIgnoreCase) ||
                    r.Equals("Gerente UA", StringComparison.OrdinalIgnoreCase)))
                {
                    var colaborador = await _context.Colaboradores
                        .FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());

                    if (colaborador != null)
                    {
                        gerentes.Add(new
                        {
                            id = user.Id,
                            nome = colaborador.Nome
                        });
                    }
                }
            }

            return gerentes;
        }

        private List<System.Security.Claims.Claim> GetDefaultClaimsForRole(string roleName)
        {
            return roleName switch
            {
                "Admin" => new List<System.Security.Claims.Claim> { new("CanManageAll", "true") },
                "Gerente CA" => new List<System.Security.Claims.Claim>
                {
                    new("CanViewCA", "true"),
                    new("CanManageSubordinatesPosts", "true"),
                    new("CanManageOwnPosts", "true")
                },
                "Gerente UA" => new List<System.Security.Claims.Claim>
                {
                    new("CanViewUA", "true"),
                    new("CanManageSubordinatesPosts", "true"),
                    new("CanManageOwnPosts", "true")
                },
                "Analista CA" => new List<System.Security.Claims.Claim>
                {
                    new("CanViewCA", "true"),
                    new("CanManageOwnPosts", "true"),
                    new("CanViewCrossUA", "true")
                },
                "Analista UA" => new List<System.Security.Claims.Claim>
                {
                    new("CanViewUA", "true"),
                    new("CanManageOwnPosts", "true"),
                    new("CanViewCrossUA", "true")
                },
                "Assistente CA" => new List<System.Security.Claims.Claim>
                {
                    new("CanViewCA", "true"),
                    new("CanManageOwnPosts", "true"),
                    new("CanViewCrossUA", "true")
                },
                "Assistente UA" => new List<System.Security.Claims.Claim>
                {
                    new("CanViewUA", "true"),
                    new("CanManageOwnPosts", "true"),
                    new("CanViewCrossUA", "true")
                },
                _ => new List<System.Security.Claims.Claim>()
            };
        }

        [Authorize(Policy = "CanManageAll")]
        [HttpGet]
        public async Task<IActionResult> GetUsers(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 20,
            [FromQuery] string userName = null)
        {
            var query = _userManager.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(userName))
                query = query.Where(u => u.UserName.Contains(userName));

            query = query.OrderBy(u => u.UserName);
            var totalUsers = await query.CountAsync();
            var users = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(u => new { u.Id, u.UserName, u.Email })
                .ToListAsync();

            return Ok(new
            {
                users,
                totalPages = (int)Math.Ceiling(totalUsers / (double)limit)
            });
        }

        [Authorize(Policy = "CanManageAll")]
        [HttpGet("{id}/roles")]
        public async Task<IActionResult> GetUserRoles(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound("Usuário não encontrado.");

            var roles = await _roleManager.Roles.ToListAsync();
            var userRoles = await _userManager.GetRolesAsync(user);

            var colaborador = await _context.Colaboradores
                .FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());

            Colaborador supervisor = null;
            if (!string.IsNullOrWhiteSpace(colaborador?.SupervisorId))
            {
                var supervisorUser = await _userManager.FindByIdAsync(colaborador.SupervisorId);
                if (supervisorUser != null)
                {
                    supervisor = await _context.Colaboradores
                        .FirstOrDefaultAsync(c => c.Email.ToLower() == supervisorUser.Email.ToLower());
                }
            }

            var supervisors = await GetAllGerentesAsync();
            var userClaims = await _userManager.GetClaimsAsync(user);

            return Ok(new
            {
                id = user.Id,
                userName = user.UserName,
                email = user.Email,
                nome = colaborador?.Nome ?? "Não encontrado",
                cargo = colaborador?.Cargo ?? "Não informado",
                ua = colaborador != null ? colaborador.Centro_de_Custo.ToString() : "Não informado",
                supervisorId = colaborador?.SupervisorId,
                supervisorName = supervisor?.Nome,
                roles = roles.Select(r => new
                {
                    name = r.Name,
                    assigned = userRoles.Contains(r.Name)
                }),
                supervisors,
                claims = userClaims.Select(c => c.Type).Distinct().ToList()
            });
        }

        [Authorize(Policy = "CanManageAll")]
        [HttpPost("{id}/roles")]
        public async Task<IActionResult> UpdateUserRoles(string id, [FromBody] List<string> newRoles)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound("Usuário não encontrado.");

            var currentRoles = await _userManager.GetRolesAsync(user);
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
                return BadRequest("Erro ao remover roles existentes.");

            var addResult = await _userManager.AddToRolesAsync(user, newRoles);
            if (!addResult.Succeeded)
                return BadRequest("Erro ao adicionar novas roles.");

            return Ok("Roles atualizadas com sucesso.");
        }

        [Authorize(Policy = "CanManageAll")]
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody] UpdateUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("Usuário não encontrado");

            user.Email = dto.Email;
            user.UserName = dto.Email.Split("@")[0];
            user.NormalizedEmail = dto.Email.ToUpperInvariant();
            user.NormalizedUserName = dto.Email.ToUpperInvariant();

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            var colaborador = await _context.Colaboradores
                .FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());

            if (colaborador == null)
            {
                colaborador = new Colaborador
                {
                    Nome = dto.Nome,
                    Email = dto.Email,
                    Cargo = dto.Cargo,
                    Centro_de_Custo = dto.Centro_de_Custo,
                    SupervisorId = null
                };
                _context.Colaboradores.Add(colaborador);
            }
            else
            {
                colaborador.Nome = dto.Nome;
                colaborador.Cargo = dto.Cargo;
                colaborador.Centro_de_Custo = dto.Centro_de_Custo;
            }

            bool isSubordinate = dto.Roles.Any(r =>
                r.Contains("Analista", StringComparison.OrdinalIgnoreCase) ||
                r.Contains("Assistente", StringComparison.OrdinalIgnoreCase));

            colaborador.SupervisorId = isSubordinate ? dto.SupervisorId : null;

            await _context.SaveChangesAsync();

            var currentRoles = await _userManager.GetRolesAsync(user);
            var rolesToAdd = dto.Roles.Except(currentRoles);
            var rolesToRemove = currentRoles.Except(dto.Roles);

            var removeResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
            if (!removeResult.Succeeded) return BadRequest(removeResult.Errors);

            var addResult = await _userManager.AddToRolesAsync(user, rolesToAdd);
            if (!addResult.Succeeded) return BadRequest(addResult.Errors);

            return Ok(new { message = "Usuário atualizado com sucesso." });
        }

        [HttpGet("roles")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAuthenticatedUserRoles()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized("Usuário não autenticado.");

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new { roles });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetAuthenticatedUserInfo()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized("Usuário não autenticado.");

            var colaborador = await _context.Colaboradores
                .FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());

            if (colaborador == null)
                return NotFound("Colaborador não encontrado para o usuário autenticado.");

            var claims = await _userManager.GetClaimsAsync(user);
            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                id = user.Id,
                userName = user.UserName,
                email = user.Email,
                nome = colaborador.Nome,
                cargo = colaborador.Cargo,
                ua = colaborador.Centro_de_Custo.ToString(),
                claims = claims.Select(c => c.Type).ToList(),
                roles,
            });
        }

        [Authorize(Policy = "CanManageAll")]
        [HttpGet("gerentes")]
        public async Task<IActionResult> GetGerentes()
        {
            var supervisors = await GetAllGerentesAsync();
            return Ok(supervisors);
        }

        [Authorize(Policy = "CanManageAll")]
        [HttpPost("{id}/sync-claims")]
        public async Task<IActionResult> SyncUserClaims(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            var userClaims = await _userManager.GetClaimsAsync(user);
            var userRoles = await _userManager.GetRolesAsync(user);

            var expectedClaims = new List<System.Security.Claims.Claim>();
            foreach (var role in userRoles)
                expectedClaims.AddRange(GetDefaultClaimsForRole(role));

            expectedClaims = expectedClaims
                .GroupBy(c => new { c.Type, c.Value })
                .Select(g => g.First())
                .ToList();

            foreach (var claim in userClaims)
            {
                if (!expectedClaims.Any(c => c.Type == claim.Type && c.Value == claim.Value))
                    await _userManager.RemoveClaimAsync(user, claim);
            }

            foreach (var claim in expectedClaims)
            {
                if (!userClaims.Any(c => c.Type == claim.Type && c.Value == claim.Value))
                    await _userManager.AddClaimAsync(user, claim);
            }

            return Ok(new { message = "Claims sincronizadas com base nas roles atuais!" });
        }

        [HttpPost("{id}/photo")]
        public async Task<IActionResult> UploadUserPhoto(string id, [FromForm] UploadPhotoDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                return BadRequest("Nenhum arquivo enviado.");

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var userRoles = await _userManager.GetRolesAsync(user);
            var canManageAll = userRoles.Contains("Admin");
            var isGerenteCA = userRoles.Contains("Gerente CA");
            var isGerenteUA = userRoles.Contains("Gerente UA");
            var isSelf = user.Id == id;

            if (!canManageAll && !isGerenteCA && !isGerenteUA && !isSelf)
                return Forbid();

            var targetUser = await _userManager.FindByIdAsync(id);
            if (targetUser == null)
                return NotFound("Usuário não encontrado.");

            var colaborador = await _context.Colaboradores
                .FirstOrDefaultAsync(c => c.Email.ToLower() == targetUser.Email.ToLower());

            if (colaborador == null)
                return NotFound("Colaborador não encontrado para o usuário.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}.jpg";
            var uploadPath = Path.Combine(uploadsFolder, fileName);

            using (var image = SixLabors.ImageSharp.Image.Load(dto.File.OpenReadStream()))
            {
                image.Mutate(x => x.Resize(new SixLabors.ImageSharp.Processing.ResizeOptions
                {
                    Mode = SixLabors.ImageSharp.Processing.ResizeMode.Crop,
                    Size = new SixLabors.ImageSharp.Size(400, 400)
                }));
                image.SaveAsJpeg(uploadPath, new SixLabors.ImageSharp.Formats.Jpeg.JpegEncoder { Quality = 80 });
            }

            colaborador.PhotoUrl = $"uploads/{fileName}";
            await _context.SaveChangesAsync();

            return Ok(new { photoUrl = colaborador.PhotoUrl });
        }
    }
}
