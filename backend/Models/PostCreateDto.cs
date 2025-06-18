using Microsoft.AspNetCore.Http;

namespace backend.Models
{
    public class PostCreateDto
    {
        public string AuthorName { get; set; }
        public string AuthorCargo { get; set; }
        public string Content { get; set; } = string.Empty;
        public IFormFile File { get; set; }
        public string Visibility { get; set; }
    }
}
