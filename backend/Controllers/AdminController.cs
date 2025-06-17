using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("admin")]
    [Authorize(Policy = "CanManageAll")] // ✅ Só Admin por padrão
    public class AdminController : Controller
    {
        private readonly UserManager<IdentityUser> _userManager;

        public AdminController(UserManager<IdentityUser> userManager)
        {
            _userManager = userManager;
        }

        private List<System.Security.Claims.Claim> GetDefaultClaimsForRole(string roleName)
        {
            return roleName switch
            {
                "Admin" => new List<System.Security.Claims.Claim> { new("CanManageAll", "true") },
                "Gerente CA" => new List<System.Security.Claims.Claim>
                {
                    new("CanViewCA", "true"),
                    new("CanManageSubordinatesPosts", "true")
                },
                "Gerente UA" => new List<System.Security.Claims.Claim>
                {
                    new("CanViewUA", "true"),
                    new("CanManageSubordinatesPosts", "true")
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

        [HttpGet("users")]
        [Authorize(Policy = "CanManageAll")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = _userManager.Users.ToList();
            var result = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add(new { user.Id, user.Email, Roles = roles });
            }

            return Ok(result);
        }

        [HttpPost("grant-role")]
        [Authorize(Policy = "CanManageAll")]
        public async Task<IActionResult> GrantRole([FromBody] RoleUpdateRequest model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null) return NotFound();

            if (!await _userManager.IsInRoleAsync(user, model.Role))
            {
                await _userManager.AddToRoleAsync(user, model.Role);

                var defaultClaims = GetDefaultClaimsForRole(model.Role);
                var userClaims = await _userManager.GetClaimsAsync(user);

                foreach (var claim in defaultClaims)
                {
                    if (!userClaims.Any(c => c.Type == claim.Type && c.Value == claim.Value))
                        await _userManager.AddClaimAsync(user, claim);
                }
            }

            return Ok(new { message = "Role atribuída e claims padrão sincronizadas!" });
        }

        [HttpPost("revoke-role")]
        [Authorize(Policy = "CanManageAll")]
        public async Task<IActionResult> RevokeRole([FromBody] RoleUpdateRequest model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null) return NotFound();

            if (await _userManager.IsInRoleAsync(user, model.Role))
            {
                await _userManager.RemoveFromRoleAsync(user, model.Role);

                var defaultClaims = GetDefaultClaimsForRole(model.Role);
                foreach (var claim in defaultClaims)
                {
                    await _userManager.RemoveClaimAsync(user, claim);
                }
            }

            return Ok(new { message = "Role revogada e claims padrão removidas!" });
        }

        [HttpPost("grant-claim")]
        [Authorize(Policy = "CanManageAll")]
        public async Task<IActionResult> GrantClaim([FromBody] ClaimUpdateRequest model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null) return NotFound();

            var claim = new System.Security.Claims.Claim(model.Claim.Type, model.Claim.Value);
            var result = await _userManager.AddClaimAsync(user, claim);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Claim concedida manualmente!" });
        }

        [HttpPost("revoke-claim")]
        [Authorize(Policy = "CanManageAll")]
        public async Task<IActionResult> RevokeClaim([FromBody] ClaimUpdateRequest model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null) return NotFound();

            var claim = new System.Security.Claims.Claim(model.Claim.Type, model.Claim.Value);
            var result = await _userManager.RemoveClaimAsync(user, claim);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Claim revogada manualmente!" });
        }

        [HttpGet("{id}/claims")]
        [Authorize(Policy = "CanManageAll")]
        public async Task<IActionResult> GetUserClaims(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            var claims = await _userManager.GetClaimsAsync(user);
            return Ok(claims.Select(c => new { c.Type, c.Value }));
        }

        [HttpPost("{id}/sync-claims")]
        [Authorize(Policy = "CanManageAll")]
        public async Task<IActionResult> SyncClaims(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            var roles = await _userManager.GetRolesAsync(user);
            var expectedClaims = new List<System.Security.Claims.Claim>();

            foreach (var role in roles)
                expectedClaims.AddRange(GetDefaultClaimsForRole(role));

            expectedClaims = expectedClaims.DistinctBy(c => c.Type).ToList();
            var userClaims = await _userManager.GetClaimsAsync(user);

            // Remove apenas claims padrão
            foreach (var claim in userClaims)
            {
                if (GetDefaultClaimsForRole(claim.Type).Any())
                {
                    await _userManager.RemoveClaimAsync(user, claim);
                }
            }

            // Adiciona os corretos
            foreach (var claim in expectedClaims)
            {
                if (!userClaims.Any(c => c.Type == claim.Type && c.Value == claim.Value))
                {
                    await _userManager.AddClaimAsync(user, claim);
                }
            }

            return Ok(new { message = "Claims sincronizados com sucesso!", claims = expectedClaims });
        }
    }
}
