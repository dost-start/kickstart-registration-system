This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## QR Event Pass & Auto Check-in

The admin dashboard now issues human-readable event UIDs (e.g. `simera-dec13-1234`) and renders QR codes that encode those values. Each registrant can have:

- `event_uid` – unique code embedded in their QR pass
- `seat_assignment` – free-form seat label used in emails and on-site operations
- Automatic check-in via the `/siklab/check-in` console or the `/api/admin/check-in` endpoint

### Database requirements

Add the new columns to the `form_entries` table in Supabase. Example SQL:

```sql
alter table public.form_entries
  add column if not exists event_uid text unique,
  add column if not exists seat_assignment text;
```

Backfill existing rows by generating unique UIDs from the Registrant Details panel inside the admin app.

### Environment variables

`NEXT_PUBLIC_EVENT_UID_PREFIX` (optional) lets you change the UID prefix (defaults to `simera`). Set it to your event codename to keep QR codes consistent across deployments.

### QR rendering

QR previews use `https://api.qrserver.com/v1/create-qr-code`. If you prefer to self-host QR generation, replace the preview URL in `EventPassSection` with your own service.
