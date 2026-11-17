@echo off
chcp 65001 >nul
title Mitsuhide ERP - Stop Services
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop.ps1"
