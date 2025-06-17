using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Context;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Authorize(Policy = "CanManageAll")]
    [Route("roles")]
    [ApiController]
    public class RoleController : Controller
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly AppDbContext _context;

        public RoleController(RoleManager<IdentityRole> roleManager, AppDbContext context)
        {
            _context = context;
            _roleManager = roleManager;
        }

        /// <summary>
        /// Define as Claims padrão para cada Role pré-definida.
        /// </summary>
        private List<string> GetDefaultClaimsForRole(string roleName)
        {
            return roleName switch
            {
                "Admin" => new List<string> { "CanManageAll", "CanManageOwnPosts" },
                "Gerente CA" => new List<string> { "CanViewCA", "CanManageSubordinatesPosts", "CanManageOwnPosts" },
                "Gerente UA" => new List<string> { "CanViewUA", "CanManageSubordinatesPosts", "CanManageOwnPosts" },
                "Analista CA" => new List<string> { "CanViewCA", "CanManageOwnPosts" },
                "Analista UA" => new List<string> { "CanViewUA", "CanManageOwnPosts" },
                "Assistente CA" => new List<string> { "CanViewCA", "CanManageOwnPosts" },
                "Assistente UA" => new List<string> { "CanViewUA", "CanManageOwnPosts" },
                _ => new List<string>() // Vazio para Roles customizadas
            };
        }

        /// <summary>
        /// Lista todas as Roles com suas Claims associadas.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var roles = _roleManager.Roles.ToList();
            var result = new List<object>();

            foreach (var role in roles)
            {
                var claims = await _roleManager.GetClaimsAsync(role);
                result.Add(new
                {
                    id = role.Id,
                    name = role.Name,
                    claims = claims.Select(c => c.Type).ToList()
                });
            }

            return Ok(new { roles = result });
        }

        [HttpGet("claims")]
        public async Task<IActionResult> GetAllClaims()
        {
            // 📌 Claims fixas que voce usa no switch
            var fixedClaims = new List<string>
            {
                "CanManageAll",
                "CanViewCA",
                "CanViewUA",
                "CanManageSubordinatesPosts",
                "CanManageOwnPosts",
                "CanViewCrossUA"
            };

            var available = await _context.AvailableClaims
                .Select(c => c.Name)
                .ToListAsync();

            var roleClaims = await _context.RoleClaims
                .Select(rc => rc.ClaimType)
                .Distinct()
                .ToListAsync();

            var allClaims = fixedClaims
                .Union(available)
                .Union(roleClaims)
                .Distinct()
                .OrderBy(x => x)
                .ToList();

            return Ok(allClaims);
        }


        /// <summary>
        /// Retorna as Claims vinculadas a uma Role específica.
        /// </summary>
        [HttpGet("{id}/claims")]
        public async Task<IActionResult> GetRoleClaims(string id)
        {
            var role = await _roleManager.FindByIdAsync(id);
            if (role == null)
                return NotFound(new { message = "Permissão não encontrada." });

            var claims = await _roleManager.GetClaimsAsync(role);
            return Ok(claims.Select(c => c.Type));
        }

        /// <summary>
        /// Cria uma nova Role com Claims padrão ou customizadas.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] RoleWithClaimsDto model)
        {
            if (string.IsNullOrWhiteSpace(model.Name))
                return BadRequest(new { message = "O nome da permissão é obrigatório." });

            if (await _roleManager.RoleExistsAsync(model.Name))
                return BadRequest(new { message = "Já existe uma permissão com esse nome." });

            var newRole = new IdentityRole(model.Name);
            var result = await _roleManager.CreateAsync(newRole);
            if (!result.Succeeded)
                return BadRequest(new { message = "Erro ao criar permissão.", errors = result.Errors });

            var claimsToAdd = model.Claims?.Any() == true
                ? model.Claims
                : GetDefaultClaimsForRole(newRole.Name);

            foreach (var claim in claimsToAdd.Distinct())
            {
                await _roleManager.AddClaimAsync(newRole, new System.Security.Claims.Claim(claim, "true"));
            }

            return Ok(new { message = "Permissão criada com sucesso." });
        }

        /// <summary>
        /// Atualiza o nome e Claims de uma Role existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(string id, [FromBody] RoleWithClaimsDto model)
        {
            var role = await _roleManager.FindByIdAsync(id);
            if (role == null)
                return NotFound(new { message = "Permissão não encontrada." });

            if (string.IsNullOrWhiteSpace(model.Name))
                return BadRequest(new { message = "Nome da permissão é obrigatório." });

            role.Name = model.Name;
            var result = await _roleManager.UpdateAsync(role);
            if (!result.Succeeded)
                return BadRequest(new { message = "Erro ao atualizar permissão.", errors = result.Errors });

            // ✅ Remove claims antigas
            var currentClaims = await _roleManager.GetClaimsAsync(role);
            foreach (var claim in currentClaims)
                await _roleManager.RemoveClaimAsync(role, claim);

            // ✅ Adiciona novas
            if (model.Claims?.Any() == true)
            {
                foreach (var claim in model.Claims.Distinct())
                    await _roleManager.AddClaimAsync(role, new System.Security.Claims.Claim(claim, "true"));
            }

            return Ok(new { message = "Permissão atualizada com sucesso." });
        }


        /// <summary>
        /// Deleta uma Role.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(string id)
        {
            var role = await _roleManager.FindByIdAsync(id);
            if (role == null)
                return NotFound(new { message = "Permissão não encontrada." });

            var result = await _roleManager.DeleteAsync(role);
            if (!result.Succeeded)
                return BadRequest(new { message = "Erro ao excluir permissão.", errors = result.Errors });

            return Ok(new { message = "Permissão excluída com sucesso." });
        }
    }
}
