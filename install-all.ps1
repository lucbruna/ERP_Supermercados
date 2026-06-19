$ErrorActionPreference = "Continue"
$rootDir = $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTALACAO COMPLETA - CRM SUPERMERCADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Backend services
$backendServices = @(
    "auth-service", "rh-service", "financial-service", "pdv-service",
    "inventory-service", "crm-service", "marketing-service", "security-service",
    "cftv-service", "distribution-service", "bi-service", "ai-service",
    "notification-service", "purchasing-service", "base-brasil",
    "codigo-barras-service", "contratos-service", "convenio-service",
    "frota-service", "habilidades-service", "integration-api", "fiscal-service",
    "monitoring-service", "api-gateway"
)

Write-Host ""
Write-Host ">>> FASE 1: Instalando dependencias dos servicos backend..." -ForegroundColor Yellow

$ok = 0
$fail = 0
foreach ($svc in $backendServices) {
    $svcDir = Join-Path $rootDir "packages\backend\$svc"
    $pkgFile = Join-Path $svcDir "package.json"
    if (-not (Test-Path $pkgFile)) {
        continue
    }
    Write-Host "  -> $svc..." -ForegroundColor Gray
    try {
        Push-Location $svcDir
        npm install --silent 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] $svc" -ForegroundColor Green
            $ok++
        } else {
            Write-Host "  [WARN] $svc - potential issues" -ForegroundColor Yellow
            $ok++
        }
    } catch {
        Write-Host "  [FAIL] $svc - $_" -ForegroundColor Red
        $fail++
    } finally {
        Pop-Location
    }
}

# Frontend services
$frontendServices = @("web-app", "dashboard")
Write-Host ""
Write-Host ">>> FASE 2: Instalando dependencias dos frontends..." -ForegroundColor Yellow

foreach ($svc in $frontendServices) {
    $svcDir = Join-Path $rootDir "packages\frontend\$svc"
    $pkgFile = Join-Path $svcDir "package.json"
    if (-not (Test-Path $pkgFile)) {
        continue
    }
    Write-Host "  -> $svc..." -ForegroundColor Gray
    try {
        Push-Location $svcDir
        npm install --silent 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] $svc" -ForegroundColor Green
            $ok++
        } else {
            Write-Host "  [WARN] $svc" -ForegroundColor Yellow
            $ok++
        }
    } catch {
        Write-Host "  [FAIL] $svc - $_" -ForegroundColor Red
        $fail++
    } finally {
        Pop-Location
    }
}

# Create .env for new services
Write-Host ""
Write-Host ">>> FASE 3: Criando .env para servicos que faltam..." -ForegroundColor Yellow

$newServices = @(
    @{ Name = "base-brasil"; Db = "base_brasil"; Port = 3015 },
    @{ Name = "codigo-barras-service"; Db = "codigo_barras"; Port = 3016 },
    @{ Name = "contratos-service"; Db = "contratos"; Port = 3017 },
    @{ Name = "convenio-service"; Db = "convenio"; Port = 3018 },
    @{ Name = "frota-service"; Db = "frota"; Port = 3019 },
    @{ Name = "habilidades-service"; Db = "habilidades"; Port = 3020 },
    @{ Name = "monitoring-service"; Db = "monitoring"; Port = 3021 }
)

$envTemplate = @"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{dbname}
JWT_SECRET=super-secret-jwt-key-change-in-production-min-32-chars
PORT={port}
REDIS_HOST=localhost
REDIS_PORT=6379
"@

foreach ($svc in $newServices) {
    $svcDir = Join-Path $rootDir "packages\backend\$($svc.Name)"
    $envFile = Join-Path $svcDir ".env"
    if ((Test-Path $svcDir) -and (-not (Test-Path $envFile))) {
        $content = $envTemplate -replace "\{dbname\}", $svc.Db -replace "\{port\}", $svc.Port.ToString()
        Set-Content -Path $envFile -Value $content -Encoding UTF8 -Force
        Write-Host "  [OK] Created .env for $($svc.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend OK: $ok" -ForegroundColor Green
Write-Host "  Backend FAIL: $fail" -ForegroundColor Red
Write-Host ""
Write-Host "  Proximos passos:" -ForegroundColor Yellow
Write-Host "  1. Start PostgreSQL and Redis" -ForegroundColor White
Write-Host "  2. Run: .\start-all.ps1" -ForegroundColor White
Write-Host "  3. Open: http://localhost:3080 (web-app)" -ForegroundColor White
Write-Host "  4. Open: http://localhost:3081 (dashboard)" -ForegroundColor White
