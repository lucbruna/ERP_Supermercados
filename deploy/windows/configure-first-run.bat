@echo off
title CRM Supermercado - Configuracao Inicial
cd /d "%~dp0"

if exist ".env" (
    echo [OK] Configuracao ja realizada.
    exit /b 0
)

echo.
echo ============================================
echo   CRM Supermercado - Configuracao Inicial
echo ============================================
echo.

copy .env.example .env >nul

echo Gerando chaves de seguranca...
powershell -Command "$key = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})"
echo JWT_SECRET=%random%%random%%random%>> .env

echo.
echo [OK] Arquivo .env gerado com sucesso!
echo.
echo ATENCAO: Edite o arquivo .env para configurar:
echo   - Senha do banco de dados
echo   - Chaves de API (se tiver)
echo   - Configuracoes de email/SMS
echo.
echo Pressione qualquer tecla para continuar...
pause >nul
