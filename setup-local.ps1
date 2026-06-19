param(
    [switch]$SkipNpmInstall,
    [switch]$SkipMigrations,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Setup script for ERP Supermercado local development (without Docker)

Usage: .\setup-local.ps1 [options]

Options:
  -SkipNpmInstall    Skip npm install step
  -SkipMigrations    Skip prisma migrations step
  -Help              Show this help message
"@ -ForegroundColor Cyan
    exit 0
}

$ErrorActionPreference = "Stop"
$rootDir = $PSScriptRoot
$backendDir = Join-Path $rootDir "packages\backend"

$services = @(
    @{ Name = "auth-service";         Db = "auth";              Port = 3001 }
    @{ Name = "rh-service";           Db = "rh";                Port = 3002 }
    @{ Name = "financial-service";    Db = "financial";         Port = 3003 }
    @{ Name = "pdv-service";          Db = "pdv";               Port = 3004 }
    @{ Name = "inventory-service";    Db = "inventory";         Port = 3005 }
    @{ Name = "crm-service";          Db = "crm";               Port = 3006 }
    @{ Name = "marketing-service";    Db = "marketing";         Port = 3007 }
    @{ Name = "security-service";     Db = "security";          Port = 3008 }
    @{ Name = "cftv-service";         Db = "monitoring";        Port = 3010 }
    @{ Name = "distribution-service"; Db = "distribution";      Port = 3011 }
    @{ Name = "bi-service";           Db = "crm_supermercado";  Port = 3012 }
    @{ Name = "ai-service";           Db = "crm_supermercado";  Port = 3013 }
    @{ Name = "notification-service"; Db = "crm_supermercado";  Port = 3014 }
    @{ Name = "purchasing-service";   Db = "crm_supermercado";  Port = 3009 }
    @{ Name = "fiscal-service";       Db = "fiscal";            Port = 3022 }
    @{ Name = "integration-api";      Db = "integration";       Port = 3023 }
    @{ Name = "base-brasil";          Db = "base_brasil";       Port = 3015 }
    @{ Name = "codigo-barras-service";Db = "codigo_barras";     Port = 3016 }
    @{ Name = "contratos-service";    Db = "contratos";         Port = 3017 }
    @{ Name = "convenio-service";     Db = "convenio";          Port = 3018 }
    @{ Name = "frota-service";        Db = "frota";             Port = 3019 }
    @{ Name = "habilidades-service";  Db = "habilidades";       Port = 3020 }
    @{ Name = "monitoring-service";   Db = "monitoring";        Port = 3021 }
    @{ Name = "api-gateway";          Db = "";                  Port = 3000 }
)

$global:exitCode = 0

function Write-Step {
    param([string]$Message)
    Write-Host "`n>>> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Err {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    $global:exitCode = 1
}

