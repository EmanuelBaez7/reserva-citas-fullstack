using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ObsidianArchitect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "app_settings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    default_appointment_duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    buffer_time_minutes = table.Column<int>(type: "integer", nullable: false),
                    default_station_capacity = table.Column<int>(type: "integer", nullable: false),
                    allow_dynamic_scaling = table.Column<bool>(type: "boolean", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_app_settings", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "profiles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    full_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    avatar_url = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_profiles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "schedule_days",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    is_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    morning_shift_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    afternoon_shift_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    evening_shift_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_schedule_days", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "service_stations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    description = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_service_stations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    profile_id = table.Column<Guid>(type: "uuid", nullable: true),
                    action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                    details = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    ip_address = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    status_label = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_logs", x => x.id);
                    table.ForeignKey(
                        name: "FK_audit_logs_profiles_profile_id",
                        column: x => x.profile_id,
                        principalTable: "profiles",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "time_slots",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    schedule_day_id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_station_id = table.Column<Guid>(type: "uuid", nullable: true),
                    shift = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    start_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    end_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    capacity = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    booked_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_time_slots", x => x.id);
                    table.ForeignKey(
                        name: "FK_time_slots_schedule_days_schedule_day_id",
                        column: x => x.schedule_day_id,
                        principalTable: "schedule_days",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_time_slots_service_stations_service_station_id",
                        column: x => x.service_station_id,
                        principalTable: "service_stations",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "appointments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    booking_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    time_slot_id = table.Column<Guid>(type: "uuid", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    start_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    end_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    notes = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                    cancellation_reason = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_appointments", x => x.id);
                    table.ForeignKey(
                        name: "FK_appointments_profiles_profile_id",
                        column: x => x.profile_id,
                        principalTable: "profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_appointments_time_slots_time_slot_id",
                        column: x => x.time_slot_id,
                        principalTable: "time_slots",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "app_settings",
                columns: new[] { "id", "allow_dynamic_scaling", "buffer_time_minutes", "default_appointment_duration_minutes", "default_station_capacity", "is_active", "updated_at" },
                values: new object[] { new Guid("b2c3d4e5-f6a7-8901-bcde-f12345678901"), false, 5, 45, 1, true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.InsertData(
                table: "profiles",
                columns: new[] { "id", "avatar_url", "created_at", "email", "full_name", "is_active", "password_hash", "role", "updated_at" },
                values: new object[] { new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@obsidian.io", "Obsidian Admin", true, "$2a$11$0ZlYDZAqqek7suKDm3QJLup6BEn3dbKxj67bOKLxQwH7DBFOwRw/K", "Admin", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.InsertData(
                table: "service_stations",
                columns: new[] { "id", "created_at", "description", "is_active", "name" },
                values: new object[] { new Guid("c3d4e5f6-a7b8-9012-cdef-123456789012"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Primary consultation studio", true, "The Obsidian Hub" });

            migrationBuilder.CreateIndex(
                name: "IX_appointments_booking_code",
                table: "appointments",
                column: "booking_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_appointments_profile_id_date",
                table: "appointments",
                columns: new[] { "profile_id", "date" });

            migrationBuilder.CreateIndex(
                name: "IX_appointments_time_slot_id",
                table: "appointments",
                column: "time_slot_id");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_action",
                table: "audit_logs",
                column: "action");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_created_at",
                table: "audit_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_profile_id",
                table: "audit_logs",
                column: "profile_id");

            migrationBuilder.CreateIndex(
                name: "IX_profiles_email",
                table: "profiles",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_schedule_days_date",
                table: "schedule_days",
                column: "date",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_time_slots_schedule_day_id_start_time_shift",
                table: "time_slots",
                columns: new[] { "schedule_day_id", "start_time", "shift" });

            migrationBuilder.CreateIndex(
                name: "IX_time_slots_service_station_id",
                table: "time_slots",
                column: "service_station_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "app_settings");

            migrationBuilder.DropTable(
                name: "appointments");

            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropTable(
                name: "time_slots");

            migrationBuilder.DropTable(
                name: "profiles");

            migrationBuilder.DropTable(
                name: "schedule_days");

            migrationBuilder.DropTable(
                name: "service_stations");
        }
    }
}
