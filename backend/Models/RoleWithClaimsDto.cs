using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class RoleWithClaimsDto
    {
        public string Name { get; set; }
        public List<string> Claims { get; set; } = new();
    }
}