# 株式会社ミツヒデ 原価管理システム (Mitsuhide Cost Management System)

A modern, enterprise-grade Construction Cost, Order, Budget, Purchasing, Sales, and Monthly Closing ERP Web Application.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** React 19 + TypeScript + Ant Design (AntD) + Vite
- **Backend:** C# ASP.NET Core Web API (.NET 10) Clean Architecture
- **Database:** MySQL (InnoDB, `utf8mb4_unicode_ci`) with Entity Framework Core (`Pomelo.EntityFrameworkCore.MySql`)

---

## 📁 Project Structure

```text
Mitsuhide-CostManagement/
├── backend/                              # ASP.NET Core Solution (Mitsuhide.slnx)
│   ├── Mitsuhide.Domain/                 # Core Entities (GK_T_KOJIJYU, GK_T_KOJIYOS, Masters)
│   ├── Mitsuhide.Application/            # DTOs, Business Services, Validators
│   ├── Mitsuhide.Infrastructure/         # EF Core DbContext, MySQL Configurations
│   └── Mitsuhide.Api/                    # Web API Controllers, Swagger/OpenAPI
│
└── frontend/                             # React + Vite + Ant Design Application
    └── src/
        ├── api/                          # Backend API client services
        ├── components/                   # Common AntD components, Layout, Modals
        ├── pages/                        # Cost, Sales, Purchase, Closing, Master screens
        └── types/                        # TypeScript Interfaces matching backend DTOs
```

---

## 🚀 Getting Started

### 1. Backend API
```bash
cd backend/Mitsuhide.Api
dotnet run
```
Access Swagger UI at `https://localhost:7xxx/swagger`.

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Access Web App at `http://localhost:5173`.
