# Backend (Supabase)

Managed database, login, file storage and automatic backups, so no server to maintain.

## Setup (about 30 minutes)

1. Create a free account at supabase.com using the shop's own email. Create a project (choose the region closest to India).
2. Open SQL Editor, paste all of `supabase/schema.sql`, and click Run. Then do the same with `supabase/002_app_access.sql`, which lets signed-in users reach the tables. Without it the app can't load anything, and the owner shows up as a customer. Then run `supabase/003_product_photos.sql`, which creates the storage for product photos (anyone can view them, only the owner can upload).
3. Set up login (next section).
4. Sign in to the app once as Nitish, then make that account the owner by running this in SQL Editor (use his real email):

       update public.profiles
       set role = 'owner', phone = '+919006434998'
       where email = 'nitish@example.com';

5. Never commit keys. Keep them in `.env` (already ignored by git). The app only ever uses the project URL and the public anon key.

## Login setup

The app offers three ways in: mobile number + password, email (Gmail) + password, and "Continue with Google". New users create an account with "Create account" (or Google, which signs up automatically). Codes are sent only to confirm a new account and to reset a forgotten password, not at every sign-in.

In Supabase > Authentication:

1. **Providers > Email**: on. Keep "Confirm email" on.
2. **Providers > Phone**: on, with "Enable phone confirmations" on. Pick an SMS provider and paste its keys. For India, register your sender ID and message templates (DLT) with that provider first.
3. **Providers > Google**: see `../docs/GOOGLE_LOGIN_SETUP.md`.
4. **Password**: set the minimum password length to 8 (the app also checks this).
5. **Email templates**: the app asks the user to type a code, so add the code to two templates:
   - "Confirm signup": `Your Aayush Computers code is {{ .Token }}`
   - "Reset password": `Your Aayush Computers password reset code is {{ .Token }}`
6. **SMTP settings**: add your own email sender (for example Brevo, Resend or Gmail SMTP). Supabase's built-in sender only delivers a few emails an hour, and only to your team's addresses, so customers would not get their codes.

## What the database does by itself

- New request: saved on the customer's profile, owner gets an in-app notification, customer gets a confirmation.
- Status change (owner only): the new status is saved to history and the customer is notified with the owner's note, for example a diagnosis or quote.
- Status values are checked, so a repair can only use Received, Diagnosed, In repair, Ready for pickup, Delivered.
- Customers can only see their own requests. Only the owner can change statuses and products.

## Still to build

- Edge Function that sends the SMS (and phone push notification) for each new row in `notifications`, then marks it sent or failed.
