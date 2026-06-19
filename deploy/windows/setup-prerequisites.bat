@echo off
title CRM Supermercado - Pre-requisitos
echo Verificando pre-requisitos...
echo.

:check_docker
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker Desktop encontrado
) else (
    echo [AVISO] Docker Desktop nao encontrado.
    echo.
    echo Para instalar manualmente, acesse: https://www.docker.com/products/docker-desktop/
    echo Ou execute: winget install Docker.DockerDesktop
    echo.
    choice /c SN /M "Deseja instalar o Docker Desktop automaticamente?"
    if errorlevel 2 goto :check_git
    echo Instalando Docker Desktop...
    start /wait msiexec /i "https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe" /quiet
)

:check_git
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Git encontrado
) else (
    echo [AVISO] Git nao encontrado (opcional para desenvolvimento)
)

:check_node
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js encontrado
) else (
    echo [INFO] Node.js sera usado dentro dos containers Docker (nao necessario localmente)
)

echo.
echo [OK] Verificacao de pre-requisitos concluida.
timeout /t 2 /nobreak >nul
