# Backend (Supabase)

Managed database, login, file storage and automatic backups, so no server to maintain.

## Setup (about 30 minutes)

1. Create a free account at supabase.com using the shop's own email. Create a project (choose the region closest to India).
2. Open SQL Editor, paste all of `supabase/schema.sql`, and click Run.
3. Authentication > Providers:
   - Google: create an OAuth client in Google Cloud Console (under the shop's Google account) and paste its client ID and secret.
   - Phone: pick an SMS provider and paste its keys. For India, register your sender ID and message templates (DLT) with that provider first.
4. Sign in to the app once as Nitish, then make that account the owner by running this in SQL Editor (use his real email):

       update public.profiles
       set role = 'owner', phone = '+919006434998'
       where email = 'nitish@example.com';

5. Never commit keys. Keep them in `.env` (already ignored by git). The app only ever uses the project URL and the public anon key.

## What the database does by itself

- New request: saved on the customer's profile, owner gets an in-app notification, customer gets a confirmation.
- Status change (owner only): the new status is saved to history and the customer is notified with the owner's note, for example a diagnosis or quote.
- Status values are checked, so a repair can only use Received, Diagnosed, In repair, Ready for pickup, Delivered.
- Customers can only see their own requests. Only the owner can change statuses and products.

## Still to build

- Edge Function that sends the SMS (and phone push notification) for each new row in `notifications`, then marks it sent or failed.
