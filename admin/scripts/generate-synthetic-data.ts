import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { Database, TablesInsert } from "../src/types/supabase";
import { UNIVERSITY_OPTIONS, SCHOLARSHIP_OPTIONS, YEAR_AWARDED_OPTIONS } from "../src/types/types";

// Load environment variables from .env.local (Next.js convention) or .env
const envPath = resolve(process.cwd(), ".env.local");
const envPathFallback = resolve(process.cwd(), ".env");
config({ path: envPath });
config({ path: envPathFallback, override: false }); // Don't override if .env.local exists

// Common Filipino first names
const FIRST_NAMES = [
  "Maria", "Juan", "Jose", "Ana", "Carlos", "Rosa", "Antonio", "Carmen",
  "Francisco", "Elena", "Manuel", "Patricia", "Ricardo", "Cristina",
  "Roberto", "Angela", "Fernando", "Monica", "Eduardo", "Grace",
  "Miguel", "Jennifer", "Rafael", "Michelle", "Alberto", "Karen",
  "Jose", "Sarah", "Luis", "Nicole", "Pedro", "Stephanie", "Ramon",
  "Christine", "Enrique", "Diana", "Alfredo", "Rachel", "Victor",
  "Jessica", "Daniel", "Amanda", "Mario", "Melissa", "Andres", "Lisa"
];

// Common Filipino last names
const LAST_NAMES = [
  "Santos", "Reyes", "Cruz", "Bautista", "Ocampo", "Garcia", "Mendoza",
  "Torres", "Andres", "Castillo", "Villanueva", "Fernandez", "Ramos",
  "Gonzales", "Lopez", "Martinez", "Rivera", "Dela Cruz", "Rodriguez",
  "Perez", "Sanchez", "Morales", "Aquino", "Castro", "Romero", "Dela Rosa",
  "Villanueva", "Mendoza", "Alvarez", "Jimenez", "Moreno", "Herrera",
  "Medina", "Santiago", "Vargas", "Ortega", "Diaz", "Flores", "Ramos"
];

// Common middle names
const MIDDLE_NAMES = [
  "Antonio", "Jose", "Francisco", "Manuel", "Rafael", "Carlos", "Luis",
  "Miguel", "Roberto", "Ricardo", "Fernando", "Eduardo", "Alberto",
  "Enrique", "Victor", "Daniel", "Mario", "Andres", "Alfredo", "Ramon"
];

// Common courses
const COURSES = [
  "Computer Science", "Information Technology", "Computer Engineering",
  "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
  "Electronics Engineering", "Chemical Engineering", "Industrial Engineering",
  "Mathematics", "Physics", "Chemistry", "Biology", "Accountancy",
  "Business Administration", "Economics", "Psychology", "Education",
  "Nursing", "Medicine", "Pharmacy", "Architecture", "Fine Arts"
];

// Common suffixes
const SUFFIXES = ["Jr.", "II", null, null, null, null, null, null, null, null];

