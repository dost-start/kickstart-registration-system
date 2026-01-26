import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../src/types/supabase";

// Load environment variables
const envPath = resolve(process.cwd(), ".env.local");
const envPathFallback = resolve(process.cwd(), ".env");
config({ path: envPath });
config({ path: envPathFallback, override: false });

async function checkEnumValues() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables!");
    process.exit(1);
  }
  
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);
  
  console.log("Checking enum values in database...\n");
  
  // Query the enum values directly from PostgreSQL
  // We'll use a raw SQL query through Supabase RPC or try to query the table structure
  try {
    // Try to get a sample row to see what values are accepted
    const { data, error } = await supabase
      .from("kickstart_form_entries")
      .select("scholarship_type")
      .limit(1);
    
    if (error) {
      console.error("Error querying table:", error);
      console.log("\nPlease run this SQL query in Supabase SQL Editor to check enum values:");
      console.log(`
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'scholarship_type'
ORDER BY e.enumsortorder;
      `);
    } else {
      console.log("Sample data:", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
  
  console.log("\nTo check enum values, run this SQL in Supabase SQL Editor:");
  console.log(`
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'scholarship_type'
ORDER BY e.enumsortorder;
  `);
}

checkEnumValues();

