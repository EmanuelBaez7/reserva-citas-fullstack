using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ObsidianArchitect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "profiles",
                keyColumn: "id",
                keyValue: new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
                column: "password_hash",
                value: "$2a$11$k1c.5O1T3I.6O4uR.K3B4ey4r.p5r8G9y5P8j2t4O0P9r3k5O.v5C");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "profiles",
                keyColumn: "id",
                keyValue: new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
                column: "password_hash",
                value: "$2a$11$0ZlYDZAqqek7suKDm3QJLup6BEn3dbKxj67bOKLxQwH7DBFOwRw/K");
        }
    }
}
