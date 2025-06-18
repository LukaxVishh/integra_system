using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePostAuthorFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Author",
                table: "Posts",
                newName: "AuthorName");

            migrationBuilder.AddColumn<string>(
                name: "AuthorCargo",
                table: "Posts",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AuthorCargo",
                table: "Posts");

            migrationBuilder.RenameColumn(
                name: "AuthorName",
                table: "Posts",
                newName: "Author");
        }
    }
}