function Test-Command {
    param([string]$Command)
    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

# ============================================================
# STEP 1: Check prerequisites
# ============================================================
Write-Step "Checking prerequisites..."

$prereqsOk = $true

if (Test-Command "node") {
    $nodeVer = node --version
    Write-Success "Node.js $nodeVer found"
} else {
    Write-Err "Node.js not found. Install from https://nodejs.org (v18+)"
    $prereqsOk = $false
}

if (Test-Command "npm") {
    $npmVer = npm --version
    Write-Success "npm $npmVer found"
} else {
    Write-Err "npm not found (should come with Node.js)"
    $prereqsOk = $false
}

if (Test-Command "psql") {
    Write-Success "PostgreSQL client (psql) found"
} else {
    Write-Warn "psql not found in PATH - PostgreSQL client may not be available"
}

if (-not $prereqsOk) {
    Write-Err "Prerequisites not met. Aborting."
    exit 1
}

# ============================================================
# STEP 2: Add PostgreSQL bin to PATH
# ============================================================
Write-Step "Locating PostgreSQL bin directory..."

$pgBinPaths = @(
    "${env:ProgramFiles}\PostgreSQL\*\bin",
    "${env:ProgramFiles(x86)}\PostgreSQL\*\bin",
    "$env:LOCALAPPDATA\Programs\PostgreSQL\*\bin"
)

$pgBinFound = $false
foreach ($pattern in $pgBinPaths) {
    $resolved = Resolve-Path $pattern -ErrorAction SilentlyContinue
    if ($resolved) {
        $pgDir = $resolved[-1].Path
        $env:Path = "$pgDir;$env:Path"
        Write-Success "Added PostgreSQL bin to PATH: $pgDir"
        $pgBinFound = $true
        break
    }
}
if (-not $pgBinFound) {
    Write-Warn "Could not auto-detect PostgreSQL bin directory. Ensure psql is in PATH manually."
}

# ============================================================
# STEP 3: Check / start PostgreSQL service
# ============================================================
Write-Step "Checking PostgreSQL service..."

$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if (-not $pgService) {
    $pgService = Get-Service -Name "postgresql*" -Include "postgresql-x64-*" -ErrorAction SilentlyContinue
}
if (-not $pgService) {
    $pgService = Get-Service -Name "postgresql*" -Include "*postgres*" -ErrorAction SilentlyContinue
}

if ($pgService) {
    if ($pgService.Status -eq "Running") {
        Write-Success "PostgreSQL service '$($pgService.Name)' is running"
    } else {
        Write-Warn "PostgreSQL service '$($pgService.Name)' is $($pgService.Status). Attempting to start..."
        try {
            Start-Service $pgService.Name -ErrorAction Stop
            Write-Success "PostgreSQL service started"
        } catch {
            Write-Err "Failed to start PostgreSQL service: $_"
        }
    }
} else {
    Write-Warn "PostgreSQL service not found. Make sure PostgreSQL is installed and running."
}

# ============================================================
# STEP 4: Create .env files for each service
# ============================================================
Write-Step "Creating .env files for all services..."

$envContent = @"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{dbname}
JWT_SECRET=super-secret-jwt-key-change-in-production-min-32-chars
PORT={port}
REDIS_HOST=localhost
REDIS_PORT=6379
"@

$envResults = @()
foreach ($svc in $services) {
    $svcDir = Join-Path $backendDir $svc.Name
    $envFile = Join-Path $svcDir ".env"

    if (-not (Test-Path $svcDir)) {
        Write-Warn "Directory not found: $svcDir - skipping .env creation"
        continue
    }

    $content = $envContent -replace "{dbname}", $svc.Db -replace "{port}", $svc.Port.ToString()
    try {
        Set-Content -Path $envFile -Value $content -Encoding UTF8 -NoNewline -Force
        Write-Success "Created .env for $($svc.Name) (db: $($svc.Db), port: $($svc.Port))"
        $envResults += [PSCustomObject]@{ Service = $svc.Name; Env = "Created" }
    } catch {
        Write-Err "Failed to create .env for $($svc.Name): $_"
        $envResults += [PSCustomObject]@{ Service = $svc.Name; Env = "Failed" }
    }
}

# ============================================================
# STEP 5: Install npm dependencies
# ============================================================
if (-not $SkipNpmInstall) {
    Write-Step "Installing npm dependencies for all services..."
    $installResults = @()
    foreach ($svc in $services) {
        $svcDir = Join-Path $backendDir $svc.Name
        $pkgFile = Join-Path $svcDir "package.json"

        if (-not (Test-Path $pkgFile)) {
            Write-Warn "package.json not found in $svcDir - skipping npm install"
            $installResults += [PSCustomObject]@{ Service = $svc.Name; Install = "Skipped" }
            continue
        }

        Write-Host "  -> Installing dependencies for $($svc.Name)..." -ForegroundColor Yellow
        try {
            Push-Location $svcDir
            $output = npm install 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "npm install completed for $($svc.Name)"
                $installResults += [PSCustomObject]@{ Service = $svc.Name; Install = "OK" }
            } else {
                Write-Err "npm install failed for $($svc.Name): $output"
                $installResults += [PSCustomObject]@{ Service = $svc.Name; Install = "Failed" }
            }
        } catch {
            Write-Err "npm install threw exception for $($svc.Name): $_"
            $installResults += [PSCustomObject]@{ Service = $svc.Name; Install = "Failed" }
        } finally {
            Pop-Location
        }
    }
} else {
    Write-Warn "Skipping npm install (--SkipNpmInstall passed)"
}

