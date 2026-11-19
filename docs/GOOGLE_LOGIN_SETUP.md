# Google (Gmail) login setup

Flow: the app asks Google for an ID token, then Supabase checks it and starts the session. Do these steps once, using the shop's own Google account.

## 1. Google Cloud (console.cloud.google.com)

1. Create a project named "Aayush Computer".
2. Google Auth Platform (OAuth consent screen): app name "Aayush Computer", support email, audience "External". Scopes needed: email, profile, openid. Click **Publish app** so any Gmail user can sign in (otherwise only listed test users can). These basic scopes normally need no Google review.
3. Credentials > Create credentials > OAuth client ID:
   - **Web application** (name: Aayush Web)
     - Authorized redirect URI: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
     - Authorized JavaScript origin (for the website): `https://raushanraj358.github.io`
     - Copy the **Client ID** and **Client secret**.
   - **Android** (name: Aayush Android), one per signing key:
     - Package name: `com.aayushcomputer.app` (must match the app)
     - SHA-1 of the key that signs the build:
       - Development build: run `eas credentials` (Android) and copy the SHA-1.
       - Play Store release: Google Play Console > App integrity > App signing key certificate (menu names may differ slightly). Add a second Android client for the upload key too.

## 2. Supabase (Authentication > Providers > Google)

1. Turn Google **on**.
2. Paste the Web client ID and Web client secret.
3. In "Authorized Client IDs" (for native sign-in), add the Web client ID and the Android client ID(s), separated by commas.
4. Authentication > URL Configuration: Site URL `https://raushanraj358.github.io/ayush-computers/`.

## 3. App setup

    cd mobile
    npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
    npx expo install @react-native-google-signin/google-signin expo-dev-client

In `app.json` add the plugin and the package name:

    {
      "expo": {
        "android": { "package": "com.aayushcomputer.app" },
        "plugins": ["@react-native-google-signin/google-signin"]
      }
    }

Copy `.env.example` to `.env` and fill in the three values. Google sign-in does not work in Expo Go, so test with a development build:

    eas build --profile development --platform android

## 4. Make Nitish the owner

Sign in once with his Gmail, then run in Supabase SQL Editor:

    update public.profiles set role = 'owner', phone = '+919006434998' where email = 'HIS-GMAIL@gmail.com';

## Website version (later)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://raushanraj358.github.io/ayush-computers/' },
    });

## Troubleshooting

- "Developer error" or error 10: the Android client's package name or SHA-1 doesn't match the key that signed the build.
- "No ID token" or an audience error in Supabase: the app's webClientId must be the Web client ID, and it must be listed in Supabase's Authorized Client IDs.
- Only some users can sign in: the Google consent screen is still in Testing. Publish it.
- A nonce error from Supabase: open the Google provider settings and check Supabase's current option for skipping nonce checks on native sign-in.
