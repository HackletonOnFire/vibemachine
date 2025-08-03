#!/usr/bin/env pwsh

Write-Host "🚀 Starting EcoMind Development Server for Onboarding Testing" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the ecomind directory." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Testing Instructions:" -ForegroundColor Yellow
Write-Host "1. After server starts, go to: http://localhost:3000/onboarding" -ForegroundColor White
Write-Host "2. Open Browser Developer Tools (F12)" -ForegroundColor White
Write-Host "3. Go to Console tab and clear existing logs" -ForegroundColor White
Write-Host "4. Complete the onboarding steps and watch console output" -ForegroundColor White
Write-Host ""

Write-Host "🔍 When testing Step 3 (Complete Setup), look for these debug messages:" -ForegroundColor Yellow
Write-Host "  🔄 handleFinalSubmit called with..." -ForegroundColor Gray
Write-Host "  ⏳ Setting isSubmitting to true..." -ForegroundColor Gray
Write-Host "  📦 Complete onboarding data prepared..." -ForegroundColor Gray
Write-Host "  💾 Calling onboardingService.saveOnboardingData..." -ForegroundColor Gray
Write-Host "  📋 Onboarding service result..." -ForegroundColor Gray
Write-Host "  ✅ Onboarding data saved successfully..." -ForegroundColor Gray
Write-Host "  🎯 handleSuccess called..." -ForegroundColor Gray
Write-Host "  🔀 Attempting redirect to dashboard..." -ForegroundColor Gray
Write-Host "  🏁 handleFinalSubmit completed" -ForegroundColor Gray
Write-Host ""

Write-Host "❌ If you see any red error messages, copy them for debugging!" -ForegroundColor Red
Write-Host ""

Write-Host "🌐 Starting development server..." -ForegroundColor Green
npm run dev 