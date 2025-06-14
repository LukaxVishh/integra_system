using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace backend.Controllers
{
    [Authorize(Roles = "Admin, Gerente CA")]
    [Route("roles")]
    [ApiController]
    public class RoleController : Controller
    {
        private readonly RoleManager<IdentityRole> _roleManager;

        public RoleController(RoleManager<IdentityRole> roleManager)
        {
            _roleManager = roleManager;
        }

        // GET: /role
        [HttpGet]
        [Authorize(Roles = "Admin, Gerente CA")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await Task.Run(() => _roleManager.Roles.Select(r => new { r.Id, r.Name }).ToList());
            return Ok(new { roles });
        }

        // POST: /role
        [HttpPost]
        [Authorize(Roles = "Admin, Gerente CA")]
        public async Task<IActionResult> CreateRole([FromBody] RoleDto model)
        {
            if (string.IsNullOrWhiteSpace(model.Name))
                return BadRequest(new { message = "O nome da permissão é obrigatório." });

            if (await _roleManager.RoleExistsAsync(model.Name))
                return BadRequest(new { message = "Já existe uma permissão com esse nome." });

            var result = await _roleManager.CreateAsync(new IdentityRole(model.Name));
            if (result.Succeeded)
                return Ok(new { message = "Permissão criada com sucesso." });

            return BadRequest(new { message = "Erro ao criar permissão.", errors = result.Errors });
        }

        // PUT: /role/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Gerente CA")]
        public async Task<IActionResult> UpdateRole(string id, [FromBody] RoleDto model)
        {
            var role = await _roleManager.FindByIdAsync(id);
            if (role == null)
                return NotFound(new { message = "Permissão não encontrada." });

            if (string.IsNullOrWhiteSpace(model.Name))
                return BadRequest(new { message = "O nome da permissão é obrigatório." });

            role.Name = model.Name;
            var result = await _roleManager.UpdateAsync(role);
            if (result.Succeeded)
                return Ok(new { message = "Permissão atualizada com sucesso." });

            return BadRequest(new { message = "Erro ao atualizar permissão.", errors = result.Errors });
        }

        // DELETE: /role/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteRole(string id)
        {
            var role = await _roleManager.FindByIdAsync(id);
            if (role == null)
                return NotFound(new { message = "Permissão não encontrada." });

            var result = await _roleManager.DeleteAsync(role);
            if (result.Succeeded)
                return Ok(new { message = "Permissão excluída com sucesso." });

            return BadRequest(new { message = "Erro ao excluir permissão.", errors = result.Errors });
        }
    }
}
