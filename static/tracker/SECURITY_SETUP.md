## Secure tracker setup (Supabase)

1. Create a Supabase project.
2. In Supabase SQL Editor, run `/tracker/supabase.sql`.
3. In Auth settings:
   - Keep email auth enabled.
   - Disable open signups if you want invite-only access.
   - Add/invite the allowed user email(s).
4. Fill `/tracker/config.js`:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` (public anon key)
   - `ALLOWED_EMAIL` (optional extra client-side restriction; use semicolon or comma separated list)
5. Deploy site and open `/tracker/`.

Notes:
- Data access is protected server-side by RLS (`auth.uid() = user_id`).
- Never put Supabase service role keys in frontend files.
