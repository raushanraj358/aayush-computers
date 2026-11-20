#!/bin/sh
# Builds the Android app (debug-signed APK) on this Mac and copies it to the Desktop.
# Tools live in ~/devtools (Node 22, Java 21, Android SDK); see android-app/README.md.
set -e
export JAVA_HOME="$HOME/devtools/jdk/Contents/Home" ANDROID_HOME="$HOME/devtools/android-sdk"
export PATH="$HOME/devtools/node/bin:$JAVA_HOME/bin:$PATH"
cd "$(dirname "$0")"
[ -d node_modules ] || npm install --no-audit --no-fund
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
npx cap sync android
(cd android && ./gradlew assembleDebug --no-daemon -q)
cp android/app/build/outputs/apk/debug/app-debug.apk "$HOME/Desktop/AayushComputers.apk"
echo "APK ready: $HOME/Desktop/AayushComputers.apk"
