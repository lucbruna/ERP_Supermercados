$ErrorActionPreference = "Continue"
$rootDir = $PSScriptRoot
$env:PGPASSWORD = "postgres"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRIANDO BANCOS + MIGRATIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Create all databases
$databases = @(
    "auth", "rh", "financial", "pdv", "inventory", "crm", "marketing",
    "security", "distribution", "fiscal", "integration", "base_brasil",
    "codigo_barras", "contratos", "convenio", "frota", "habilidades",
    "monitoring", "crm_supermercado"
)

Write-Host ""
Write-Host ">>> Criando bancos de dados..." -ForegroundColor Yellow

foreach ($db in $databases) {
    $check = & $psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='$db'" 2>$null
    if ($check -match "1") {
        Write-Host "  [OK] '$db' already exists" -ForegroundColor Gray
    } else {
        & $psql -U postgres -c "CREATE DATABASE $db;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] '$db' created" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Could not create '$db'" -ForegroundColor Yellow
        }
    }
}

# Run db push for each service
$servicesWithPrisma = @(
    "auth-service", "rh-service", "financial-service", "pdv-service",
    "inventory-service", "crm-service", "marketing-service", "security-service",
    "purchasing-service", "integration-api", "fiscal-service", "bi-service",
    "ai-service", "notification-service", "monitoring-service",
    "base-brasil", "codigo-barras-service", "contratos-service",
    "convenio-service", "frota-service", "habilidades-service"
)

$ok = 0
$fail = 0

foreach ($svc in $servicesWithPrisma) {
    $svcDir = Join-Path $rootDir "packages\backend\$svc"
    $prismaDir = Join-Path $svcDir "prisma"
    if (-not (Test-Path $prismaDir)) { continue }

    $schemaFile = Join-Path $prismaDir "schema.prisma"
    if (-not (Test-Path $schemaFile)) { continue }

    Write-Host ""
    Write-Host ">>> $svc" -ForegroundColor Yellow

    try {
        Push-Location $svcDir
        Write-Host "  -> Pushing schema..." -ForegroundColor Gray
        $output = npx prisma db push 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK]" -ForegroundColor Green
            $ok++
        } else {
            Write-Host "  [WARN] issues" -ForegroundColor Yellow
            $fail++
        }
    } catch {
        Write-Host "  [FAIL] $_" -ForegroundColor Red
        $fail++
    } finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO: OK=$ok | FAIL=$fail" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
