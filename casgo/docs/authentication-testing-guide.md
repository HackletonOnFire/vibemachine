# Authentication System Testing Guide

This guide explains how to test the EcoMind authentication system to ensure everything is working correctly before proceeding with development.

## Prerequisites

### 1. Environment Setup

First, ensure your environment variables are properly configured:

```bash
# Copy the environment template
cp env.example .env.local

# Edit .env.local with your actual Supabase credentials
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key  
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### 2. Database Setup

Ensure your database schema is up to date:

```bash
# Test database connection
npm run test:database

# Seed sample data if needed
npm run seed:database
```

## Testing Methods

### Method 1: Command Line Testing

Run the comprehensive authentication test script:

```bash
npm run test:auth
```

This script will:
- ✅ Verify environment variables are set
- ✅ Test Supabase connection and auth service
- ✅ Validate database schema and table access
- ✅ Check auth configuration
- ✅ Verify auth function availability
- ✅ Provide setup instructions for OAuth

**Expected Output:**
```
🔐 Testing EcoMind Authentication System...

📋 Environment Variables Check:
  ✅ NEXT_PUBLIC_SUPABASE_URL: Set (https://rbhdeusdtzxa...)
  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Set (eyJhbGciOiJIUzI1NiI...)
  ✅ SUPABASE_SERVICE_ROLE_KEY: Set (eyJhbGciOiJIUzI1NiI...)

🔍 Testing Supabase Connection:
  ✅ Auth service connected successfully
  ✅ Database connected successfully
  📊 Users table has 5 records

⚙️ Testing Auth Configuration:
  ✅ Auth configuration loaded:
    - autoRefreshToken: true
    - persistSession: true
    - detectSessionInUrl: true
    - flowType: pkce

📊 Database Schema Validation:
  ✅ Table 'users': Accessible
  ✅ Table 'energy_data': Accessible
  ✅ Table 'sustainability_goals': Accessible
  ✅ Table 'recommendations': Accessible

🧪 Auth Functions Test (Simulation):
  ✅ Auth function 'signUp' is available
  ✅ Auth function 'signIn' is available
  ✅ Auth function 'signInWithGoogle' is available
  ✅ Auth function 'signOut' is available
  ✅ Auth function 'resetPassword' is available
  ✅ Auth function 'updateUser' is available
  ✅ Auth function 'verifyOtp' is available

🎉 Authentication System Test Complete!
```

### Method 2: Browser Testing

#### Start the Development Server

```bash
npm run dev
```

#### Access the Test Page

Navigate to: `http://localhost:3000/test-auth`

The test page provides:
- **Current User Status** - Shows if a user is authenticated
- **Authentication Functions** - Buttons to test each auth method
- **Automated Test Results** - Real-time test results for auth utilities
- **Setup Instructions** - Guidance for proper configuration

#### Test Scenarios

1. **Sign Up Testing**
   - Click "Test Sign Up" 
   - Creates a test user with email `test-{timestamp}@example.com`
   - Should show success message about email verification

2. **Sign In Testing**
   - Click "Test Sign In"
   - Attempts to sign in with `test@example.com`
   - Will fail if user doesn't exist (expected)

3. **Google OAuth Testing** (requires configuration)
   - Click "Test Google Sign In"
   - Should redirect to Google OAuth flow
   - Returns to `/auth/callback` page after authentication

4. **Password Reset Testing**
   - Click "Test Password Reset"
   - Sends reset email to `test@example.com`
   - Should show success message

5. **Sign Out Testing**
   - If authenticated, click "Sign Out"
   - Should clear user session and update UI

## OAuth Configuration (Optional)

To test Google OAuth, configure it in your Supabase dashboard:

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local testing)

### 2. Configure Supabase

1. Go to your Supabase dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
5. Save the configuration

### 3. Test OAuth Flow

1. Visit `http://localhost:3000/test-auth`
2. Click "Test Google Sign In"
3. Should redirect to Google authentication
4. After successful auth, returns to callback page
5. User should be created in the database

## Authentication Flow Testing

### Complete Flow Test

Test the entire authentication flow:

1. **New User Signup**
   ```
   Visit /test-auth → Sign Up → Email Verification → Callback → Onboarding
   ```

2. **Existing User Login**
   ```
   Visit /test-auth → Sign In → Callback → Dashboard (if onboarded) or Onboarding
   ```

3. **Google OAuth**
   ```
   Visit /test-auth → Google Sign In → Google Auth → Callback → Profile Creation → Onboarding
   ```

### Expected Callback Behavior

The `/auth/callback` page should:
- Handle OAuth redirects properly
- Create user profiles for new users
- Redirect to onboarding if profile incomplete
- Redirect to dashboard if onboarding complete
- Show appropriate error messages for failed auth

## Troubleshooting

### Common Issues

1. **Environment Variables Missing**
   ```
   ❌ Missing required environment variables
   ```
   - Solution: Copy `env.example` to `.env.local` and fill in values

2. **Database Connection Failed**
   ```
   ❌ Database connection error: relation "users" does not exist
   ```
   - Solution: Run database schema setup scripts

3. **Auth Service Error**
   ```
   ❌ Auth service error: Invalid API key
   ```
   - Solution: Check your Supabase anon key is correct

4. **Google OAuth Not Working**
   ```
   ❌ OAuth error: unauthorized_client
   ```
   - Solution: Check Google OAuth configuration and redirect URLs

### Debug Mode

Enable debug mode by setting:
```bash
NODE_ENV=development
```

This enables additional logging in the browser console for auth operations.

## Next Steps

After successful testing:

1. ✅ All command-line tests pass
2. ✅ Browser tests work correctly  
3. ✅ OAuth flows (if configured) work
4. ✅ Database operations successful
5. ✅ Error handling works properly

You're ready to proceed with:
- Task 5.2: Create authentication context and hooks
- Task 5.3: Implement login form components
- Task 5.4: Implement signup form components

## Testing Checklist

- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] Command-line tests pass
- [ ] Browser test page accessible
- [ ] Sign up/sign in functions work
- [ ] Auth callback page works
- [ ] Error handling displays properly
- [ ] Google OAuth configured (optional)
- [ ] OAuth flow completes successfully (optional)
- [ ] User profile creation works
- [ ] Onboarding redirection works

Once all items are checked, the authentication system is ready for production use! 