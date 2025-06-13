using backend.Context;
using backend.Entities;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("users")]
    [ApiController]
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

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int limit = 20)
        {
            var users = await _userManager.Users
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(u => new { u.Id, u.UserName, u.Email })
                .ToListAsync();

            var totalUsers = await _userManager.Users.CountAsync();

            return Ok(new
            {
                users,
                totalPages = (int)Math.Ceiling(totalUsers / (double)limit)
            });
        }

        [HttpGet("{id}/roles")]
        public async Task<IActionResult> GetUserRoles(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound("Usuário não encontrado.");

            var roles = await _roleManager.Roles.ToListAsync();
            var userRoles = await _userManager.GetRolesAsync(user);

            // Buscar colaborador pelo e-mail do Identity
            var colaborador = await _context.Colaboradores
                .FirstOrDefaultAsync(c => c.Email.ToLower() == user.Email.ToLower());

            return Ok(new
            {
                id = user.Id,
                userName = user.UserName,
                email = user.Email,
                nome = colaborador?.Nome ?? "Não encontrado",
                cargo = colaborador?.Cargo ?? "Não informado",
                ua = colaborador?.UA ?? "Não informada",
                roles = roles.Select(r => new
                {
                    name = r.Name,
                    assigned = userRoles.Contains(r.Name)
                })
            });
        }

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

        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody] UpdateUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("Usuário não encontrado");

            // Atualizar Email e UserName no IdentityUser (UserName = LDAP)
            user.Email = dto.Email;
            user.UserName = dto.Email.Split("@")[0];
            user.NormalizedEmail = dto.Email.ToUpperInvariant();
            user.NormalizedUserName = dto.Email.ToUpperInvariant();

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            // Atualizar tabela Colaboradores
            var colaborador = _context.Colaboradores.FirstOrDefault(c => c.Email == dto.Email);
            if (colaborador == null)
            {
                // Se não existe, criar novo registro (opcional)
                colaborador = new Colaborador
                {
                    Nome = dto.Nome,
                    Email = dto.Email,
                    Cargo = dto.Cargo,
                    UA = dto.UA
                };
                _context.Colaboradores.Add(colaborador);
            }
            else
            {
                colaborador.Nome = dto.Nome;
                colaborador.Cargo = dto.Cargo;
                colaborador.UA = dto.UA;
                _context.Colaboradores.Update(colaborador);
            }

            await _context.SaveChangesAsync();

            // Atualizar Roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            var rolesToAdd = dto.Roles.Except(currentRoles);
            var rolesToRemove = currentRoles.Except(dto.Roles);

            // Remover roles antigas
            var removeResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
            if (!removeResult.Succeeded) return BadRequest(removeResult.Errors);

            // Adicionar roles novas
            var addResult = await _userManager.AddToRolesAsync(user, rolesToAdd);
            if (!addResult.Succeeded) return BadRequest(addResult.Errors);

            return Ok(new { message = "Usuário atualizado com sucesso." });
        }
        
        [HttpGet("roles")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAuthenticatedUserRoles()
        {
            // Obtém o usuário autenticado
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized("Usuário não autenticado.");

            // Obtém as roles do usuário
            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new { roles });
        }
    }
}
