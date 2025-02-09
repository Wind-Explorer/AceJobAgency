using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AceJobAgency.Migrations
{
    /// <inheritdoc />
    public partial class AddedAccountLockoutFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FailedLoginAttempts",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsLockedOut",
                table: "Users",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LockoutEndTime",
                table: "Users",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FailedLoginAttempts",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsLockedOut",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LockoutEndTime",
                table: "Users");
        }
    }
}
