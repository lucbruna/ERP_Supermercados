@echo off
title CRM Supermercado - Backup
cd /d "%~dp0"
set BACKUP_DIR=backups
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%
set FILENAME=crm-backup-%DATE%.sql

echo [CRM Supermercado] Realizando backup do banco de dados...
echo.

docker exec crm-postgres pg_dump -U admin crm_supermercado > "%BACKUP_DIR%\%FILENAME%" 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backup salvo em: %BACKUP_DIR%\%FILENAME%
) else (
    echo [ERRO] Falha no backup.
)
pause
