using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Entities
{
    public class CicloOrientadorButton
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string Color { get; set; } = "#E6F4EA"; // cor default
        public int Order { get; set; }
    }
}