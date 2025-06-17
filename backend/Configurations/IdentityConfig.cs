using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Context;
using Microsoft.AspNetCore.Identity;

namespace backend.Configurations
{
    public static class IdentityConfig
    {
        public static void AddIdentityConfiguration(this IServiceCollection services)
        {
            services.AddIdentity<IdentityUser, IdentityRole>()
                    .AddEntityFrameworkStores<AppDbContext>();
        }
    }
}

public static class AuthorizationConfig
{
    public static void AddAuthorizationConfiguration(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            // 🔑 Policy geral do Admin: só precisa da Role
            options.AddPolicy("AdminAccess", policy =>
                policy.RequireRole("Admin"));

            // 🔑 Gerente CA: Role + Claims
            options.AddPolicy("GerenteCAAccess", policy =>
            {
                policy.RequireRole("Gerente CA");
                policy.RequireClaim("CanViewCA", "true");
            });

            // 🔑 Gerente UA: Role + Claims
            options.AddPolicy("GerenteUAAccess", policy =>
            {
                policy.RequireRole("Gerente UA");
                policy.RequireClaim("CanViewUA", "true");
            });

            // 🔑 Analista CA
            options.AddPolicy("AnalistaCAAccess", policy =>
            {
                policy.RequireRole("Analista CA");
                policy.RequireClaim("CanViewCA", "true");
            });

            // 🔑 Analista UA
            options.AddPolicy("AnalistaUAAccess", policy =>
            {
                policy.RequireRole("Analista UA");
                policy.RequireClaim("CanViewUA", "true");
            });

            // 🔑 Assistente CA
            options.AddPolicy("AssistenteCAAccess", policy =>
            {
                policy.RequireRole("Assistente CA");
                policy.RequireClaim("CanViewCA", "true");
            });

            // 🔑 Assistente UA
            options.AddPolicy("AssistenteUAAccess", policy =>
            {
                policy.RequireRole("Assistente UA");
                policy.RequireClaim("CanViewUA", "true");
            });

            // 🔑 Permite ver posts liberados de outra área (CA ↔ UA)
            options.AddPolicy("CanViewCrossArea", policy =>
            {
                policy.RequireClaim("CanViewCrossUA", "true");
            });

            // 🔑 Gerente pode gerenciar posts dos subordinados
            options.AddPolicy("CanManageSubordinatesPosts", policy =>
            {
                policy.RequireClaim("CanManageSubordinatesPosts", "true");
            });

            // 🔑 Todos podem gerenciar posts próprios
            options.AddPolicy("CanManageOwnPosts", policy =>
            {
                policy.RequireClaim("CanManageOwnPosts", "true");
            });

            // 🔑 Admin gerencia tudo
            options.AddPolicy("CanManageAll", policy =>
            {
                policy.RequireRole("Admin");
            });
        });
    }
}

