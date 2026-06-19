Write-Host "Stopping all ERP Supermercado services..." -ForegroundColor Yellow

# Stop node processes that are running from our project directory
$rootDir = $PSScriptRoot
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -match [regex]::Escape($rootDir)
}

if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host ("Stopped $($nodeProcesses.Count) process(es)") -ForegroundColor Green
} else {
    Write-Host "No running services found from this project." -ForegroundColor Gray
}

# Also kill any nest process
$nestProcesses = Get-Process -Name "nest" -ErrorAction SilentlyContinue
if ($nestProcesses) {
    $nestProcesses | Stop-Process -Force
}
