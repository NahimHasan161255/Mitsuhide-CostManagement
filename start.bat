@echo off
chcp 65001 >nul
setlocal

REM ==============================================================
REM   Mitsuhide ERP Launcher (SQL Server 2019)
REM
REM   [Port Configuration]
REM   Change FRONTEND_PORT (e.g. 3001, 5173) or BACKEND_PORT here.
REM ==============================================================
set FRONTEND_PORT=3001
set BACKEND_PORT=5048
REM ==============================================================

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start.ps1" -FrontendPort %FRONTEND_PORT% -BackendPort %BACKEND_PORT%
