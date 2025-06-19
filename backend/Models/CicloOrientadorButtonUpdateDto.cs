using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class CicloOrientadorButtonUpdateDto
    {
        public string Text { get; set; } = string.Empty;
        public string Color { get; set; } = "#E6F4EA";
        public string TextColor { get; set; } = "#000000";
        public int Order { get; set; }
    }
}