# Android app (planned)

React Native with Expo, built for Android and published on Google Play. Talks to Supabase (see `../backend`).

Screens (match `../web/index.html`):
- Customer: Home, Shop, Requests, New request, Alerts, Profile
- Owner: Requests, Products, Alerts, Profile

Create the app here later with:

    npx create-expo-app@latest .

## Google login
Code is in `src/lib/googleAuth.ts`, `src/lib/supabase.ts`, `src/hooks/useSession.ts` and `src/screens/LoginScreen.tsx`. Setup steps are in `../docs/GOOGLE_LOGIN_SETUP.md`.
