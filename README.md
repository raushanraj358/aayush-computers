# Ayush Computer

Web and mobile app for Ayush Computer: sales enquiries, repair requests, orders and status tracking.

Owner: Nitish Kamlapuri, 90064 34998

## Folders

| Folder | What is in it | Status |
|---|---|---|
| `web/` | Clickable prototype (single `index.html`, demo data only) | Done |
| `mobile/` | Android app for customers and the owner (React Native with Expo) | Not started |
| `backend/` | Supabase database and security rules (`supabase/schema.sql`) | Schema written, not yet deployed |
| `docs/` | Project notes: requirements, roles, statuses, categories, pricing | Done |

## Try the prototype

Open `web/index.html` in a browser. Demo login: any mobile number with code `1234`, or "Continue with Google" (simulated). Choose Customer or Owner on the sign-in screen.

## Host the prototype for free

- GitHub Pages: push this repo, then Settings > Pages and deploy from the `web` folder (or move `index.html` to the repo root).
- Or drag the `web` folder into Netlify Drop.

## Next steps

1. Replace demo data with a real backend (see `backend/README.md`).
2. Build the mobile app (see `mobile/README.md`).
3. Create all accounts (GitHub, hosting, database, SMS, Google Play, Apple) under Ayush Computer's own email so the owner holds full control.
