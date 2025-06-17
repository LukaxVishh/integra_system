using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace backend.Authorization
{
    public class CanManagePostsRequirement : IAuthorizationRequirement
    {
        // Contrato entre policy e handler, pode receber parâmetros se necessário
        public CanManagePostsRequirement() { }
    }
}