# Script to kill processes using conflicting ports
Write-Host "🛑 Killing processes on conflicting ports..." -ForegroundColor Yellow

# Kill process on port 5000 (Backend conflict)
Write-Host "Checking port 5000..." -ForegroundColor Gray
try {
    $port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
    if ($port5000) {
        $processId = $port5000.OwningProcess
        Write-Host "Found process $processId on port 5000. Killing..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
        Write-Host "✅ Process on port 5000 killed" -ForegroundColor Green
    } else {
        Write-Host "✅ Port 5000 is free" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Could not check/kill port 5000: $($_.Exception.Message)" -ForegroundColor Red
}

# Kill process on port 3000 (if you want to use original port)
Write-Host "Checking port 3000..." -ForegroundColor Gray
try {
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($port3000) {
        $processId = $port3000.OwningProcess
        Write-Host "Found process $processId on port 3000. Killing..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
        Write-Host "✅ Process on port 3000 killed" -ForegroundColor Green
    } else {
        Write-Host "✅ Port 3000 is free" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Could not check/kill port 3000: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Now you can restart your services!" -ForegroundColor Green 