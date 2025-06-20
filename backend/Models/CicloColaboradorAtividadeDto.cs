using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class CicloColaboradorAtividadeDto
    {
        public string ColaboradorEmail { get; set; }
        public string NomeTag { get; set; }
        public string Cor { get; set; }
        public string Descricao { get; set; }
    }
}