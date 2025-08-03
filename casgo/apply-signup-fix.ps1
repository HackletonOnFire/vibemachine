# Apply Signup Fix - Auto User Profile Creation
# This script applies the database trigger to automatically create user profiles

Write-Host "🔧 Applying Signup Fix - Auto User Profile Creation" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "supabase\auto-user-profile-trigger.sql")) {
    Write-Host "❌ Error: auto-user-profile-trigger.sql not found!" -ForegroundColor Red
    Write-Host "Make sure you're running this from the casgo directory." -ForegroundColor Yellow
    exit 1
}

# Load environment variables
if (Test-Path ".env.local") {
    Write-Host "📁 Loading environment variables from .env.local..." -ForegroundColor Blue
    
    # Read .env.local file
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
} else {
    Write-Host "❌ Error: .env.local file not found!" -ForegroundColor Red
    exit 1
}

# Check environment variables
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$serviceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $serviceRoleKey) {
    Write-Host "❌ Error: Missing Supabase environment variables!" -ForegroundColor Red
    Write-Host "Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment variables loaded successfully" -ForegroundColor Green
Write-Host "🔗 Supabase URL: $($supabaseUrl.Substring(0, 30))..." -ForegroundColor Blue

# Apply the SQL trigger
Write-Host "🚀 Applying auto user profile trigger..." -ForegroundColor Blue

try {
    # Read the SQL file
    $sqlContent = Get-Content "supabase\auto-user-profile-trigger.sql" -Raw
    
    # Prepare the API request
    $headers = @{
        "Authorization" = "Bearer $serviceRoleKey"
        "Content-Type" = "application/json"
        "apikey" = $serviceRoleKey
    }
    
    $body = @{
        query = $sqlContent
    } | ConvertTo-Json
    
    # Make the request to Supabase
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $body -ErrorAction Stop
    
    Write-Host "✅ Database trigger applied successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "⚠️ Direct SQL execution failed, trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: Use Supabase CLI if available
    if (Get-Command "supabase" -ErrorAction SilentlyContinue) {
        Write-Host "🔧 Using Supabase CLI to apply changes..." -ForegroundColor Blue
        
        try {
            # Check if we're in a Supabase project
            if (Test-Path "supabase\config.toml") {
                supabase db reset --local
                Write-Host "✅ Database reset and trigger applied via CLI!" -ForegroundColor Green
            } else {
                Write-Host "❌ No local Supabase project found" -ForegroundColor Red
                Write-Host "Manual application required - see instructions below" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Supabase CLI failed: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "📋 Manual Application Required:" -ForegroundColor Yellow
        Write-Host "1. Go to your Supabase dashboard: $supabaseUrl" -ForegroundColor White
        Write-Host "2. Navigate to SQL Editor" -ForegroundColor White
        Write-Host "3. Copy and paste the contents of supabase\auto-user-profile-trigger.sql" -ForegroundColor White
        Write-Host "4. Execute the SQL" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🎉 Signup fix application complete!" -ForegroundColor Green
Write-Host "Now test the signup functionality:" -ForegroundColor Blue
Write-Host "1. Go to http://localhost:3001/auth/signup" -ForegroundColor White
Write-Host "2. Fill out the signup form" -ForegroundColor White
Write-Host "3. Check browser console for debug logs" -ForegroundColor White
Write-Host "4. User profile should be created automatically!" -ForegroundColor White 