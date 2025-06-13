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
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("admin")]
    public class AdminController : Controller
    {
        private readonly UserManager<IdentityUser> _userManager;

        public AdminController(UserManager<IdentityUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = _userManager.Users.ToList();

            var result = new List<object>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add(new
                {
                    user.Id,
                    user.Email,
                    Roles = roles
                });
            }

            return Ok(result);
        }

        [HttpPost("grant-role")]
        public async Task<IActionResult> GrantRole([FromBody] RoleUpdateRequest model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null) return NotFound();

            if (!await _userManager.IsInRoleAsync(user, model.Role))
            {
                await _userManager.AddToRoleAsync(user, model.Role);
            }

            return Ok();
        }

        [HttpPost("revoke-role")]
        public async Task<IActionResult> RevokeRole([FromBody] RoleUpdateRequest model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null) return NotFound();

            if (await _userManager.IsInRoleAsync(user, model.Role))
            {
                await _userManager.RemoveFromRoleAsync(user, model.Role);
            }

            return Ok();
        }
    }
}