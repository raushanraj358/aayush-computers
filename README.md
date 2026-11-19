# Aayush Computers

Web and mobile app for Aayush Computers: sales enquiries, repair requests, orders and status tracking.

Owner: Nitish Kamlapuri, 90064 34998

## Folders

| Folder | What is in it | Status |
|---|---|---|
| `index.html` | The website (single file). Login is real (Supabase); requests, orders, products and alerts are still demo data | Login live |
| `web/` | Old address, forwards to the website | |
| `mobile/` | Android app for customers and the owner (React Native with Expo) | Not started |
| `backend/` | Supabase database and security rules (`supabase/schema.sql`) | Schema written, not yet deployed |
| `docs/` | Project notes: requirements, roles, statuses, categories, pricing | Done |

## Try the website

Live at https://raushanraj358.github.io/aayush-computers/. Sign in with your mobile number or email and a password, create an account, or use "Continue with Google". Opening `index.html` straight from your computer also works for email and password login, but Google login only works on the live site.

## Host the prototype for free (GitHub Pages)

1. Upload the contents of this folder to a public GitHub repository.
2. Repository Settings > Pages > Source: Deploy from a branch > Branch `main`, folder `/ (root)` > Save.
3. After a minute or two the site is live at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

GitHub Pages hosts only the web prototype. The Android app is published through Google Play and the backend runs on Supabase.

## Next steps

1. Replace demo data with a real backend (see `backend/README.md`).
2. Build the mobile app (see `mobile/README.md`).
3. Create all accounts (GitHub, hosting, database, SMS, Google Play, Apple) under Aayush Computers' own email so the owner holds full control.
