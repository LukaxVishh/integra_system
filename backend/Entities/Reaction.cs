using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities
{
    public class Reaction
    {
        [Key]
        public int Id { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        [ForeignKey("Post")]
        public int PostId { get; set; }
        public Post Post { get; set; } = null!;
    }
}
