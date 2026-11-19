# Android app (planned)

React Native with Expo, built for Android and published on Google Play. Talks to Supabase (see `../backend`).

Screens (match `../web/index.html`):
- Customer: Home, Shop, Requests, New request, Alerts, Profile
- Owner: Requests, Products, Alerts, Profile

Create the app here later with:

    npx create-expo-app@latest .

## Login
`src/screens/LoginScreen.tsx` offers sign in with mobile number or email + password, create account, forgot password, and "Continue with Google".

- `src/lib/auth.ts`: mobile/email + password sign-in, sign-up with a confirmation code, password reset
- `src/lib/googleAuth.ts`: Google sign-in (also signs up new users)
- `src/lib/supabase.ts`, `src/hooks/useSession.ts`: session and role

Supabase setup: `../backend/README.md` (Login setup). Google setup: `../docs/GOOGLE_LOGIN_SETUP.md`.
