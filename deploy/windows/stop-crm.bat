@echo off
title CRM Supermercado - Parando
cd /d "%~dp0"
echo Parando servicos CRM Supermercado...
docker-compose down
echo [OK] Servicos parados.
timeout /t 3 /nobreak >nul
