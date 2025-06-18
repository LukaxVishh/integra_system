using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace backend.Configurations
{
    public class DynamicAuthorizationPolicyProvider : IAuthorizationPolicyProvider
    {
        // Provider padrão (fallback)
        private readonly DefaultAuthorizationPolicyProvider FallbackPolicyProvider;

        public DynamicAuthorizationPolicyProvider(IOptions<AuthorizationOptions> options)
        {
            FallbackPolicyProvider = new DefaultAuthorizationPolicyProvider(options);
        }

        public Task<AuthorizationPolicy> GetDefaultPolicyAsync()
            => FallbackPolicyProvider.GetDefaultPolicyAsync();

        public Task<AuthorizationPolicy> GetFallbackPolicyAsync()
            => FallbackPolicyProvider.GetFallbackPolicyAsync();

        public Task<AuthorizationPolicy> GetPolicyAsync(string policyName)
        {
            // Aqui aceita QUALQUER policy dinamicamente: assume que policyName é o nome de uma claim
            var policy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .RequireClaim(policyName, "true")
                .Build();

            return Task.FromResult(policy);
        }
    }
}