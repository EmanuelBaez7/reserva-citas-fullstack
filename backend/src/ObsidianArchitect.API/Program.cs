using System.Text.Json.Serialization;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ObsidianArchitect.API.Middleware;
using ObsidianArchitect.Application.Interfaces;
using ObsidianArchitect.Application.Services;
using ObsidianArchitect.Application.Validators;
using ObsidianArchitect.API.Services;
using ObsidianArchitect.Infrastructure.Data;
using ObsidianArchitect.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// ─── 1. DATABASE SETUP (Entity Framework / Postgres) ────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Database=obsidian_architect;Username=postgres;Password=postgres";

// ── Startup diagnostic: confirm which DB host/user the runtime is actually using ──
{
    var csb = new Npgsql.NpgsqlConnectionStringBuilder(connectionString);
    Console.WriteLine($"[DB-DIAG] Host     = {csb.Host}");
    Console.WriteLine($"[DB-DIAG] Port     = {csb.Port}");
    Console.WriteLine($"[DB-DIAG] Database = {csb.Database}");
    Console.WriteLine($"[DB-DIAG] Username = {csb.Username}");
    Console.WriteLine($"[DB-DIAG] Password = {(string.IsNullOrEmpty(csb.Password) ? "(empty)" : "****" + csb.Password[^4..])}");
    Console.WriteLine($"[DB-DIAG] SSL Mode = {csb.SslMode}");
    Console.WriteLine($"[DB-DIAG] Env      = {builder.Environment.EnvironmentName}");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options
        .UseNpgsql(connectionString, b => b.MigrationsAssembly("ObsidianArchitect.Infrastructure"))
        .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

// ─── 2. DEPENDENCY INJECTION ──────────────────────────────
builder.Services.AddHttpContextAccessor();

// Infrastructure
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// Application Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<AppointmentService>();
builder.Services.AddScoped<AdminDashboardService>();
builder.Services.AddScoped<AdminScheduleService>();
builder.Services.AddScoped<AuditLogService>();

// ─── 3. VALIDATION ────────────────────────────────────────
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

// ─── 4. AUTHENTICATION & ISSUER SETUP ─────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "ObsidianArchitectSuperSecretKeyForJWT2024!Min32Chars";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "ObsidianArchitect",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "ObsidianArchitectClient",
            IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

// ─── 5. CONTROLLERS & JSON ────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// ─── 6. CORS SETUP ─────────── ────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5500", "*") // Default local dev ports
            .AllowAnyHeader()
            .AllowAnyMethod());
});

// ─── 7. SWAGGER / OPENAPI ─────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ─── MIDDLEWARE PIPELINE ──────────────────────────────────
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Obsidian Architect API V1");
        c.RoutePrefix = string.Empty; // Serves Swagger perfectly at localhost root
    });
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Verify DB connectivity and ensure schema exists on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        Console.WriteLine("[DB-DIAG] Checking database connectivity...");
        
        // First, verify we can reach the database at all
        var canConnect = await db.Database.CanConnectAsync();
        Console.WriteLine($"[DB-DIAG] CanConnect = {canConnect}");
        
        if (canConnect)
        {
            Console.WriteLine("[DB-DIAG] Running migrations...");
            db.Database.Migrate(); 
            Console.WriteLine("[DB-DIAG] Schema is perfectly in sync.");
        }
        else
        {
            Console.WriteLine("[DB-DIAG] WARNING: Cannot connect to database!");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DB-DIAG] Startup DB check FAILED: {ex.GetType().Name}: {ex.Message}");
        if (ex.InnerException != null)
            Console.WriteLine($"[DB-DIAG]   Inner: {ex.InnerException.Message}");
        // Don't throw — let the app start anyway so Swagger is accessible
        // DB errors will surface when endpoints are actually hit
    }
}

app.Run();