// Dietary restrictions options
const DIETARY_RESTRICTIONS = [
  null, null, null, null, null, // 50% no restrictions
  "Vegetarian",
  "Vegan",
  "No pork",
  "No beef",
  "No seafood",
  "Gluten-free",
  "Lactose intolerant",
  "Halal",
  "No nuts"
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail(firstName: string, lastName: string, index: number): string {
  const domains = ["gmail.com", "outlook.com", "student.edu.ph"];
  const domain = randomElement(domains);

  const variations = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}${index}@${domain}`,
    `${firstName.toLowerCase()}${index}${lastName.toLowerCase()}@${domain}`,
    `${lastName.toLowerCase()}.${firstName.toLowerCase()}${index}@${domain}`
  ];
  return randomElement(variations);
}

function generateContactNumber(): string {
  const prefixes = ["0917", "0918", "0919", "0920", "0921", "0922", "0923", "0924", "0925", "0926", "0927", "0928", "0929", "0930", "0931", "0932", "0933", "0934", "0935", "0936", "0937", "0938", "0939", "0940", "0941", "0942", "0943", "0944", "0945", "0946", "0947", "0948", "0949", "0950", "0951", "0952", "0953", "0954", "0955", "0956", "0970", "0971", "0972", "0973", "0974", "0975", "0976", "0977", "0978", "0979", "0980", "0981", "0982", "0983", "0984", "0985", "0986", "0987", "0988", "0989", "0990", "0991", "0992", "0993", "0994", "0995", "0996", "0997", "0998", "0999"];
  const prefix = randomElement(prefixes);
  const suffix = String(randomInt(1000000, 9999999));
  return prefix + suffix;
}

function selectUniversityFromDistribution(universityDistribution: Map<string, number>): string {
  // Get all universities with remaining counts > 0
  const availableUniversities = Array.from(universityDistribution.entries())
    .filter(([_, count]) => count > 0)
    .map(([uni, _]) => uni);
  
  if (availableUniversities.length === 0) {
    // Fallback to any university if distribution is exhausted
    return randomElement(Array.from(universityDistribution.keys()));
  }
  
  // Select randomly from available universities
  return randomElement(availableUniversities);
}

function selectDostSaFromDistribution(dostSaDistribution: { true: number; false: number }): boolean {
  if (dostSaDistribution.true > 0 && dostSaDistribution.false > 0) {
    const total = dostSaDistribution.true + dostSaDistribution.false;
    const hasDostSa = Math.random() < (dostSaDistribution.true / total);
    if (hasDostSa) {
      dostSaDistribution.true--;
    } else {
      dostSaDistribution.false--;
    }
    return hasDostSa;
  } else if (dostSaDistribution.true > 0) {
    dostSaDistribution.true--;
    return true;
  } else {
    dostSaDistribution.false--;
    return false;
  }
}

function generateSyntheticEntry(
  preferredDate: "December 13" | "December 14",
  index: number,
  universityDistribution: Map<string, number>,
  dostSaDistribution: { true: number; false: number }
): TablesInsert<"kickstart_form_entries"> {
  const firstName = randomElement(FIRST_NAMES);
  const lastName = randomElement(LAST_NAMES);
  const middleName = randomBoolean(0.3) ? randomElement(MIDDLE_NAMES) : null;
  const suffix = randomElement(SUFFIXES);
  
  // Select university based on distribution (ensuring exact counts)
  const university = selectUniversityFromDistribution(universityDistribution);
  const currentCount = universityDistribution.get(university) || 0;
  if (currentCount > 0) {
    universityDistribution.set(university, currentCount - 1);
  }
  
  // Select has_dost_sa based on distribution (ensuring exact counts)
  const hasDostSa = selectDostSaFromDistribution(dostSaDistribution);
  
  if (preferredDate === "December 14") {
    index += 1000;
  }
  const email = generateEmail(firstName, lastName, index);
  const contactNumber = generateContactNumber();
  const course = randomElement(COURSES);
  const scholarshipType = randomElement([...SCHOLARSHIP_OPTIONS]) as Database["public"]["Enums"]["scholarship_type"];
  const yearAwarded = randomElement([...YEAR_AWARDED_OPTIONS]);
  const hasAttendedGA = randomBoolean(0.2); // 20% have attended GA
  const dietaryRestrictions = randomElement(DIETARY_RESTRICTIONS) as string | null;
  const status = "pending" as Database["public"]["Enums"]["status"];
  
  return {
    first_name: firstName,
    last_name: lastName,
    middle_name: middleName,
    suffix: suffix,
    email: email,
    contact_number: contactNumber,
    university: university as Database["public"]["Enums"]["university"],
    university_custom: null,
    course: course,
    scholarship_type: scholarshipType,
    year_awarded: yearAwarded,
    status: status,
    is_checked_in: false,
    has_attended_ga: hasAttendedGA,
    has_dost_sa: hasDostSa,
    dietary_restrictions: dietaryRestrictions,
    preferred_date: preferredDate as Database["public"]["Enums"]["preferred_date"],
    created_at: new Date().toISOString(),
  };
}

function createUniversityDistribution(total: number): Map<string, number> {
  const distribution = new Map<string, number>();
  const universities = [...UNIVERSITY_OPTIONS];
  
  // Create a varied distribution - some universities get more, some get less
  const weights = universities.map((_, i) => {
    // Create a distribution that favors some universities more
    if (i < 5) return 0.15; // Top 5 universities get 15% each
    if (i < 15) return 0.05; // Next 10 get 5% each
    if (i < 25) return 0.02; // Next 10 get 2% each
    return 0.01; // Rest get 1% each
  });
  
  // Normalize weights
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = weights.map(w => w / totalWeight);
  
  // Allocate counts
  let remaining = total;
  for (let i = 0; i < universities.length - 1; i++) {
    const count = Math.floor(total * normalizedWeights[i]);
    distribution.set(universities[i], count);
    remaining -= count;
  }
  // Last university gets the remainder
  distribution.set(universities[universities.length - 1], remaining);
  
  return distribution;
}

function createDostSaDistribution(total: number): { true: number; false: number } {
  // Vary the distribution - let's say 30% have DOST SA
  const hasDostSa = Math.floor(total * 0.3);
  const noDostSa = total - hasDostSa;
  return { true: hasDostSa, false: noDostSa };
}

async function generateDataForDay(
  supabase: ReturnType<typeof createClient<Database>>,
  preferredDate: "December 13" | "December 14",
  count: number
): Promise<void> {
  console.log(`\nGenerating ${count} entries for ${preferredDate}...`);
  
  // Create distributions
  const universityDistribution = createUniversityDistribution(count);
  const dostSaDistribution = createDostSaDistribution(count);
  
  console.log(`University distribution for ${preferredDate}:`);
  Array.from(universityDistribution.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([uni, count]) => {
      console.log(`  ${uni}: ${count}`);
    });
  
  console.log(`DOST SA distribution for ${preferredDate}:`);
  console.log(`  Has DOST SA: ${dostSaDistribution.true}`);
  console.log(`  No DOST SA: ${dostSaDistribution.false}`);
  
  // Generate entries in batches of 100
  const batchSize = 100;
  const batches = Math.ceil(count / batchSize);
  
  for (let batch = 0; batch < batches; batch++) {
    const batchStart = batch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, count);
    const batchCount = batchEnd - batchStart;
    
    const entries: TablesInsert<"kickstart_form_entries">[] = [];
    for (let i = 0; i < batchCount; i++) {
      entries.push(generateSyntheticEntry(preferredDate, batchStart + i, universityDistribution, dostSaDistribution));
    }
    
    const { error } = await supabase.from("kickstart_form_entries").insert(entries);
    
    if (error) {
      console.error(`\n❌ Error inserting batch ${batch + 1} for ${preferredDate}:`, error);
      console.error(`\nThis error usually means the enum values in your database don't match.`);
      console.error(`\nTo fix this:`);
      console.error(`1. Go to Supabase Dashboard → SQL Editor`);
      console.error(`2. Run the script: admin/sql/recreate_table_with_correct_enums.sql`);
      console.error(`3. This will recreate the table and enums with correct values`);
      console.error(`\nThe script is trying to use these scholarship_type values:`);
      const uniqueTypes = [...new Set(entries.map(e => e.scholarship_type))];
      console.error(`  ${uniqueTypes.join(', ')}`);
      throw error;
    }
    
    console.log(`  Inserted batch ${batch + 1}/${batches} (${batchCount} entries)`);
  }
  
  console.log(`✓ Completed generating ${count} entries for ${preferredDate}`);
}

async function main() {

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables!");
    console.error("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
  }
  
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);
  
  console.log("Starting synthetic data generation...");
  console.log("This will create 1000 entries for December 13 and 1000 entries for December 14");
  
  try {
    // Generate data for December 13
    await generateDataForDay(supabase, "December 13", 1000);
    
    // Generate data for December 14
    await generateDataForDay(supabase, "December 14", 1000);
    
    console.log("\n✓ Successfully generated all synthetic data!");
    console.log("Total: 2000 entries (1000 for December 13, 1000 for December 14)");
  } catch (error) {
    console.error("Error generating synthetic data:", error);
    process.exit(1);
  }
}

main();

