using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class PostUpdateDto
    {
        public string Content { get; set; } = string.Empty;
        public string AuthorCargo { get; set; } = string.Empty;
    }
}