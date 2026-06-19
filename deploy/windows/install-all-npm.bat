@echo off
title CRM Supermercado - Instalando dependencias
cd /d "%~dp0"
echo Instalando dependencias NPM de todos os servicos...
echo.

for /d %%s in (packages\backend\*) do (
    if exist "%%s\package.json" (
        echo [%%~nxs] Instalando...
        cd "%%s"
        call npm install --silent 2>&1
        cd "%~dp0"
    )
)

for /d %%s in (packages\frontend\*) do (
    if exist "%%s\package.json" (
        echo [%%~nxs] Instalando...
        cd "%%s"
        call npm install --silent 2>&1
        cd "%~dp0"
    )
)

echo [OK] Todas as dependencias instaladas.
pause
