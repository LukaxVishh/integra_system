using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCicloOrientadorTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CicloOrientadorTables",
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
                    table.PrimaryKey("PK_CicloOrientadorTables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CicloOrientadorTables_CicloOrientadorButtons_ButtonId",
                        column: x => x.ButtonId,
                        principalTable: "CicloOrientadorButtons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CicloOrientadorTables_ButtonId",
                table: "CicloOrientadorTables",
                column: "ButtonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CicloOrientadorTables");
        }
    }
}
