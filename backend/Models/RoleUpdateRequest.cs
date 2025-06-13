using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class RoleUpdateRequest
    {
        public string UserId { get; set; }
        public string Role { get; set; }
    }
}