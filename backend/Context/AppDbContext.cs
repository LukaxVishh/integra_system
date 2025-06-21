using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Context
{
    public class AppDbContext : IdentityDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Colaborador> Colaboradores { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Reaction> Reactions { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<AvailableClaim> AvailableClaims { get; set; } = null!;
        public DbSet<CicloPost> CicloPosts { get; set; }
        public DbSet<CicloOrientadorButton> CicloOrientadorButtons { get; set; }
        public DbSet<CicloOrientadorTable> CicloOrientadorTables { get; set; }
        public DbSet<CicloColaboradorAtividade> CicloColaboradorAtividades { get; set; }
        public DbSet<NegociosPost> NegociosPosts { get; set; }
        public DbSet<NegociosOrientadorButton> NegociosOrientadorButtons { get; set; }
        public DbSet<NegociosOrientadorTable> NegociosOrientadorTables { get; set; }
        public DbSet<NegociosColaboradorAtividade> NegociosColaboradorAtividades { get; set; }
        public DbSet<ControlesInternosPost> ControlesInternosPosts { get; set; }
        public DbSet<ControlesInternosOrientadorButton> ControlesInternosOrientadorButtons { get; set; }
        public DbSet<ControlesInternosOrientadorTable> ControlesInternosOrientadorTables { get; set; }
        public DbSet<ControlesInternosColaboradorAtividade> ControlesInternosColaboradorAtividades { get; set; }
        public DbSet<OperacoesPost> OperacoesPosts { get; set; }
        public DbSet<OperacoesOrientadorButton> OperacoesOrientadorButtons { get; set; }
        public DbSet<OperacoesOrientadorTable> OperacoesOrientadorTables { get; set; }
        public DbSet<OperacoesColaboradorAtividade> OperacoesColaboradorAtividades { get; set; }
        public DbSet<ProcessosPost> ProcessosPosts { get; set; }
        public DbSet<ProcessosOrientadorButton> ProcessosOrientadorButtons { get; set; }
        public DbSet<ProcessosOrientadorTable> ProcessosOrientadorTables { get; set; }
        public DbSet<ProcessosColaboradorAtividade> ProcessosColaboradorAtividades { get; set; }
        public DbSet<ServicosCompartilhadosPost> ServicosCompartilhadosPosts { get; set; }
        public DbSet<ServicosCompartilhadosOrientadorButton> ServicosCompartilhadosOrientadorButtons { get; set; }
        public DbSet<ServicosCompartilhadosOrientadorTable> ServicosCompartilhadosOrientadorTables { get; set; }
        public DbSet<ServicosCompartilhadosColaboradorAtividade> ServicosCompartilhadosColaboradorAtividades { get; set; }
        public DbSet<CooperativismoPost> CooperativismoPosts { get; set; }
        public DbSet<CooperativismoOrientadorButton> CooperativismoOrientadorButtons { get; set; }
        public DbSet<CooperativismoOrientadorTable> CooperativismoOrientadorTables { get; set; }
        public DbSet<CooperativismoColaboradorAtividade> CooperativismoColaboradorAtividades { get; set; }
        public DbSet<PessoasCulturaPost> PessoasCulturaPosts { get; set; }
        public DbSet<PessoasCulturaOrientadorButton> PessoasCulturaOrientadorButtons { get; set; }
        public DbSet<PessoasCulturaOrientadorTable> PessoasCulturaOrientadorTables { get; set; }
        public DbSet<PessoasCulturaColaboradorAtividade> PessoasCulturaColaboradorAtividades { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Configure entity properties and relationships here if needed
        }
    }
}