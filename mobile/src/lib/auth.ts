import type { AuthError } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Mobile number / email + password sign-in, sign-up and password reset (Google is in googleAuth.ts).
// Setup needed in Supabase is described in ../../../backend/README.md ("Login setup").

type Failure = { ok: false; message: string; unverified?: boolean };
export type AuthResult = { ok: true } | Failure;
export type Identifier = { kind: 'phone'; phone: string } | { kind: 'email'; email: string };

export const MIN_PASSWORD = 8;

/** Accepts an Indian mobile number (10 digits, optional +91 / 91 / 0 prefix) or an email address. */
export function parseIdentifier(input: string): Identifier | null {
  const v = input.trim();
  if (v.includes('@')) {
    const email = v.toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? { kind: 'email', email } : null;
  }
  let d = v.replace(/[\s\-()]/g, '');
  if (d.startsWith('+91')) d = d.slice(3);
  else if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? { kind: 'phone', phone: '+91' + d } : null;
}

export function codeSentMessage(id: Identifier): string {
  return id.kind === 'phone'
    ? `We sent a code by SMS to ${id.phone}.`
    : `We sent a code to ${id.email}. Check your inbox and spam folder.`;
}

const ALREADY = 'An account with this mobile number or email already exists. Sign in instead.';

function fail(error: AuthError): Failure {
  const code = error.code ?? '';
  const msg = error.message.toLowerCase();
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials'))
    return { ok: false, message: 'Wrong mobile number/email or password.' };
  if (code === 'email_not_confirmed' || code === 'phone_not_confirmed' || msg.includes('not confirmed'))
    return { ok: false, message: 'Please verify your account first.', unverified: true };
  if (code === 'user_already_exists' || msg.includes('already registered')) return { ok: false, message: ALREADY };
  if (code === 'otp_expired' || msg.includes('token has expired or is invalid'))
    return { ok: false, message: 'That code is wrong or has expired. Request a new one.' };
  if (code === 'same_password') return { ok: false, message: 'Choose a password different from your old one.' };
  if (code === 'weak_password') return { ok: false, message: 'That password is too weak. Use a longer one.' };
  if (code === 'phone_provider_disabled') return { ok: false, message: 'Mobile number sign-up is not available yet. Use email or Google.' };
  if (code.startsWith('over_')) return { ok: false, message: 'Too many attempts. Please wait a minute and try again.' };
  return { ok: false, message: error.message };
}

export async function signIn(id: Identifier, password: string): Promise<AuthResult> {
  const { error } = id.kind === 'phone'
    ? await supabase.auth.signInWithPassword({ phone: id.phone, password })
    : await supabase.auth.signInWithPassword({ email: id.email, password });
  return error ? fail(error) : { ok: true };
}

export type SignUpResult = { ok: true; needsCode: boolean } | Failure;

/** Creates the account. If Supabase requires confirmation, a code is sent by SMS or email (needsCode). */
export async function signUp(id: Identifier, password: string, fullName: string): Promise<SignUpResult> {
  const options = { data: { full_name: fullName.trim() } };
  const { data, error } = id.kind === 'phone'
    ? await supabase.auth.signUp({ phone: id.phone, password, options })
    : await supabase.auth.signUp({ email: id.email, password, options });
  if (error) return fail(error);
  // With confirmation on, Supabase hides "already registered" and returns a user without identities.
  if (data.user && data.user.identities?.length === 0) return { ok: false, message: ALREADY };
  return { ok: true, needsCode: !data.session };
}

/** Confirms a new account with the code from SMS or email. Success starts the session. */
export async function verifySignUpCode(id: Identifier, token: string): Promise<AuthResult> {
  const { error } = id.kind === 'phone'
    ? await supabase.auth.verifyOtp({ phone: id.phone, token, type: 'sms' })
    : await supabase.auth.verifyOtp({ email: id.email, token, type: 'email' });
  return error ? fail(error) : { ok: true };
}

export async function resendSignUpCode(id: Identifier): Promise<AuthResult> {
  const { error } = id.kind === 'phone'
    ? await supabase.auth.resend({ type: 'sms', phone: id.phone })
    : await supabase.auth.resend({ type: 'signup', email: id.email });
  return error ? fail(error) : { ok: true };
}

/** Forgot password, step 1: send a code to an existing account (never creates a new one). */
export async function sendResetCode(id: Identifier): Promise<AuthResult> {
  const { error } = id.kind === 'phone'
    ? await supabase.auth.signInWithOtp({ phone: id.phone, options: { shouldCreateUser: false } })
    : await supabase.auth.resetPasswordForEmail(id.email);
  return error ? fail(error) : { ok: true };
}

/** Forgot password, step 2: check the code, then save the new password. Leaves the user signed in. */
export async function resetPassword(id: Identifier, token: string, newPassword: string): Promise<AuthResult> {
  const { error } = id.kind === 'phone'
    ? await supabase.auth.verifyOtp({ phone: id.phone, token, type: 'sms' })
    : await supabase.auth.verifyOtp({ email: id.email, token, type: 'recovery' });
  if (error) return fail(error);
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  return updateError ? fail(updateError) : { ok: true };
}
