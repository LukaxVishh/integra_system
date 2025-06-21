using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Entities
{
    public class CooperativismoPost
    {
        public int Id { get; set; }
        public string AuthorId { get; set; }
        public string AuthorName { get; set; }
        public string AuthorCargo { get; set; }
        public string Content { get; set; }
        public string MediaPath { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Visibility { get; set; }
    }
}