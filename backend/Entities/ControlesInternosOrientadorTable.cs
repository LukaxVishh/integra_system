using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Entities
{
    public class ControlesInternosOrientadorTable
    {
        public int Id { get; set; }
        public int ButtonId { get; set; }
        public CicloOrientadorButton Button { get; set; }
        public string DataJson { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}