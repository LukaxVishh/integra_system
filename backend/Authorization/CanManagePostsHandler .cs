using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace backend.Authorization
{
    public class CanManagePostsHandler : AuthorizationHandler<CanManagePostsRequirement>
    {
        protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, 
        CanManagePostsRequirement requirement)
        {
            // Verifica se o usuário tem qualquer uma das condições:
            var hasManageAll = context.User.HasClaim(c => 
                c.Type == "CanManageAll" && c.Value == "true") 
                || context.User.IsInRole("Admin");

            var hasManageOwn = context.User.HasClaim(c => 
                c.Type == "CanManageOwnPosts" && c.Value == "true");

            var hasManageSubordinates = context.User.HasClaim(c => 
                c.Type == "CanManageSubordinatesPosts" && c.Value == "true");

            if (hasManageAll || hasManageOwn || hasManageSubordinates)
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}