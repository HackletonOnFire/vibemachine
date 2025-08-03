// Test script to verify Supabase connection
// Run with: node scripts/test-supabase.js

const { createClient } = require("@supabase/supabase-js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

async function testSupabaseConnection() {
  console.log("🧪 Testing Supabase Connection...\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("📋 Environment Variables:");
  console.log(`  - SUPABASE_URL: ${supabaseUrl ? "✅ Set" : "❌ Missing"}`);
  console.log(
    `  - SUPABASE_ANON_KEY: ${supabaseAnonKey ? "✅ Set" : "❌ Missing"}`,
  );
  console.log(
    `  - SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? "✅ Set" : "❌ Missing"}\n`,
  );

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("❌ Missing required Supabase credentials");
    return;
  }

  try {
    // Test 1: Anon key and Auth service
    console.log("🔑 Testing with anon key...");
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } =
      await supabaseAnon.auth.getSession();

    if (authError) {
      console.log(`❌ Auth service connection failed: ${authError.message}`);
    } else {
      console.log("✅ Anon key and Auth service connection successful.");
    }

    // Test 2: Service role key
    if (supabaseServiceKey) {
      console.log("🔑 Testing with service role key...");
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      if (supabaseAdmin) {
        console.log("✅ Service role client initialized successfully.");
      } else {
        console.log("❌ Service role client failed to initialize.");
      }
    }

    const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
    console.log(`\n📊 Project Reference: ${projectRef || "Unable to extract"}`);

    console.log("\n🎉 Supabase configuration test completed!");
  } catch (error) {
    console.log(`❌ A critical error occurred: ${error.message}`);
  }
}

testSupabaseConnection().catch(console.error);
