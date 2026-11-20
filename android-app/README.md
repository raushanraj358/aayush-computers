# Aayush Computers: Android app

The Android app is a native shell, built with [Capacitor](https://capacitorjs.com) 7, that opens the live website https://raushanraj358.github.io/aayush-computers/. Every screen and feature is the website's. When the website changes, the app shows the change straight away, with no new APK needed.

What the shell adds:
- **App name, icon and splash screen.** It appears as "Aayush Computers" on the phone, with the AC logo.
- **Navy status bar** to match the site's header.
- **Google sign-in through Chrome.** Google blocks sign-in inside apps, so `index.html` opens Chrome when it runs in the app. After sign-in, Chrome hands back to the app through `com.aayushcomputers.app://login`.
- **Phone Back button.** It goes back a screen, then to Home, then closes the app.
- **Offline page** (`www/offline.html`) with a "Try again" button.
- Phone call links open the dialler, and product photos can be picked from the phone, as on the website.

The app-only code in `index.html` sits behind `NATIVE`, which is false in a normal browser.

## One-time Supabase setting (needed for Google sign-in in the app)

In Supabase, go to Authentication, then URL Configuration, then **Redirect URLs**. Add:

    com.aayushcomputers.app://login

Without it, Google sign-in in the app ends on the website in Chrome instead of returning to the app. Email and mobile number sign-in work without it.

## Build the APK

The tools are installed in `~/devtools` on this Mac: Node 22, Java 21 (Temurin) and the Android SDK (platform 35). To build, run:

    ./build-apk.sh

The APK is saved to `~/Desktop/AayushComputers.apk`. It is signed with the Mac's debug key, which is fine for installing on phones directly. Later APKs must be built on this same Mac (same key), or the phone will refuse them as an update. Google Play would need a release key instead.

You only need to rebuild when the app shell changes: the icon, name, colours, Capacitor version or the files in this folder. Website changes don't need a rebuild.

## Install on an Android phone

1. Send `AayushComputers.apk` to the phone, for example by WhatsApp to yourself, Google Drive or a USB cable.
2. Open it on the phone. If asked, allow "Install unknown apps" for the app you opened it from (Chrome, Files, WhatsApp and so on).
3. Tap Install, then Open.

## Files

| Path | What it is |
|---|---|
| `capacitor.config.json` | App ID `com.aayushcomputers.app`, name, and the live website address |
| `www/` | Offline page shown when the site can't load (plus a copy as `index.html`, which Capacitor requires) |
| `android/` | The native Android project. Edited by hand: `AndroidManifest.xml` (sign-in link), `res/values/styles.xml` (colours, splash), and the `res/mipmap-*` icons and `res/drawable/splash*` made from `../logo.png` |
| `build-apk.sh` | One-command build |
