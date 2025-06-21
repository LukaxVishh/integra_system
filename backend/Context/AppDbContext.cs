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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Configure entity properties and relationships here if needed
        }
    }
}