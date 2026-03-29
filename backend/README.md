# Obsidian Architect API (Backend)

## Overview
This is the complete, production-ready backend for the **Obsidian Architect Appointment Booking Engine**. 
It is built using ASP.NET Core 10 Web API, following **Clean/Onion Architecture**, and is designed specifically to power the premium "Glassy Dark UI" frontend that has already been created.

## Architecture Highlights
- **Layered Structure**: Separation of concerns (`Domain`, `Application`, `Infrastructure`, `API`).
- **Entity Framework Core**: Code-first ORM with PostgreSQL (`Npgsql`) or Supabase.
- **Robust Booking Engine**: Prevents overbooking, enforces "one appointment per day," generates time slots dynamically based on active shifts, capacity, and buffer logic.
- **Audit Logging**: Comprehensive transaction logs for admin observability.
- **Frontend-Oriented Responses**: DTOs shaped carefully to match the dashboard cards, configuration grids, and stats exactly.
- **Role-Based Auth (JWT)**: Includes initial bcrypt support with an admin seed.

## Project Structure
* `src/ObsidianArchitect.Domain` - Core entities, exceptions, and business rules (Enums, Status logic).
* `src/ObsidianArchitect.Application` - DTOs, Use Cases (Services), and Interfaces.
* `src/ObsidianArchitect.Infrastructure` - `AppDbContext`, EF Core Repositories, JWT Generation.
* `src/ObsidianArchitect.API` - Controllers, Global Exception Handling, Auth setup, Swagger.

## Pre-requisites
1. .NET 10 SDK
2. PostgreSQL (Local or managed like Supabase)

## Setup & Running Locally

1. **Configure Connection String**
   Open `src/ObsidianArchitect.API/appsettings.json` and change the `DefaultConnection` to match your local postgres or Supabase instance.
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Database=obsidian_architect;Username=postgres;Password=yourpassword"
   }
   ```

2. **Run Migrations (Entity Framework)**
   Open your terminal in the backend root and generate/apply the database schema:
   ```bash
   dotnet tool install --global dotnet-ef   # (If not installed)
   dotnet ef migrations add InitialCreate --project src/ObsidianArchitect.Infrastructure --startup-project src/ObsidianArchitect.API
   dotnet ef database update --project src/ObsidianArchitect.Infrastructure --startup-project src/ObsidianArchitect.API
   ```

3. **Run the API**
   ```bash
   dotnet run --project src/ObsidianArchitect.API
   ```

4. **Test the Endpoints**
   Navigate to `http://localhost:5xxx/swagger` to see the complete endpoint documentation.
   * **Default Admin Credentials:**
     * Email: `admin@obsidian.io`
     * Password: `Admin123!`

## Connecting to the Frontend
The frontend requires clean JSON objects. This backend is configured with comprehensive CORS policies (`AllowFrontend`) allowing local ports `localhost:3000` and `127.0.0.1:5500`.

To connect the frontend:
1. Replace mocked API calls in your JavaScript with `fetch("http://localhost:5xxx/api/...")`.
2. Store the returned `token` from `/api/auth/login` in `localStorage`.
3. Pass `Authorization: Bearer <token>` in the headers of all subsequent protected calls.
