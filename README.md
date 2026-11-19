# Aayush Computer

Web and mobile app for Aayush Computer: sales enquiries, repair requests, orders and status tracking.

Owner: Nitish Kamlapuri, 90064 34998

## Folders

| Folder | What is in it | Status |
|---|---|---|
| `web/` | Clickable prototype (single `index.html`, demo data only) | Done |
| `mobile/` | Android app for customers and the owner (React Native with Expo) | Not started |
| `backend/` | Supabase database and security rules (`supabase/schema.sql`) | Schema written, not yet deployed |
| `docs/` | Project notes: requirements, roles, statuses, categories, pricing | Done |

## Try the prototype

Open `web/index.html` in a browser. Demo login (mobile number or email + password): customer `98100 22222` / `demo1234`, owner `90064 34998` / `owner1234`. You can also create an account (demo code `1234`), reset a password, or use "Continue with Google" (simulated).

## Host the prototype for free (GitHub Pages)

1. Upload the contents of this folder to a public GitHub repository.
2. Repository Settings > Pages > Source: Deploy from a branch > Branch `main`, folder `/ (root)` > Save.
3. After a minute or two the site is live at `https://YOUR-USERNAME.github.io/REPO-NAME/`. The root `index.html` forwards to `web/index.html`.

GitHub Pages hosts only the web prototype. The Android app is published through Google Play and the backend runs on Supabase.

## Next steps

1. Replace demo data with a real backend (see `backend/README.md`).
2. Build the mobile app (see `mobile/README.md`).
3. Create all accounts (GitHub, hosting, database, SMS, Google Play, Apple) under Aayush Computer's own email so the owner holds full control.
