using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class UploadPhotoDto
    {
        public IFormFile File { get; set; }
    }
}