# ============================================================
# STEP 6: Run Prisma migrations
# ============================================================
if (-not $SkipMigrations) {
    Write-Step "Running Prisma migrations..."
    $migrateResults = @()
    foreach ($svc in $services) {
        $svcDir = Join-Path $backendDir $svc.Name
        $prismaDir = Join-Path $svcDir "prisma"

        if (-not (Test-Path $prismaDir)) {
            Write-Warn "No prisma directory in $($svc.Name) - skipping migration"
            $migrateResults += [PSCustomObject]@{ Service = $svc.Name; Migration = "Skipped" }
            continue
        }

        Write-Host "  -> Running migration for $($svc.Name)..." -ForegroundColor Yellow
        try {
            Push-Location $svcDir
            $output = npx prisma migrate dev --name init 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Migration completed for $($svc.Name)"
                $migrateResults += [PSCustomObject]@{ Service = $svc.Name; Migration = "OK" }
            } else {
                Write-Warn "Migration may have partially failed for $($svc.Name). Output: $($output | Select-Object -Last 5)"
                $migrateResults += [PSCustomObject]@{ Service = $svc.Name; Migration = "Issues" }
            }
        } catch {
            Write-Err "Migration threw exception for $($svc.Name): $_"
            $migrateResults += [PSCustomObject]@{ Service = $svc.Name; Migration = "Failed" }
        } finally {
            Pop-Location
        }
    }

    # ============================================================
    # STEP 7: Generate Prisma clients
    # ============================================================
    Write-Step "Generating Prisma clients..."
    $generateResults = @()
    foreach ($svc in $services) {
        $svcDir = Join-Path $backendDir $svc.Name
        $prismaDir = Join-Path $svcDir "prisma"

        if (-not (Test-Path $prismaDir)) {
            $generateResults += [PSCustomObject]@{ Service = $svc.Name; Generate = "Skipped" }
            continue
        }

        Write-Host "  -> Generating Prisma client for $($svc.Name)..." -ForegroundColor Yellow
        try {
            Push-Location $svcDir
            $output = npx prisma generate 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Prisma client generated for $($svc.Name)"
                $generateResults += [PSCustomObject]@{ Service = $svc.Name; Generate = "OK" }
            } else {
                Write-Err "Prisma generate failed for $($svc.Name): $output"
                $generateResults += [PSCustomObject]@{ Service = $svc.Name; Generate = "Failed" }
            }
        } catch {
            Write-Err "Prisma generate threw exception for $($svc.Name): $_"
            $generateResults += [PSCustomObject]@{ Service = $svc.Name; Generate = "Failed" }
        } finally {
            Pop-Location
        }
    }
} else {
    Write-Warn "Skipping migrations and Prisma generate (--SkipMigrations passed)"
}

# ============================================================
# STEP 8: Print summary table
# ============================================================
Write-Step "Setup Summary"
Write-Host ""

$summaryRows = @()
foreach ($svc in $services) {
    $envStatus = if ($envResults | Where-Object { $_.Service -eq $svc.Name }) { ($envResults | Where-Object { $_.Service -eq $svc.Name }).Env } else { "-" }
    $installStatus = if ($installResults) { ($installResults | Where-Object { $_.Service -eq $svc.Name }).Install } else { "-" }
    $migrateStatus = if ($migrateResults) { ($migrateResults | Where-Object { $_.Service -eq $svc.Name }).Migration } else { "-" }
    $generateStatus = if ($generateResults) { ($generateResults | Where-Object { $_.Service -eq $svc.Name }).Generate } else { "-" }

    $summaryRows += [PSCustomObject]@{
        Service            = $svc.Name
        Database           = $svc.Db
        Port               = $svc.Port
        EnvFile            = if ($envStatus -eq "Created") { "Y" } elseif ($envStatus -eq "Failed") { "N" } else { "-" }
        NpmInstall         = if ($installStatus -eq "OK") { "Y" } elseif ($installStatus -eq "Failed") { "N" } elseif ($installStatus -eq "Skipped") { "S" } else { "-" }
        PrismaMigration    = if ($migrateStatus -eq "OK") { "Y" } elseif ($migrateStatus -eq "Failed") { "N" } elseif ($migrateStatus -eq "Issues") { "?" } elseif ($migrateStatus -eq "Skipped") { "S" } else { "-" }
        PrismaGenerate     = if ($generateStatus -eq "OK") { "Y" } elseif ($generateStatus -eq "Failed") { "N" } elseif ($generateStatus -eq "Skipped") { "S" } else { "-" }
    }
}

$summaryRows | Format-Table -Property Service, Database, Port, EnvFile, NpmInstall, PrismaMigration, PrismaGenerate -AutoSize

Write-Host ""
Write-Host "Legend: Y=OK  N=Failed  ?=Issues  S=Skipped  -=Not Run" -ForegroundColor Gray

if ($global:exitCode -eq 0) {
    Write-Host "Setup completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Setup completed with errors. Review the messages above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start each service manually: cd packages/backend/<service> && npm run dev" -ForegroundColor White
Write-Host "  2. Or use the Makefile: make dev" -ForegroundColor White

exit $global:exitCode