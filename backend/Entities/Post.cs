using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Entities
{
    public class Post
    {
        [Key]
        public int Id { get; set; }
        public string AuthorId { get; set; }

        public string AuthorName { get; set; } = string.Empty;
        public string AuthorCargo { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;

        public string MediaPath { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<Reaction> Reactions { get; set; } = new();
        public List<Comment> Comments { get; set; } = new();
    }
}