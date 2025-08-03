# EcoMind Services Verification Script
# Run this script to test all services are working correctly

Write-Host "🚀 ECOMIND SERVICES VERIFICATION" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Test Frontend (Next.js) - Port 3001 (auto-switched due to port 3000 being busy)
Write-Host "1. Testing Frontend Service (Next.js) - Port 3001..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend Service: WORKING" -ForegroundColor Green
        Write-Host "   📄 Page Size: $($frontendResponse.RawContentLength) bytes" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Frontend Service: NOT RESPONDING" -ForegroundColor Red
    Write-Host "   💡 Make sure 'npm run dev' is running in the casgo directory" -ForegroundColor Yellow
}
Write-Host ""

# Test Backend (Express) - Port 5000
Write-Host "2. Testing Backend Service (Express) - Port 5000..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 10
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Backend Service: WORKING" -ForegroundColor Green
        $backendData = $backendResponse.Content | ConvertFrom-Json
        Write-Host "   📊 Status: $($backendData.status)" -ForegroundColor Gray
        Write-Host "   📝 Message: $($backendData.message)" -ForegroundColor Gray
        Write-Host "   🕒 Timestamp: $($backendData.timestamp)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Backend Service: NOT RESPONDING" -ForegroundColor Red
    Write-Host "   💡 Make sure 'npm run dev' is running in the backend directory" -ForegroundColor Yellow
}
Write-Host ""

# Test ML Service (FastAPI) - Port 8000
Write-Host "3. Testing ML Service (FastAPI) - Port 8000..." -ForegroundColor Yellow
try {
    $mlResponse = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 10
    if ($mlResponse.StatusCode -eq 200) {
        Write-Host "   ✅ ML Service: WORKING" -ForegroundColor Green
        $mlData = $mlResponse.Content | ConvertFrom-Json
        Write-Host "   📊 Status: $($mlData.status)" -ForegroundColor Gray
        Write-Host "   📝 Message: $($mlData.message)" -ForegroundColor Gray
        Write-Host "   🐍 Python Version: $($mlData.python_version)" -ForegroundColor Gray
        Write-Host "   🤖 Azure OpenAI: $($mlData.azure_openai_configured)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ ML Service: NOT RESPONDING" -ForegroundColor Red
    Write-Host "   💡 Make sure 'python main.py' is running in ml-service with venv activated" -ForegroundColor Yellow
}
Write-Host ""

# Test API Documentation
Write-Host "4. Testing API Documentation..." -ForegroundColor Yellow
try {
    $docsResponse = Invoke-WebRequest -Uri "http://localhost:8000/docs" -UseBasicParsing -TimeoutSec 10
    if ($docsResponse.StatusCode -eq 200) {
        Write-Host "   ✅ FastAPI Docs: AVAILABLE at http://localhost:8000/docs" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ FastAPI Docs: NOT AVAILABLE" -ForegroundColor Red
}
Write-Host ""

# Test ML Service Functionality
Write-Host "5. Testing ML Service Functionality..." -ForegroundColor Yellow
try {
    $testData = @{
        business_name = "Test Company"
        industry = "Technology"
        size = "Small"
        location = "USA"
        monthly_kwh = 2500.0
        monthly_therms = 150.0
        sustainability_goals = @("reduce_energy", "carbon_neutral")
    } | ConvertTo-Json

    $functionResponse = Invoke-WebRequest -Uri "http://localhost:8000/recommendations" -Method POST -Body $testData -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    
    if ($functionResponse.StatusCode -eq 200) {
        Write-Host "   ✅ ML Recommendations: WORKING" -ForegroundColor Green
        $recommendations = $functionResponse.Content | ConvertFrom-Json
        Write-Host "   📊 Recommendations Count: $($recommendations.recommendations.Count)" -ForegroundColor Gray
        Write-Host "   💰 Total Potential Savings: `$$($recommendations.total_potential_savings)" -ForegroundColor Gray
        Write-Host "   🌱 Total CO2 Reduction: $($recommendations.total_co2_reduction) lbs" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ ML Recommendations: ERROR" -ForegroundColor Red
    Write-Host "   📝 Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "🎯 VERIFICATION COMPLETE!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Service URLs:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3001" -ForegroundColor White
Write-Host "   Backend:   http://localhost:5000/health" -ForegroundColor White
Write-Host "   ML Service: http://localhost:8000/health" -ForegroundColor White
Write-Host "   API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "🔧 If any service is not working:" -ForegroundColor Yellow
Write-Host "   1. Check if all services are running in separate terminals" -ForegroundColor White
Write-Host "   2. Frontend: cd casgo && npm run dev" -ForegroundColor White
Write-Host "   3. Backend: cd casgo/backend && npm run dev" -ForegroundColor White
Write-Host "   4. ML Service: cd casgo/ml-service && venv\Scripts\activate && python main.py" -ForegroundColor White 