using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using backend.Context;
using backend.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Controllers
{
[Route("claims")]
    [ApiController]
    [Authorize(Policy = "CanManageAll")] // só admin pode
    public class ClaimsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClaimsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetClaims()
        {
            // Claims salvas manualmente pelo admin
            var available = await _context.AvailableClaims
                .Select(c => c.Name)
                .ToListAsync();

            // Claims que já estão ligadas a alguma role (AspNetRoleClaims)
            var roleClaims = await _context.RoleClaims
                .Select(rc => rc.ClaimType)
                .Distinct()
                .ToListAsync();

            // Claims que são fixas no código
            var fixedClaims = new List<string>
            {
                "CanViewCA",
                "CanViewUA",
                "CanViewCrossUA",
                "CanManageOwnPosts",
                "CanManageSubordinatesPosts",
                "CanManageAll",
                "AdminAccess"
            };

            // Unir tudo
            var allClaims = available
                .Union(roleClaims)
                .Union(fixedClaims)
                .Distinct()
                .OrderBy(x => x)
                .ToList();

            return Ok(allClaims);
        }



        [HttpPost]
        public async Task<IActionResult> CreateClaim([FromBody] string claimName)
        {
            if (string.IsNullOrWhiteSpace(claimName))
                return BadRequest("Claim name is required.");

            if (await _context.AvailableClaims.AnyAsync(c => c.Name == claimName))
                return BadRequest("Claim already exists.");

            _context.AvailableClaims.Add(new AvailableClaim { Name = claimName });
            await _context.SaveChangesAsync();

            return Ok("Claim created.");
        }

        [HttpDelete("{name}")]
        public async Task<IActionResult> DeleteClaim(string name)
        {
            var claim = await _context.AvailableClaims
                .FirstOrDefaultAsync(c => c.Name == name);

            if (claim == null)
                return NotFound("Claim not found.");

            _context.AvailableClaims.Remove(claim);
            await _context.SaveChangesAsync();

            return Ok("Claim deleted.");
        }
    }
}