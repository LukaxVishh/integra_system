using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Entities
{
    public class CicloColaboradorAtividade
    {
        public int Id { get; set; }
        public string ColaboradorEmail { get; set; }
        public string NomeTag { get; set; }
        public string Cor { get; set; }
        public string Descricao { get; set; }
        public DateTime DataInicio { get; set; } = DateTime.UtcNow;
        public DateTime? DataFim { get; set; }
    }
}