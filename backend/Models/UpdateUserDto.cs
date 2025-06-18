using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class UpdateUserDto
    {
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Cargo { get; set; }
        public int Centro_de_Custo { get; set; }
        public string[] Roles { get; set; }
        public string SupervisorId { get; set; } = string.Empty;
    }
}