@echo off
title CRM Supermercado - Status
cd /d "%~dp0"
docker-compose ps
echo.
echo Para ver logs detalhados: docker-compose logs -f
pause
