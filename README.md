# Aayush Computers

Website and Android app for Aayush Computers. Customers browse products, place orders, book repairs, send enquiries and track every request. The owner manages requests and products from the same website.

Owner: Nitish Kamlapuri, 90064 34998
Live website: https://raushanraj358.github.io/aayush-computers/

## Folders

| Path | What is in it | Status |
|---|---|---|
| `index.html` | The whole website in one file (HTML, CSS and JavaScript, no build step). Talks to Supabase | Live |
| `logo.png` | Logo shown in the header | |
| `privacy.html`, `terms.html` | Privacy Policy and Terms of Service (Google sign-in requires them) | Live |
| `googledc2282506e76168c.html` | Google site verification file. Do not edit or delete | |
| `web/` | Old address, forwards to the website | |
| `backend/` | Supabase database, security rules and photo storage (`backend/supabase/*.sql`) | Deployed |
| `mobile/` | Android app (React Native with Expo). Login screen and auth code only so far | In progress |
| `docs/` | Project notes and the Google login setup guide | |

## What the website does

**Sign in**
- Mobile number or email, plus a password. "Create account" signs up new users.
- "Continue with Google" signs in or signs up with a Gmail account.
- Email accounts are confirmed by a link in an email. The site shows a "Check your email" screen and signs the user in when they tap the link.
- Mobile number accounts are confirmed with an SMS code. This needs an SMS provider in Supabase, which is not set up yet.
- Forgot password works the same way: a link for email accounts, a code for mobile numbers.

**Customers**
- Browse and search the shop by category.
- Place an order, book a repair, or send an enquiry.
- Track each request: tap it in Requests to see every step (for example Placed, Confirmed, Packed, Out for delivery, Delivered) with its date, like a shopping app's order tracking.
- Get notifications when the shop updates a request: a banner slides in at the top when one arrives, the bell shows how many are unread, and tapping a notification opens that request.

**Owner (Nitish)**
- **Requests:** see all requests and move each one to its next status. On a request's tracking page he can add a note for the customer (for example the fault found or the repair cost). The note appears in the customer's notification and under that step in their tracker. The Open, Repairs and New boxes filter the list, and a Completed link shows finished requests.
- **Products:** add products, edit name, price, category and brand, add or replace a photo, and list or de-list items.
- **Notifications:** one for every new request, shown the same way.

Every page shows "© 2026 Aayush Computers. All Rights Reserved." at the bottom.

## Setting up from scratch

1. **Supabase:** follow `backend/README.md`. Run `schema.sql`, then `002_app_access.sql`, then `003_product_photos.sql`, set up login, and make Nitish's account the owner.
2. **Google login:** follow `docs/GOOGLE_LOGIN_SETUP.md`.
3. **Website:** in the repository's Settings, open Pages, set Source to "Deploy from a branch", choose branch `main` and folder `/ (root)`, and save. The site goes live at `https://USERNAME.github.io/aayush-computers/`.
4. **Supabase URL settings:** in Authentication, open URL Configuration. Set Site URL to the live website, and add the website to Redirect URLs.

The publishable Supabase key in `index.html` is meant to be public; row level security protects the data. Never put the secret key in this repository.

## Updating the website

Edit `index.html`, then commit and push to `main`. GitHub Pages republishes within a minute or two. Browsers can keep the old copy for up to 10 minutes; to skip it, add `?v=` and any number to the address.

## Not done yet

- **Notifications outside the app:** SMS was dropped. The options are web push, a WhatsApp button, or email; none has been chosen yet.
- **Mobile number sign-up:** needs an SMS provider in Supabase.
- **Android app:** needs the Expo project created (`mobile/README.md`), then building an APK with EAS.
