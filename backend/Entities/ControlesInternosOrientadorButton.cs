using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Entities
{
    public class ControlesInternosOrientadorButton
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string Color { get; set; } = "#E6F4EA";
        public string TextColor { get; set; } = "#000000";
        public bool Bold { get; set; }
        public string ExternalLink { get; set; } = string.Empty;
        public int Order { get; set; }
    }
}