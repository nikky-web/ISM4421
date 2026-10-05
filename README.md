# Haven Host Hub

A simple, clean dashboard for managing Haven Accommodations' Airbnb properties
remotely: cleaning schedules, check-ins/checkouts, maintenance requests, and
tasks — all in one place, built for phone and laptop.

Built with React + TypeScript + Vite + Tailwind CSS, and [Supabase](https://supabase.com)
for real sign-up / log-in / log-out and a database where **each account only
ever sees its own properties, tasks, and bookings** (enforced by Postgres Row
Level Security, not just app logic).

---

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (free tier is fine).
2. Click **New project**. Pick any name/region, set a database password (save
   it somewhere), and wait ~2 minutes for it to finish provisioning.
3. In the left sidebar, go to **Project Settings → API**. You'll need two
   values from this page in a minute:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

## 2. Create the database tables

1. In the Supabase dashboard, open **SQL Editor** (left sidebar) → **New query**.
2. Open [`supabase/schema.sql`](./supabase/schema.sql) from this repo, copy the
   whole file, paste it into the SQL editor, and click **Run**.
3. This creates the `properties`, `bookings`, and `tasks` tables and turns on
   Row Level Security so every row is locked to the account that created it.

That's it — no other configuration is required. Email/password sign-up is on
by default. (Optional: Supabase sends a confirmation email on sign-up. For
quick classroom testing you can turn this off under **Authentication →
Providers → Email → "Confirm email"** so new accounts can log in immediately.
Leave it on if you'd rather test the real email-confirmation flow.)

## 3. Run it locally (optional, to try it before deploying)

```bash
npm install
cp .env.example .env
# edit .env and paste in your Project URL and anon public key
npm run dev
```

Open the printed `localhost` URL, sign up with any email/password, and you're in.

## 4. Deploy to Netlify

1. Push this repo to GitHub (already done if you're reading this there).
2. In [Netlify](https://app.netlify.com), click **Add new site → Import an
   existing project**, and pick this GitHub repo.
3. Build settings are already set via `netlify.toml` (`npm run build`,
   publish directory `dist`) — you shouldn't need to change anything.
4. Before the first deploy, add your Supabase credentials: **Site
   configuration → Environment variables → Add a variable**, and add:
   - `VITE_SUPABASE_URL` → your Project URL
   - `VITE_SUPABASE_ANON_KEY` → your anon public key
5. Click **Deploy site**. Netlify will build and give you a live URL
   (something like `https://your-site-name.netlify.app`).

If you ever change an environment variable, trigger **Deploys → Trigger
deploy → Clear cache and deploy site** so the new value gets baked in (Vite
reads env vars at build time).

## 5. Test the login (for your professor, or yourself)

1. Open your deployed Netlify URL.
2. Click **Sign up**, enter a name, email, and password, and submit.
   - If email confirmation is on, check that inbox and click the confirm
     link, then come back and log in.
   - If you turned email confirmation off in step 2, you're logged in
     immediately.
3. You'll land on an empty **Dashboard**. Click **Load sample data** to add
   four clearly-labeled sample properties ("Sample: Seaside Bungalow", etc.)
   with sample guests, bookings, and tasks — no real guest info needed to try
   the app. Click **Clear sample data** any time to remove them again.
4. Click **Log out** (sidebar on desktop, top-right on mobile), then log back
   in with the same email/password to confirm the session persists.
5. To verify accounts are isolated: open an incognito/private window, sign up
   with a *second* email, and confirm that account starts empty with no
   access to the first account's properties — each account is restricted to
   its own data at the database level via Supabase Row Level Security.

## What's inside

- **Dashboard** — what needs attention: overdue/urgent tasks, upcoming
  check-ins & checkouts across all properties, open maintenance requests.
- **Properties** — add/edit/delete each of your listings (name, address,
  type, notes).
- **Property detail** — per-property bookings (check-in/checkout/status),
  and a cleaning / maintenance / general task board you can add to, edit,
  and tap to advance (pending → in progress → done).
- **Sample data** — one click to load or clear clearly-labeled sample
  properties, guests, and tasks for safe testing.

## Tech notes

- `src/lib/supabase.ts` — Supabase client, reads `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` from environment variables.
- `supabase/schema.sql` — table definitions + Row Level Security policies
  (re-runnable; safe to run again if you ever need to reset policies).
- `src/contexts/AuthContext.tsx` — sign up / log in / log out.
- `src/contexts/DataContext.tsx` — all property/booking/task reads & writes.
- Tailwind theme colors (beige/white/soft gold) are defined in `src/index.css`.
