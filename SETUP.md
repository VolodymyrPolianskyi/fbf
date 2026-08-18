# framebyframe — setup

You need two accounts: **Supabase** (database + auth) and **Google Cloud**
(the OAuth app that the "Sign up with Google" button talks to). Both are free.

## 1. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000. The page renders straight away; the sign-up button
shows a "not wired up yet" note until you finish step 2.

## 2. Create the Supabase project

1. Go to https://supabase.com/dashboard and create a new project.
2. Open **Project Settings -> API Keys**. Copy the **Project URL** and the
   **anon / public** key.
3. Put them in `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

   The anon key is safe to expose in the browser — row level security is what
   protects the data. Never put the `service_role` key in this file.

4. Open **SQL Editor -> New query**, paste the whole of
   `supabase/schema.sql`, and run it. That creates the `early_access` table and
   the trigger that files each new signup into it.

## 3. Create the Google OAuth client

1. Go to https://console.cloud.google.com/ and create a project.
2. **APIs & Services -> OAuth consent screen**: pick *External*, fill in the app
   name (`framebyframe`), your support email, and save. While it is in *Testing*
   mode only accounts you add under *Test users* can sign in — press
   **Publish app** when you want it open to everyone.
3. **APIs & Services -> Credentials -> Create credentials -> OAuth client ID**:
   - Application type: **Web application**
   - Authorised JavaScript origins: `http://localhost:3000` (add your live
     domain later too)
   - Authorised redirect URI: the callback URL Supabase shows you in the next
     step — it looks like `https://xxxxxxxx.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client secret**.

## 4. Connect the two

In Supabase: **Authentication -> Sign In / Providers -> Google**. Enable it,
paste the Client ID and Client secret, and save.

Then under **Authentication -> URL Configuration**:

- Site URL: `http://localhost:3000` (swap to your real domain when you deploy)
- Redirect URLs: add `http://localhost:3000/auth/callback` and, later,
  `https://your-domain.com/auth/callback`

Restart `npm run dev`. The Google button now works, and each signup shows up in
**Table Editor -> early_access**.

## 5. Deploy

The easiest host is Vercel:

```bash
npm i -g vercel
vercel
```

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel
project's **Environment Variables**, then repeat step 4 with the live domain
(Supabase Site URL + redirect URL, and Google authorised origins).

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Button says "not wired up yet" | `.env.local` missing or dev server not restarted |
| `redirect_uri_mismatch` from Google | The Supabase callback URL is not in the Google credentials |
| Signed in but no member number | `supabase/schema.sql` was never run |
| Redirected back to `/?error=auth` | The site's `/auth/callback` URL is not in Supabase's redirect list |
