using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Revert_CicloOrganogramav1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.CreateTable(
                name: "NegociosColaboradorAtividades",
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
                    table.PrimaryKey("PK_NegociosColaboradorAtividades", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NegociosOrientadorButtons",
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
                    table.PrimaryKey("PK_NegociosOrientadorButtons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NegociosOrientadorTables",
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
                    table.PrimaryKey("PK_NegociosOrientadorTables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NegociosOrientadorTables_CicloOrientadorButtons_ButtonId",
                        column: x => x.ButtonId,
                        principalTable: "CicloOrientadorButtons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NegociosPosts",
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
                    table.PrimaryKey("PK_NegociosPosts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NegociosOrientadorTables_ButtonId",
                table: "NegociosOrientadorTables",
                column: "ButtonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NegociosColaboradorAtividades");

            migrationBuilder.DropTable(
                name: "NegociosOrientadorButtons");

            migrationBuilder.DropTable(
                name: "NegociosOrientadorTables");

            migrationBuilder.DropTable(
                name: "NegociosPosts");

            migrationBuilder.CreateTable(
                name: "CicloOrganograma",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataJson = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CicloOrganograma", x => x.Id);
                });
        }
    }
}
