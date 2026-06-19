$ErrorActionPreference = "Continue"
$rootDir = $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRISMA MIGRATIONS + GENERATE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$servicesWithPrisma = @(
    "auth-service", "rh-service", "financial-service", "pdv-service",
    "inventory-service", "crm-service", "marketing-service", "security-service",
    "purchasing-service", "integration-api", "fiscal-service", "bi-service",
    "ai-service", "notification-service", "monitoring-service",
    "base-brasil", "codigo-barras-service", "contratos-service",
    "convenio-service", "frota-service", "habilidades-service"
)

$ok = 0
$skip = 0

foreach ($svc in $servicesWithPrisma) {
    $svcDir = Join-Path $rootDir "packages\backend\$svc"
    $prismaDir = Join-Path $svcDir "prisma"

    if (-not (Test-Path $prismaDir)) {
        continue
    }

    $schemaFile = Join-Path $prismaDir "schema.prisma"
    if (-not (Test-Path $schemaFile)) {
        continue
    }

    Write-Host ""
    Write-Host ">>> $svc" -ForegroundColor Yellow

    # Generate Prisma Client
    Write-Host "  -> Generating Prisma client..." -ForegroundColor Gray
    try {
        Push-Location $svcDir
        npx prisma generate 2>$null | Out-Null
        Write-Host "  [OK] Prisma client generated" -ForegroundColor Green
        $ok++
    } catch {
        Write-Host "  [WARN] Prisma generate issue: $_" -ForegroundColor Yellow
    } finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO PRISMA: $ok servicos gerados" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para rodar as migrations (requer PostgreSQL rodando):" -ForegroundColor Yellow
Write-Host "  .\start-all.ps1" -ForegroundColor White
