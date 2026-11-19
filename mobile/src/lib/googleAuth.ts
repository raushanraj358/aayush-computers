import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';

// Must be the WEB application client ID, not the Android client ID.
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
  scopes: ['email', 'profile'],
});

export type AuthResult = { ok: true } | { ok: false; message: string };

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      return { ok: false, message: 'Sign-in was cancelled.' };
    }
    const idToken = response.data.idToken;
    if (!idToken) {
      return { ok: false, message: 'Google did not return an ID token. Check the web client ID.' };
    }

    // Hand Google's token to Supabase, which creates or finds the user and starts a session.
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  } catch (e) {
    if (isErrorWithCode(e)) {
      if (e.code === statusCodes.IN_PROGRESS) return { ok: false, message: 'Sign-in already in progress.' };
      if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE)
        return { ok: false, message: 'Google Play Services is missing or out of date.' };
    }
    return { ok: false, message: e instanceof Error ? e.message : 'Something went wrong. Please try again.' };
  }
}

export async function signOut() {
  try { await GoogleSignin.signOut(); } catch { /* user may not have used Google */ }
  await supabase.auth.signOut();
}
