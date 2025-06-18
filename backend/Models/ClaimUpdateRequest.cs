using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class ClaimUpdateRequest
    {
        public string UserId { get; set; }
        public ClaimDto Claim { get; set; } = new();
    }
}