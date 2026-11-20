# Aayush Computers

Website and Android app for Aayush Computers, a computer sales and service shop. Customers browse products, place orders, book repairs, send enquiries and track every request step by step. The owner manages requests and products from the same website.

- Owner: Nitish Kamlapuri, 90064 34998
- Live website: https://raushanraj358.github.io/aayush-computers/

## Current status (November 2026)

| Part | Status |
|---|---|
| Website: login, shop, orders, repairs, enquiries | Live, connected to Supabase |
| Order tracking and in-app notifications | Live |
| Owner tools: requests, status notes, products with photos | Live |
| Google sign-in | Live |
| Email sign-up and password reset (by emailed link) | Live |
| Mobile number sign-up and reset (by SMS code) | Built, but needs an SMS provider in Supabase |
| Notifications outside the website (push, WhatsApp or email) | Not started, no option chosen yet |
| Android app (`android-app/`) | APK built: a Capacitor app that opens the live website, so it always matches it |

## Folders

| Path | What is in it |
|---|---|
| `index.html` | The whole website in one file (HTML, CSS and JavaScript, no build step). Talks to Supabase |
| `logo.png` | Logo shown in the header |
| `privacy.html`, `terms.html` | Privacy Policy and Terms of Service (Google sign-in requires them) |
| `googledc2282506e76168c.html` | Google site verification file. Do not edit or delete |
| `web/` | Old address, forwards to the website |
| `backend/` | Supabase database, security rules and photo storage (`backend/supabase/*.sql`) and setup guide |
| `android-app/` | Android app (Capacitor shell around the live website), its build script and setup (`android-app/README.md`) |
| `mobile/` | Earlier React Native (Expo) login code, kept for reference; replaced by `android-app/` |
| `docs/` | Project notes and the Google login setup guide |
| `CLAUDE.md` | Notes for Claude Code (AI assistant) on how the code is organised and how to work on it |

## What the website does

### Sign in
- Mobile number or email, plus a password. "Create account" signs up new users.
- "Continue with Google" signs in or signs up with a Gmail account.
- **Email accounts** are confirmed by a link. After signing up, the site shows a "Check your email" screen. Tapping the link in the email signs the user in. The screen also has "I have confirmed, sign in" and "Resend email" buttons.
- **Mobile number accounts** are confirmed with an SMS code. This needs an SMS provider in Supabase.
- **Forgot password** sends a reset link to email accounts and a code to mobile numbers.

### Customers
- **Home:** a greeting with the customer's name, product search, and quick links: My requests, Book a repair, Shop and Notifications. A "Track your request" card shows their latest request that is still in progress. Below that come the shop categories and a "Need assistance?" box with Call and Enquiry buttons.
- **Shop:** browse by category, search, and see product photos and prices.
- **Requests:** place an order, book a repair, or send an enquiry. The Requests tab lists every request as a card with its current status, date and a progress bar.
- **Tracking:** tapping a request opens its details page, with a step-by-step tracker like a shopping app's:
  - steps differ by request type, for example Placed → Confirmed → Packed → Out for delivery → Delivered;
  - finished steps show a green tick and their date;
  - notes from the shop show under the step they belong to;
  - steps still to come are marked "Pending".
- **Notifications:**
  - A banner slides in at the top when an update arrives. Tapping it opens the request.
  - The bell shows the number of unread notifications.
  - The Notifications page groups updates into Today / Yesterday / Earlier, and has filters for Orders, Repairs and Enquiries.
  - All updates for one request appear as a single entry.

### Owner (Nitish)
- **Home:** a dashboard in the same style as the customer home. It has:
  - a greeting with today's date, and a search box for requests (by customer name, item or Ref #);
  - Overview tiles: New, Open, Repairs in progress and Completed. Tapping a tile opens that list;
  - quick actions: Requests, Add product, Products and Notifications;
  - "Needs your attention", showing new requests waiting for him;
  - recent activity;
  - a "Your shop" summary of how many products are listed.
- **Requests:**
  - The Open, Repairs and New boxes filter the list, and the Completed link shows finished requests.
  - Each card has a quick "Mark as: next status" button.
  - Tapping a card opens the tracker, which shows the customer's name and a tap-to-call number.
  - On the tracker he can add a **note for the customer** with the status change (for example the fault found, the repair cost or the delivery time). The customer sees it in the notification and under that step in their tracker.
- **Products:** add products, edit name, price, category and brand, add or replace a photo, and list or de-list items.
- **Notifications:** one for every new request, shown in the same way.

### Everywhere
- Buttons turn blue while pressed.
- Every page ends with "© 2026 Aayush Computers. All Rights Reserved."
- The site follows the phone's light or dark mode.
- The site reloads itself when a new version is published.

## Setting up from scratch

1. **Supabase:** follow `backend/README.md`. Run `schema.sql`, then `002_app_access.sql`, then `003_product_photos.sql`. Set up login, then make Nitish's account the owner.
2. **Google login:** follow `docs/GOOGLE_LOGIN_SETUP.md`.
3. **Website:** in the repository's Settings, open Pages, set Source to "Deploy from a branch", choose branch `main` and folder `/ (root)`, and save. The site goes live at `https://USERNAME.github.io/aayush-computers/`.
4. **Supabase URL settings:** in Authentication, open URL Configuration. Set Site URL to the live website and add it under Redirect URLs, so links in emails open the website.
5. **Email templates:** keep Supabase's default "Confirm signup" and "Reset password" templates, which send a link. If you reword them, keep `{{ .ConfirmationURL }}`.

The publishable Supabase key in `index.html` is meant to be public; row level security protects the data. Never put the secret key in this repository.

## Updating the website

Edit `index.html`, then commit and push to `main`. GitHub Pages republishes within a minute or two.

The site updates itself. When a page is opened or brought back to the screen, and every 5 minutes while it's open, it checks whether a newer version has been published. If one has, it reloads. If the user is in the middle of typing, it shows an "Update now" bar instead, so nothing they typed is lost. To force it straight away, add `?v=` and any new number to the address, for example `.../aayush-computers/?v=14`.

## Next steps

- **Notifications outside the website:** choose web push (phone notifications even when the site is closed), a WhatsApp button, or email.
- **Mobile number sign-up:** add an SMS provider in Supabase, registered for India (DLT).
- **Android app on Google Play:** create a release signing key and a Play Console account (the current APK is debug-signed, for installing directly).
