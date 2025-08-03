# Verify Port Configuration Fix
# This script checks that all port references are correctly configured

Write-Host "🔧 Verifying Port Configuration Fix" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check environment variables
Write-Host "📁 Checking environment variables..." -ForegroundColor Blue

if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    
    # Check for old port 3000 references
    $port3000Count = ($envContent | Select-String "localhost:3000" -AllMatches).Matches.Count
    $port3001Count = ($envContent | Select-String "localhost:3001" -AllMatches).Matches.Count
    
    if ($port3000Count -eq 0) {
        Write-Host "  • Port 3000 references: $port3000Count" -ForegroundColor Green
    } else {
        Write-Host "  • Port 3000 references: $port3000Count" -ForegroundColor Red
    }
    
    if ($port3001Count -gt 0) {
        Write-Host "  • Port 3001 references: $port3001Count" -ForegroundColor Green
    } else {
        Write-Host "  • Port 3001 references: $port3001Count" -ForegroundColor Red
    }
    
    if ($port3000Count -eq 0 -and $port3001Count -gt 0) {
        Write-Host "✅ Environment variables correctly configured" -ForegroundColor Green
    } else {
        Write-Host "❌ Environment variables need fixing" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
}

# Check key files for hardcoded URLs
Write-Host ""
Write-Host "🔍 Checking source files for dynamic URL usage..." -ForegroundColor Blue

$filesToCheck = @(
    "src/lib/supabase.ts",
    "src/lib/auth/context.tsx", 
    "src/app/auth/verify-email/page.tsx"
)

$allGood = $true

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $hardcodedUrls = ($content | Select-String "http://localhost:3\d+" -AllMatches).Matches
        $dynamicUrls = ($content | Select-String "process\.env\.NEXT_PUBLIC_FRONTEND_URL" -AllMatches).Matches.Count
        
        if ($hardcodedUrls.Count -eq 0 -and $dynamicUrls -gt 0) {
            Write-Host "  ✅ $file - Uses dynamic URLs" -ForegroundColor Green
        } elseif ($hardcodedUrls.Count -gt 0) {
            Write-Host "  ⚠️  $file - Has hardcoded URLs:" -ForegroundColor Yellow
            foreach ($match in $hardcodedUrls) {
                Write-Host "    - $($match.Value)" -ForegroundColor Gray
            }
            $allGood = $false
        } else {
            Write-Host "  ⚠️  $file - No dynamic URL usage found" -ForegroundColor Yellow
            $allGood = $false
        }
    } else {
        Write-Host "  ❌ $file - File not found" -ForegroundColor Red
        $allGood = $false
    }
}

# Check current server status
Write-Host ""
Write-Host "🔍 Checking current server status..." -ForegroundColor Blue

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Server running on port 3001" -ForegroundColor Green
} catch {
    Write-Host "❌ Server not responding on port 3001" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "⚠️  Something is running on port 3000" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Port 3000 is free (as expected)" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Blue
Write-Host "============" -ForegroundColor Blue

if ($allGood) {
    Write-Host "✅ All port configurations are correctly set up!" -ForegroundColor Green
    Write-Host "🚀 Your authentication flows should work properly now" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some configurations may need attention" -ForegroundColor Yellow
    Write-Host "📝 Check the warnings above and fix any hardcoded URLs" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔄 Next Steps:" -ForegroundColor Blue
Write-Host "===============" -ForegroundColor Blue
Write-Host "1. Restart your development server to apply env changes:" -ForegroundColor White
Write-Host "   Ctrl+C to stop current server, then run: npm run dev" -ForegroundColor Gray
Write-Host "2. Test signup functionality at: http://localhost:3001/auth/signup" -ForegroundColor White
Write-Host "3. Test Google OAuth and email verification" -ForegroundColor White
Write-Host "4. Check that all redirects work properly" -ForegroundColor White 