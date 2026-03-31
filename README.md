<!-- NOCTIS RESERVE: PORTFOLIO SHOWCASE README -->
<div align="center">
  
# 🗡️ Noctis Reserve

**A premium, dark-luxury appointment booking platform engineered for professionals who demand exclusivity, precision, and complete control.**

[![Architecture](https://img.shields.io/badge/Architecture-C%23_Onion_Arch-2a1860?style=for-the-badge)](#)
[![Backend](https://img.shields.io/badge/Backend-ASP.NET_Core_8-5B2EFF?style=for-the-badge)](#)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge)](#)
[![Frontend](https://img.shields.io/badge/UI-Vanilla_SPA-8B5CFF?style=for-the-badge)](#)

*Elevate your client experience. Protect your time.*

<br>

https://noctis-reserve.vercel.app/#/

</div>

<br>

## 🔐 Architecture & Security Notice
> [!IMPORTANT]  
> **This repository serves strictly as a Public Portfolio Showcase.**  
> Noctis Reserve is powered by a production-grade C# backend utilizing Onion Architecture and strict security protocols. To protect intellectual property, proprietary business logic, and active database credentials, **the core backend modules are maintained in a separate, private repository.**  
> 
> *Only front-facing assets and safe Domain-level structural examples are exposed here.*

---

## 📖 Project Overview

**What is Noctis Reserve?**  
Noctis Reserve is a full-stack, enterprise-grade appointment booking platform designed for high-end consultants, exclusive service providers, and professionals who need a rock-solid, visually stunning way to manage reservations. 

**The Problem it Solves:**  
Generic booking tools offer rigid designs and clunky interfaces that dilute premium personal branding. Noctis Reserve solves this by stripping away friction, providing a fluid, "glassmorphic" frontend interface powered by a highly resilient C# Web API backend that guarantees data integrity, role-based security, and real-time operational oversight.

---

## ⚙️ Main Functionality

Noctis Reserve encompasses a complete end-to-end reservation lifecycle, demonstrating true frontend-backend integration:

- **Secure Authentication:** Complete JWT-based login and registration flows.
- **Role-Based Access Control:** Distinct, isolated experiences for standard `Users` and privileged `Administrators`.
- **Intelligent Booking Flow:** A fluid calendar interface allowing clients to navigate dates, view available shifts, and lock in precise time slots.
- **Appointment Management:** Clients can review, filter, and track the status of their upcoming and past reservations.
- **Admin Command Center:** A unified dashboard providing macro-level oversight of all reservations in the system.
- **Schedule Configuration:** Administrators have deep control over system availability, defining operational hours and interval tuning.
- **Immutable Audit Logging:** System-wide tracking of reservation creation, status changes, and critical administrative actions.

---

## 📸 Visual Showcase

*(Visual assets are located in the `/portfolio-assets` directory)*

### The Authentic Lobby
> A frictionless, secure entry point.
<p align="center"><img src="./portfolio-assets/auth-flow.png" alt="Authentication Flow" width="700" onerror="this.style.display='none'"></p>

### The Client Experience
> Selecting the perfect date, shift, and time slot.
<p align="center"><img src="./portfolio-assets/booking-flow.png" alt="Booking Modal" width="700" onerror="this.style.display='none'"></p>

### The Client Dashboard
> Tracking upcoming reservations.
<p align="center"><img src="./portfolio-assets/dashboard-user.png" alt="User Dashboard" width="700" onerror="this.style.display='none'"></p>

### The Admin Command Center
> Operational oversight and schedule control.
<p align="center"><img src="./portfolio-assets/admin-panel.png" alt="Admin Dashboard" width="700" onerror="this.style.display='none'"></p>

---

## 🏗️ The Architecture

At the heart of Noctis Reserve is a highly decoupled backend built on **Onion Architecture** (Clean Architecture), designed for long-term maintainability and testability.

1. **Domain Layer:** The absolute core of the application. Contains enterprise-wide entities (`User`, `Appointment`, `AuditLog`), enums, and business interfaces. No external dependencies.
2. **Application Layer:** Contains the business logic, use cases (Services), and Data Transfer Objects (DTOs). It orchestrates exactly *how* the system behaves without caring about HTTP requests or databases.
3. **Infrastructure Layer:** Handles all external concerns. This includes Entity Framework Core contexts, PostgreSQL database migrations via Supabase, and repository pattern implementations.
4. **API Layer (Presentation):** The ASP.NET Core Web API shell. It exposes secure endpoints, manages JWT authorization middleware, and routes HTTP requests into the Application layer safely.

---

## 🛠️ Technologies Used

### Backend Stack
- **ASP.NET Core 8 Web API**
- **C#**
- **Entity Framework Core (EF Core)**
- **PostgreSQL (Hosted on Supabase)**
- **JWT Authentication & RBAC Middleware**

### Frontend Stack
- **Vanilla JavaScript Custom SPA** (Client-side routing, API fetching)
- **HTML5 & Modern CSS**
- **Tailwind CSS** (Configured with a custom dark-luxury color palette)

---

## 👤 Creator / Contact

**Created by Emanuel Baez**  
*Software Engineer*

This project was built from the ground up to demonstrate mastery of both scalable C# backend architecture and modern, high-end frontend UX/UI execution.
