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

## 🚀 実行方法 (Getting Started)

### 【推奨】ワンクリック自動スクリプト (One-Click Launchers)

面倒な個別コマンドの実行は不要です。プロジェクト直下のバッチファイルをご利用ください：

| スクリプト | 説明 |
| :--- | :--- |
| **`setup.bat`** | **初回セットアップ**: 前提環境の確認、MySQLコンテナ起動、NuGet / npm パッケージの自動導入とビルドを行います。（初回またはパッケージ更新時に実行） |
| **`start.bat`** | **一括起動**: MySQL、バックエンド API、フロントエンドを一度に起動し、ローカルアクセス用URLとLANアクセス用URLを表示して自動でブラウザを開きます。 |
| **`stop.bat`** | **一括停止**: 起動中のフロントエンド、バックエンド、データベースを安全に終了します。 |

---

### 🌐 LAN（同一ネットワーク）の他PC・スマホからのアクセス

本システムはローカルネットワークへの外部公開（`0.0.0.0` バインド）に対応しています。
`start.bat` を起動すると、コンソールに以下のように表示されます：

```text
==============================================================
  ◆ このPCから利用する場合 (Local):
     -> http://localhost:5173

  ◆ 同一ネットワーク（Wi-Fi / LAN）の別PCやスマホから利用する場合:
     -> http://192.168.x.x:5173

  ◆ バックエンド API Swagger:
     -> http://localhost:5048/swagger
==============================================================
```
同一Wi-Fiや社内LANに接続された別のPCやタブレットのブラウザから、表示された `http://<LAN_IP>:5173` にアクセスするだけでシステムをご利用いただけます。

---

### ⚙️ ポート番号の変更方法 (Customizing Ports)

ポート競合が発生した場合や環境に合わせてポートを変更したい場合は、**`start.bat` の先頭部分**を編集するだけで一元管理できます：

```bat
REM ==============================================================
REM   【ポート設定】
REM ==============================================================
SET FRONTEND_PORT=5173
SET BACKEND_PORT=5048
SET DB_PORT=3306
SET PMA_PORT=8080
REM ==============================================================
```
フロントエンドは `window.location.hostname` に基づいて自動的に正しいバックエンドポートに接続するため、ソースコードの変更は一切不要です。
