using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCoopPCTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CooperativismoColaboradorAtividades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ColaboradorEmail = table.Column<string>(type: "text", nullable: true),
                    NomeTag = table.Column<string>(type: "text", nullable: true),
                    Cor = table.Column<string>(type: "text", nullable: true),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    DataInicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataFim = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CooperativismoColaboradorAtividades", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CooperativismoOrientadorButtons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Text = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<string>(type: "text", nullable: true),
                    TextColor = table.Column<string>(type: "text", nullable: true),
                    Bold = table.Column<bool>(type: "boolean", nullable: false),
                    ExternalLink = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CooperativismoOrientadorButtons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CooperativismoOrientadorTables",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ButtonId = table.Column<int>(type: "integer", nullable: false),
                    DataJson = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CooperativismoOrientadorTables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CooperativismoOrientadorTables_CicloOrientadorButtons_Butto~",
                        column: x => x.ButtonId,
                        principalTable: "CicloOrientadorButtons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CooperativismoPosts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AuthorId = table.Column<string>(type: "text", nullable: true),
                    AuthorName = table.Column<string>(type: "text", nullable: true),
                    AuthorCargo = table.Column<string>(type: "text", nullable: true),
                    Content = table.Column<string>(type: "text", nullable: true),
                    MediaPath = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Visibility = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CooperativismoPosts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PessoasCulturaColaboradorAtividades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ColaboradorEmail = table.Column<string>(type: "text", nullable: true),
                    NomeTag = table.Column<string>(type: "text", nullable: true),
                    Cor = table.Column<string>(type: "text", nullable: true),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    DataInicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataFim = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PessoasCulturaColaboradorAtividades", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PessoasCulturaOrientadorButtons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Text = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<string>(type: "text", nullable: true),
                    TextColor = table.Column<string>(type: "text", nullable: true),
                    Bold = table.Column<bool>(type: "boolean", nullable: false),
                    ExternalLink = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PessoasCulturaOrientadorButtons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PessoasCulturaOrientadorTables",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ButtonId = table.Column<int>(type: "integer", nullable: false),
                    DataJson = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PessoasCulturaOrientadorTables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PessoasCulturaOrientadorTables_CicloOrientadorButtons_Butto~",
                        column: x => x.ButtonId,
                        principalTable: "CicloOrientadorButtons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PessoasCulturaPosts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AuthorId = table.Column<string>(type: "text", nullable: true),
                    AuthorName = table.Column<string>(type: "text", nullable: true),
                    AuthorCargo = table.Column<string>(type: "text", nullable: true),
                    Content = table.Column<string>(type: "text", nullable: true),
                    MediaPath = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Visibility = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PessoasCulturaPosts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CooperativismoOrientadorTables_ButtonId",
                table: "CooperativismoOrientadorTables",
                column: "ButtonId");

            migrationBuilder.CreateIndex(
                name: "IX_PessoasCulturaOrientadorTables_ButtonId",
                table: "PessoasCulturaOrientadorTables",
                column: "ButtonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CooperativismoColaboradorAtividades");

            migrationBuilder.DropTable(
                name: "CooperativismoOrientadorButtons");

            migrationBuilder.DropTable(
                name: "CooperativismoOrientadorTables");

            migrationBuilder.DropTable(
                name: "CooperativismoPosts");

            migrationBuilder.DropTable(
                name: "PessoasCulturaColaboradorAtividades");

            migrationBuilder.DropTable(
                name: "PessoasCulturaOrientadorButtons");

            migrationBuilder.DropTable(
                name: "PessoasCulturaOrientadorTables");

            migrationBuilder.DropTable(
                name: "PessoasCulturaPosts");
        }
    }
}
