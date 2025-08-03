# 🐛 Onboarding Loading Issue - Debugging Guide

## Issue Description
The onboarding wizard gets stuck in the loading screen when clicking "Complete Setup" on Step 3 (Sustainability Goals).

## Database Verification ✅
- **Database operations are working correctly** (verified by end-to-end test)
- User profile updates: ✅ Working
- Energy data creation: ✅ Working  
- Sustainability goals creation: ✅ Working
- Dashboard data fetch: ✅ Working

## Browser Testing Steps

### 1. Start Development Server
```powershell
# In ecomind directory
npm run dev
```

### 2. Open Browser & Developer Console
1. Navigate to: `http://localhost:3000/onboarding`
2. Open Developer Tools (F12)
3. Go to **Console** tab
4. Clear existing logs

### 3. Test Authentication
1. If not logged in, you should be redirected to login
2. Log in with existing user credentials
3. Should redirect back to onboarding

### 4. Complete Onboarding Flow
**Step 1 - Business Basics:**
- Fill in business information
- Click "Continue to Energy Usage"
- ✅ Should proceed to Step 2

**Step 2 - Energy Usage:**
- Select "Manual Entry"
- Enter some energy values (e.g., 1200 kWh)
- Click "Continue to Goals" 
- ✅ Should proceed to Step 3

**Step 3 - Sustainability Goals:**
- Select 1-2 goals (click on goal cards)
- Adjust target percentages if desired
- Click "Complete Setup" ⚠️ **THIS IS WHERE IT MIGHT GET STUCK**

### 5. Watch Console Output
When clicking "Complete Setup", look for these console messages:

**Expected Success Flow:**
```
Submitting onboarding data for user: [user-id]
Onboarding data saved successfully: [data object]
Onboarding saved successfully to database
```

**Possible Error Patterns:**
```
❌ No user ID available for onboarding submission
❌ Failed to save onboarding data: [error message]
❌ Onboarding submission error: [error details]
❌ Network error or timeout
```

### 6. Check Network Tab
1. Go to **Network** tab in Developer Tools
2. Click "Complete Setup"
3. Look for failed requests (red entries)
4. Check for any Supabase API calls that fail

## Common Issues & Solutions

### Issue 1: Authentication Session Expired
**Symptoms:** "No user ID available" error
**Solution:** Refresh page and log in again

### Issue 2: Network/Supabase Connection
**Symptoms:** Network errors in console
**Solution:** Check internet connection and Supabase status

### Issue 3: Database Schema Mismatch
**Symptoms:** "Invalid enum value" or schema errors
**Solution:** Check that form data matches database enum types

### Issue 4: React Component Error
**Symptoms:** Component crashes or infinite loading
**Solution:** Check React error messages in console

## Manual Testing Commands

### Test Current User Session
```javascript
// Run in browser console
console.log('Current user:', localStorage.getItem('sb-rbhdeusdtzxagvniikef-auth-token'));
```

### Test Onboarding Service Directly
```javascript
// Run in browser console to test the save function
import { onboardingService } from '../lib/onboarding';

const testData = {
  businessBasics: {
    business_name: "Debug Test Co",
    industry: "technology", 
    company_size: "small",
    location: "Test City"
  },
  energyUsage: {
    data_source: "manual",
    kwh_usage: 1000
  },
  sustainabilityGoals: {
    selectedGoals: [],
    targetTimeline: "1_year",
    priorityLevel: "medium", 
    primaryMotivation: "cost_savings"
  }
};

// This should complete without hanging
onboardingService.saveOnboardingData("user-id", testData)
  .then(result => console.log('Test result:', result))
  .catch(error => console.error('Test error:', error));
```

## Next Steps Based on Findings

### If Console Shows Success But Still Loading:
- Issue is in the redirect logic (`router.push('/dashboard')`)
- Check if dashboard route is accessible
- Try manually navigating to `/dashboard`

### If Console Shows Database Errors:
- Check specific error message
- Verify user has proper permissions
- Check that enum values match database schema

### If No Console Output at All:
- Component might be crashing silently
- Check React error boundary
- Look for JavaScript errors in console

### If Network Requests Fail:
- Check Supabase connection
- Verify environment variables are loaded
- Check browser network connectivity

## Test User Credentials
Use the test user from our end-to-end test:
- **User ID:** `1de561d6-33b8-49d8-bc50-a3d508648384`
- **Email:** `mishalma@ecotech.com`

## Expected Working Flow
1. Click "Complete Setup" 
2. See "Saving your data..." overlay
3. Brief pause (1-3 seconds)
4. Success alert: "🎉 Onboarding completed successfully!"
5. Automatic redirect to dashboard (`/dashboard`)
6. Dashboard loads with user's data

---

Please follow these steps and report what you see in the browser console when the loading gets stuck! 