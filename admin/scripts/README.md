# Synthetic Data Generation Script

This script generates 1000 synthetic registration entries for each event day (December 13 and December 14) with varied distributions of universities and `has_dost_sa` values.

## Features

- **1000 entries per day**: Generates 1000 synthetic registrations for December 13 and 1000 for December 14
- **Varied university distribution**: Creates a realistic distribution where some universities have more registrants than others
- **Varied DOST SA distribution**: Approximately 30% of registrants have DOST SA (`has_dost_sa: true`)
- **Realistic data**: Generates realistic Filipino names, contact numbers, emails, courses, and other fields

## Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Usage

Run the script from the `admin` directory:

```bash
npm run generate-data
```

Or directly with tsx:

```bash
npx tsx scripts/generate-synthetic-data.ts
```

## Distribution Details

### University Distribution
- Top 5 universities: ~15% each
- Next 10 universities: ~5% each
- Next 10 universities: ~2% each
- Remaining universities: ~1% each

### DOST SA Distribution
- ~30% have DOST SA (`has_dost_sa: true`)
- ~70% do not have DOST SA (`has_dost_sa: false`)

### Other Fields
- **Status**: Mostly "pending" (60%), with some "accepted" (20%) and "waitlisted" (20%)
- **Has Attended GA**: ~40% have attended GA
- **Dietary Restrictions**: ~50% have no restrictions, rest have various restrictions
- **Scholarship Types**: Randomly distributed across all available types
- **Year Awarded**: Randomly distributed across available years (2018-2025)

## Notes

- The script inserts data in batches of 100 entries for efficiency
- Each entry has a unique email address (generated from name + index)
- Contact numbers are valid Philippine mobile number formats
- All entries are set to `is_checked_in: false` by default

