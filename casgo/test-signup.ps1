# Test Signup Functionality
# This script tests the signup flow to ensure it's working properly

Write-Host "🧪 Testing Signup Functionality" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# Check if server is running
Write-Host "🔍 Checking if development server is running..." -ForegroundColor Blue

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Development server is running on http://localhost:3001" -ForegroundColor Green
} catch {
    Write-Host "❌ Development server is not running!" -ForegroundColor Red
    Write-Host "Please start the server with: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Check signup page accessibility
Write-Host "🔍 Testing signup page accessibility..." -ForegroundColor Blue

try {
    $signupResponse = Invoke-WebRequest -Uri "http://localhost:3001/auth/signup" -UseBasicParsing -TimeoutSec 10
    if ($signupResponse.StatusCode -eq 200) {
        Write-Host "✅ Signup page is accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Signup page returned status: $($signupResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to access signup page: $_" -ForegroundColor Red
    exit 1
}

# Check if required form elements are present
Write-Host "🔍 Checking signup form elements..." -ForegroundColor Blue

$pageContent = $signupResponse.Content
$requiredElements = @(
    'input.*name.*fullName',
    'input.*name.*businessName', 
    'input.*name.*email',
    'input.*name.*password',
    'input.*name.*confirmPassword'
)

$elementsFound = 0
foreach ($element in $requiredElements) {
    if ($pageContent -match $element) {
        $elementsFound++
    }
}

if ($elementsFound -eq $requiredElements.Length) {
    Write-Host "✅ All required form elements found" -ForegroundColor Green
} else {
    Write-Host "⚠️ Found $elementsFound/$($requiredElements.Length) required form elements" -ForegroundColor Yellow
}

# Load environment to check Supabase connection
Write-Host "🔍 Testing Supabase connectivity..." -ForegroundColor Blue

if (Test-Path ".env.local") {
    # Read .env.local file
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    
    $supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
    $anonKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if ($supabaseUrl -and $anonKey) {
        try {
            $headers = @{
                "apikey" = $anonKey
                "Authorization" = "Bearer $anonKey"
            }
            
            $supabaseResponse = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/" -Headers $headers -UseBasicParsing -TimeoutSec 10
            Write-Host "✅ Supabase connection successful" -ForegroundColor Green
        } catch {
            Write-Host "❌ Supabase connection failed: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ Supabase environment variables not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ .env.local file not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Manual Testing Instructions:" -ForegroundColor Blue
Write-Host "================================" -ForegroundColor Blue
Write-Host "1. Open browser to: http://localhost:3001/auth/signup" -ForegroundColor White
Write-Host "2. Open browser developer tools (F12)" -ForegroundColor White
Write-Host "3. Go to Console tab to see debug logs" -ForegroundColor White
Write-Host "4. Fill out the signup form with test data:" -ForegroundColor White
Write-Host "   - Full Name: Test User" -ForegroundColor Gray
Write-Host "   - Business Name: Test Company" -ForegroundColor Gray
Write-Host "   - Email: test@example.com" -ForegroundColor Gray
Write-Host "   - Password: password123" -ForegroundColor Gray
Write-Host "   - Confirm Password: password123" -ForegroundColor Gray
Write-Host "5. Click 'Create Account'" -ForegroundColor White
Write-Host "6. Watch console logs for debug information" -ForegroundColor White
Write-Host "7. Should redirect to verify-email page on success" -ForegroundColor White

Write-Host ""
Write-Host "🔍 Expected Console Logs:" -ForegroundColor Blue
Write-Host "=========================" -ForegroundColor Blue
Write-Host "📝 Submitting signup form with data: {...}" -ForegroundColor Gray
Write-Host "🚀 Starting signup process for: test@example.com" -ForegroundColor Gray
Write-Host "📝 User data: {...}" -ForegroundColor Gray
Write-Host "✅ Signup successful: test@example.com" -ForegroundColor Gray
Write-Host "👤 Creating user profile..." -ForegroundColor Gray
Write-Host "✅ User profile created successfully" -ForegroundColor Gray
Write-Host "✅ Signup form submission successful" -ForegroundColor Gray

Write-Host ""
Write-Host "🎉 Signup test preparation complete!" -ForegroundColor Green
Write-Host "Ready for manual testing at: http://localhost:3001/auth/signup" -ForegroundColor Blue 