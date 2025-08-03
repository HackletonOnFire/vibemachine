# 🗄️ Supabase Setup Verification Checklist

## ✅ Setup Checklist

### 1. Supabase Project Creation
- [ ] Created Supabase account at [supabase.com](https://supabase.com)
- [ ] Created new project named `casgo-sustainability`
- [ ] Saved database password securely
- [ ] Project is fully deployed (green status)

### 2. Database Schema Setup
- [ ] Opened SQL Editor in Supabase dashboard
- [ ] Ran the entire `supabase/schema.sql` file successfully
- [ ] Ran the entire `supabase/rls-policies.sql` file successfully
- [ ] No error messages in SQL execution

### 3. Environment Configuration
- [ ] Created `.env.local` file in `/casgo` folder
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` with your project URL
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your anon key
- [ ] File is in `.gitignore` (don't commit these secrets!)

### 4. Connection Testing
- [ ] Ran `node scripts/test-database.js` successfully
- [ ] All 5 tables exist (users, energy_data, sustainability_goals, recommendations, goal_progress)
- [ ] RLS (Row Level Security) is working
- [ ] No connection errors

### 5. Tables Created Successfully
You should see these tables in your Supabase dashboard under "Table Editor":

#### Core Tables:
- **users** - User profiles and business information
- **energy_data** - Energy usage measurements (kWh, therms, costs)
- **sustainability_goals** - User-defined targets and progress
- **recommendations** - AI-generated suggestions and ROI data
- **goal_progress** - Historical progress tracking

#### Custom Types (Enums):
- **industry_type** - Technology, Manufacturing, Healthcare, etc.
- **company_size** - Startup, Small, Medium, Large, Enterprise
- **goal_status** - Draft, Active, Completed, Paused, Cancelled
- **recommendation_priority** - Low, Medium, High, Critical
- **recommendation_status** - Pending, In Progress, Completed, etc.

## 🚨 Common Issues & Solutions

### Issue: "Missing environment variables"
**Solution:** Make sure `.env.local` is in the `/casgo` folder (not the root folder)

### Issue: "Connection failed"
**Solutions:**
1. Check your Supabase project is fully deployed (not paused)
2. Verify URL and keys are copied correctly (no extra spaces)
3. Make sure you're using the anon key, not the service role key

### Issue: "Table not found"
**Solutions:**
1. Re-run the `schema.sql` file in SQL Editor
2. Check for error messages in the SQL execution
3. Make sure you ran the ENTIRE schema file, not just parts

### Issue: "RLS policies not working"
**Solutions:**
1. Run the `rls-policies.sql` file after the schema
2. Check Authentication > Policies in Supabase dashboard
3. Enable RLS on all tables

## 🎯 What You've Built

Your database now supports:

### User Management
- Complete business profiles with industry/size classification
- Onboarding progress tracking
- User preferences and settings

### Energy Tracking
- Multiple energy types (electricity, gas, water)
- Cost tracking and billing periods
- Data quality scoring and validation
- Multiple data sources (manual, CSV, API, meters)

### Goal Management
- Flexible target setting with multiple units
- Progress tracking and percentage completion
- ROI calculations and cost/savings estimates
- Priority and timeline management

### AI Recommendations
- Financial analysis (cost, savings, payback, ROI, NPV)
- Environmental impact (CO2, energy, water savings)
- Implementation details and resource requirements
- User feedback and rating system
- AI confidence scoring

### Progress Analytics
- Historical progress tracking
- Measurement date tracking
- Data source attribution
- Notes and context

## 🚀 Next Steps

Once your database is working:

1. **Test the dashboard**: Run `npm run dev` and visit `http://localhost:3000/dashboard`
2. **Add sample data**: We'll create some test data to see the dashboard in action
3. **Connect components**: Replace mock data with real database queries
4. **Set up authentication**: Enable user registration and login
5. **Test the full flow**: Onboarding → Dashboard → Recommendations

## 📞 Need Help?

If you encounter any issues:
1. Check the test script output for specific error messages
2. Verify your `.env.local` file has correct values
3. Make sure Supabase project is active (not paused)
4. Check the Supabase dashboard logs for detailed error information

---

**✅ Once all checkboxes are complete, you're ready for the next phase!** 