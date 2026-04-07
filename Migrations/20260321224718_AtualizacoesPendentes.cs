using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SyncStock.Migrations
{
    /// <inheritdoc />
    public partial class AtualizacoesPendentes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "Produtos",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "Produtos");
        }
    }
}
