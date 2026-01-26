import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../src/types/supabase";

// Load environment variables
const envPath = resolve(process.cwd(), ".env.local");
const envPathFallback = resolve(process.cwd(), ".env");
config({ path: envPath });
config({ path: envPathFallback, override: false });

async function checkEnums() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables!");
    process.exit(1);
  }
  
  console.log("To check enum values in your Supabase database, run this SQL query:");
  console.log("\n" + "=".repeat(60));
  console.log(`
-- Check scholarship_type enum values
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'scholarship_type'
ORDER BY e.enumsortorder;

-- Check status enum values
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'status'
ORDER BY e.enumsortorder;

-- Check preferred_date enum values
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'preferred_date'
ORDER BY e.enumsortorder;
  `);
  console.log("=".repeat(60));
  console.log("\nCopy and paste the above SQL into Supabase SQL Editor to see what enum values exist.");
  console.log("\nExpected values:");
  console.log("scholarship_type: 'UG RA 7687', 'UG Merit', 'JLSS RA 7687', 'JLSS Merit', 'JLSS RA 10612'");
  console.log("status: 'pending', 'rejected', 'accepted', 'waitlisted'");
  console.log("preferred_date: 'December 13', 'December 14'");
}

checkEnums();

