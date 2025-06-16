using Microsoft.AspNetCore.Http;

namespace backend.Models
{
    public class PostCreateDto
    {
        public string Author { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public IFormFile File { get; set; }
    }
}
