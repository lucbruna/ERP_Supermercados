@echo off
title CRM Supermercado
cd /d "%~dp0"

:check_docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Docker Desktop nao esta rodando.
    echo Inicie o Docker Desktop e tente novamente.
    pause
    exit /b 1
)

:check_env
if not exist ".env" (
    echo [CONFIG] Primeira execucao - gerando .env...
    copy .env.example .env >nul
    echo [OK] Arquivo .env criado. Edite as configuracoes se necessario.
)

:start_services
echo [CRM Supermercado] Iniciando servicos...
echo.
docker-compose up -d 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao iniciar servicos.
    pause
    exit /b 1
)

echo.
echo [OK] CRM Supermercado iniciado com sucesso!
echo.
echo  Acessar:
echo    Dashboard: http://localhost:3081
echo    PDV:       http://localhost:3080
echo    Swagger:   http://localhost:3000/api/docs
echo    Grafana:   http://localhost:3000
echo.
echo  Para parar: feche esta janela ou execute stop-crm.bat
echo.
timeout /t 5 /nobreak >nul
start http://localhost:3081
