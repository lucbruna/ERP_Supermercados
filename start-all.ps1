param(
    [string[]]$Include = @("*"),
    [switch]$Build,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Start ERP Supermercado services locally (without Docker)

Usage: .\start-all.ps1 [options]

Options:
  -Include    Services to start (comma separated, default: all)
              Examples: auth, rh, financial, pdv, inventory, crm
  -Build      Build services before starting
  -Help       Show this help

Available services:
  auth-service (3001), rh-service (3002), financial-service (3003),
  pdv-service (3004), inventory-service (3005), crm-service (3006),
  marketing-service (3007), security-service (3008), purchasing-service (3009),
  cftv-service (3010), distribution-service (3011), bi-service (3012),
  ai-service (3013), notification-service (3014), base-brasil (3015),
  codigo-barras-service (3016), contratos-service (3017), convenio-service (3018),
  frota-service (3019), habilidades-service (3020), monitoring-service (3021),
  fiscal-service (3022), integration-api (3023), api-gateway (3000)
"@ -ForegroundColor Cyan
    exit 0
}

$rootDir = $PSScriptRoot
$backendDir = Join-Path $rootDir "packages\backend"

$allServices = @(
    @{ Name = "auth-service";         Port = 3001 },
    @{ Name = "rh-service";           Port = 3002 },
    @{ Name = "financial-service";    Port = 3003 },
    @{ Name = "pdv-service";          Port = 3004 },
    @{ Name = "inventory-service";    Port = 3005 },
    @{ Name = "crm-service";          Port = 3006 },
    @{ Name = "marketing-service";    Port = 3007 },
    @{ Name = "security-service";     Port = 3008 },
    @{ Name = "purchasing-service";   Port = 3009 },
    @{ Name = "cftv-service";         Port = 3010 },
    @{ Name = "distribution-service"; Port = 3011 },
    @{ Name = "bi-service";           Port = 3012 },
    @{ Name = "ai-service";           Port = 3013 },
    @{ Name = "notification-service"; Port = 3014 },
    @{ Name = "base-brasil";          Port = 3015 },
    @{ Name = "codigo-barras-service";Port = 3016 },
    @{ Name = "contratos-service";    Port = 3017 },
    @{ Name = "convenio-service";     Port = 3018 },
    @{ Name = "frota-service";        Port = 3019 },
    @{ Name = "habilidades-service";  Port = 3020 },
    @{ Name = "monitoring-service";   Port = 3021 },
    @{ Name = "fiscal-service";       Port = 3022 },
    @{ Name = "integration-api";      Port = 3023 },
    @{ Name = "api-gateway";          Port = 3000 }
)

# Filter services based on -Include parameter
if ($Include -and $Include -notcontains "*") {
    $filtered = @()
    foreach ($pattern in $Include) {
        $filtered += $allServices | Where-Object { $_.Name -like "*$pattern*" }
    }
    $services = $filtered | Sort-Object Port -Unique
} else {
    $services = $allServices
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting ERP Supermercado Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$processes = @()

foreach ($svc in $services) {
    $svcDir = Join-Path $backendDir $svc.Name
    $logFile = Join-Path $svcDir "service.log"

    if (-not (Test-Path (Join-Path $svcDir "package.json"))) {
        Write-Host ("[SKIP] ${svc.Name} - no package.json") -ForegroundColor Gray
        continue
    }

    if ($Build) {
        Write-Host ("[BUILD] ${svc.Name}...") -ForegroundColor Yellow
        Push-Location $svcDir
        $buildOutput = npx nest build 2>&1
        Pop-Location
    }

    Write-Host ("[START] ${svc.Name} on port ${svc.Port}") -ForegroundColor Green
    Push-Location $svcDir

    $ps = Start-Process -FilePath "npx.cmd" -ArgumentList "nest start" `
        -PassThru -NoNewWindow `
        -RedirectStandardOutput $logFile `
        -RedirectStandardError "${logFile}.err"

    Pop-Location

    $processes += [PSCustomObject]@{
        Name = $svc.Name
        Port = $svc.Port
        PID  = $ps.Id
        Log  = "$svcDir\service.log"
    }

    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Started $($processes.Count) service(s)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
$processes | Format-Table -Property Name, Port, PID -AutoSize

Write-Host ""
Write-Host "Log files location:" -ForegroundColor White
foreach ($p in $processes) {
    Write-Host ("  ${p.Name}: ${p.Log}") -ForegroundColor Gray
}

Write-Host ""
Write-Host "To stop services:" -ForegroundColor Yellow
Write-Host "  .\stop-all.ps1" -ForegroundColor White
Write-Host "  or" -ForegroundColor White
Write-Host '  Get-Process -Name "node" | Stop-Process' -ForegroundColor White
