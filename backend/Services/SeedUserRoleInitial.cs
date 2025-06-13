using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace backend.Services
{
    public class SeedUserRoleInitial : ISeedUserRoleInitial
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public SeedUserRoleInitial(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task SeedRolesAsync()
        {
            var roles = new List<string>
            {
                "Admin",
                "Gerente-CA",
                "Gerente-UA",
                "Assesor",
                "Analista",
                "Assistente"
            };

            foreach (var roleName in roles)
            {
                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    var role = new IdentityRole
                    {
                        Name = roleName,
                        NormalizedName = roleName.ToUpperInvariant(),
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    };

                    await _roleManager.CreateAsync(role);
                }
            }
        }

        public async Task SeedUsersAsync()
        {
            var usersToSeed = new List<(string Email, string Password, string Role)>
            {
                ("admin@empresa.com", "Senha@123", "Admin"),
                ("gerente@empresa.com", "Senha@123", "Gerente-CA"),
                ("analista@empresa.com", "Senha@123", "Analista")
            };

            foreach (var (email, password, role) in usersToSeed)
            {
                await CreateUserAsync(email, password, role);
            }
        }

        
        public async Task CreateUserAsync(string email, string password, string role)
        {
            if (!await _roleManager.RoleExistsAsync(role))
                throw new Exception($"A role '{role}' não existe.");

            if (await _userManager.FindByEmailAsync(email) == null)
            {
                var user = new IdentityUser
                {
                    UserName = email,
                    Email = email,
                    NormalizedUserName = email.ToUpperInvariant(),
                    NormalizedEmail = email.ToUpperInvariant(),
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString()
                };

                var result = await _userManager.CreateAsync(user, password);

                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(user, role);
                }
                else
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new Exception($"Erro ao criar usuário {email}: {errors}");
                }
            }
        }
    }
}