using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Entities
{
    public class Colaborador
    {
        public int Id { get; set; }
        [Required, MaxLength(100, ErrorMessage = "O nome do colaborador deve ter no máximo 100 caracteres.")]
        public string Nome { get; set; }
        [Required, EmailAddress(ErrorMessage = "O e-mail coorporativo deve ser informado.")]
        public string Email { get; set; }
        public string Cargo { get; set; }
        public string UA  { get; set; }

    }
}