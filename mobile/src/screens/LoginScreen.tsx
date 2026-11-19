import { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View, type TextInputProps,
} from 'react-native';
import { signInWithGoogle } from '../lib/googleAuth';
import {
  MIN_PASSWORD, codeSentMessage, parseIdentifier, resendSignUpCode, resetPassword,
  sendResetCode, signIn, signUp, verifySignUpCode, type Identifier,
} from '../lib/auth';

type Mode = 'signin' | 'signup' | 'verify' | 'forgot' | 'reset';

const TEXT: Record<Mode, { title: string; sub: string; button: string }> = {
  signin: { title: 'Sign in', sub: 'Track your orders and repairs, or send an enquiry.', button: 'Sign in' },
  signup: { title: 'Create account', sub: 'Sign up with your mobile number or email.', button: 'Create account' },
  verify: { title: 'Verify your account', sub: 'Enter the code we sent you.', button: 'Verify and continue' },
  forgot: { title: 'Forgot password', sub: 'We will send a code to your mobile number or email.', button: 'Send code' },
  reset: { title: 'Set a new password', sub: 'Enter the code we sent you and choose a new password.', button: 'Save password and sign in' },
};

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [login, setLogin] = useState(''); // mobile number or email
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [target, setTarget] = useState<Identifier | null>(null); // where the code was sent
  const [busy, setBusy] = useState<'' | 'form' | 'google'>('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  function go(next: Mode, message = '') {
    setMode(next); setError(''); setInfo(message);
    setPassword(''); setConfirm(''); setCode('');
  }

  async function run(kind: 'form' | 'google', task: () => Promise<void>) {
    setBusy(kind); setError(''); setInfo('');
    try { await task(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.'); }
    finally { setBusy(''); }
    // On success Supabase starts a session, useSession() updates and the app shows the signed-in screens.
  }

  function readLogin(): Identifier | null {
    const id = parseIdentifier(login);
    if (!id) setError('Enter a 10-digit mobile number or a valid email address.');
    return id;
  }

  function newPasswordOk(): boolean {
    if (password.length < MIN_PASSWORD) { setError(`Password must be at least ${MIN_PASSWORD} characters.`); return false; }
    if (password !== confirm) { setError('Passwords do not match.'); return false; }
    return true;
  }

  const actions: Record<Mode, () => Promise<void>> = {
    signin: async () => {
      const id = readLogin();
      if (!id) return;
      if (!password) return setError('Enter your password.');
      const r = await signIn(id, password);
      if (r.ok) return;
      if (r.unverified) {
        const sent = await resendSignUpCode(id);
        setTarget(id);
        go('verify', sent.ok ? codeSentMessage(id) : 'Your account is not verified yet. Request a new code.');
      } else setError(r.message);
    },
    signup: async () => {
      if (!name.trim()) return setError('Enter your name.');
      const id = readLogin();
      if (!id || !newPasswordOk()) return;
      const r = await signUp(id, password, name);
      if (!r.ok) return setError(r.message);
      if (r.needsCode) { setTarget(id); go('verify', codeSentMessage(id)); }
    },
    verify: async () => {
      if (!target) return go('signin');
      if (!code.trim()) return setError('Enter the code.');
      const r = await verifySignUpCode(target, code.trim());
      if (!r.ok) setError(r.message);
    },
    forgot: async () => {
      const id = readLogin();
      if (!id) return;
      const r = await sendResetCode(id);
      if (!r.ok) return setError(r.message);
      setTarget(id);
      go('reset', codeSentMessage(id));
    },
    reset: async () => {
      if (!target) return go('forgot');
      if (!code.trim()) return setError('Enter the code.');
      if (!newPasswordOk()) return;
      const r = await resetPassword(target, code.trim(), password);
      if (!r.ok) setError(r.message);
    },
  };

  const onResend = () => run('form', async () => {
    if (!target) return;
    const r = await resendSignUpCode(target);
    if (r.ok) setInfo('New code sent. ' + codeSentMessage(target));
    else setError(r.message);
  });

  const onGoogle = () => run('google', async () => {
    const r = await signInWithGoogle();
    if (!r.ok) setError(r.message);
  });

  const t = TEXT[mode];
  const isEntry = mode === 'signin' || mode === 'signup';
  const needsPassword = mode === 'signin' || mode === 'signup' || mode === 'reset';
  const isNewPassword = mode === 'signup' || mode === 'reset';

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View style={s.header}>
          <Text style={s.brand}>AAYUSH COMPUTERS</Text>
          <Text style={s.tag}>Your Trusted Technology Partner</Text>
          <Text style={s.title}>{t.title}</Text>
          <Text style={s.sub}>{t.sub}</Text>
        </View>

        <View style={s.body}>
          {isEntry && (
            <View style={s.seg} accessibilityRole="tablist">
              {(['signin', 'signup'] as const).map((m) => (
                <Pressable key={m} style={[s.segBtn, mode === m && s.segOn]} onPress={() => go(m)}
                  accessibilityRole="tab" accessibilityState={{ selected: mode === m }}>
                  <Text style={[s.segText, mode === m && s.segTextOn]}>{m === 'signin' ? 'Sign in' : 'Create account'}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {mode === 'signup' && (
            <Field label="Full name" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
          )}

          {(isEntry || mode === 'forgot') && (
            <Field label="Mobile number or email" value={login} onChangeText={setLogin}
              placeholder="98765 43210 or name@gmail.com" keyboardType="email-address"
              autoCapitalize="none" autoCorrect={false} autoComplete="username" textContentType="username" />
          )}

          {(mode === 'verify' || mode === 'reset') && (
            <Field label="Code" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={10}
              autoComplete="sms-otp" textContentType="oneTimeCode" />
          )}

          {needsPassword && (
            <View>
              <Text style={s.label}>{isNewPassword ? 'New password' : 'Password'}</Text>
              <View style={s.pwRow}>
                <TextInput style={[s.input, { flex: 1, borderWidth: 0 }]} value={password} onChangeText={setPassword}
                  secureTextEntry={!showPw} autoCapitalize="none" autoCorrect={false}
                  autoComplete={isNewPassword ? 'new-password' : 'password'}
                  textContentType={isNewPassword ? 'newPassword' : 'password'}
                  placeholder={isNewPassword ? `At least ${MIN_PASSWORD} characters` : undefined}
                  accessibilityLabel={isNewPassword ? 'New password' : 'Password'} />
                <Pressable onPress={() => setShowPw(!showPw)} style={s.show} accessibilityRole="button">
                  <Text style={s.link}>{showPw ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {isNewPassword && (
            <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry={!showPw}
              autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword" />
          )}

          {mode === 'signin' && (
            <Pressable onPress={() => go('forgot')} style={s.right} accessibilityRole="button">
              <Text style={s.link}>Forgot password?</Text>
            </Pressable>
          )}

          {!!info && <Text style={s.info}>{info}</Text>}
          {!!error && <Text style={s.error} accessibilityLiveRegion="polite">{error}</Text>}

          <Pressable style={[s.primary, !!busy && s.dim]} onPress={() => run('form', actions[mode])}
            disabled={!!busy} accessibilityRole="button">
            {busy === 'form' ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>{t.button}</Text>}
          </Pressable>

          {mode === 'verify' && (
            <Pressable onPress={onResend} disabled={!!busy} style={s.center} accessibilityRole="button">
              <Text style={s.link}>Resend code</Text>
            </Pressable>
          )}
          {!isEntry && (
            <Pressable onPress={() => go('signin')} disabled={!!busy} style={s.center} accessibilityRole="button">
              <Text style={s.link}>Back to sign in</Text>
            </Pressable>
          )}

          {isEntry && (
            <>
              <Text style={s.or}>or</Text>
              <Pressable style={[s.google, !!busy && s.dim]} onPress={onGoogle} disabled={!!busy} accessibilityRole="button">
                {busy === 'google' ? <ActivityIndicator /> : (
                  <Text style={s.googleText}><Text style={s.g}>G</Text>  {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</Text>
                )}
              </Pressable>
              <Text style={s.note}>Use your Gmail account. New users get an account automatically.</Text>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <TextInput style={[s.input, style]} accessibilityLabel={label} placeholderTextColor="#94a3b8" {...props} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fafafa' },
  header: { backgroundColor: '#143560', padding: 20, paddingTop: 60, paddingBottom: 28 },
  brand: { color: '#fff', fontSize: 22, fontWeight: '800' },
  tag: { color: '#fff', opacity: 0.9, marginBottom: 18 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700' },
  sub: { color: '#fff', opacity: 0.9, marginTop: 4 },
  body: { padding: 20 },
  seg: { flexDirection: 'row', backgroundColor: '#eef3ff', borderRadius: 12, padding: 4, marginBottom: 4 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  segOn: { backgroundColor: '#2563eb' },
  segText: { fontWeight: '600', color: '#5b6678' },
  segTextOn: { color: '#fff' },
  label: { fontWeight: '600', marginTop: 14, marginBottom: 4, color: '#0f172a' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 16, color: '#0f172a' },
  pwRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10 },
  show: { paddingHorizontal: 14, paddingVertical: 12 },
  right: { alignSelf: 'flex-end', paddingVertical: 10 },
  center: { alignSelf: 'center', paddingVertical: 12 },
  link: { color: '#2563eb', fontWeight: '600' },
  primary: { backgroundColor: '#2563eb', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dim: { opacity: 0.6 },
  or: { textAlign: 'center', color: '#5b6678', marginVertical: 14 },
  google: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 14, alignItems: 'center' },
  googleText: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  g: { color: '#4285f4', fontWeight: '800' },
  note: { textAlign: 'center', color: '#5b6678', fontSize: 13, marginTop: 8 },
  info: { color: '#15803d', marginTop: 12 },
  error: { color: '#b91c1c', marginTop: 12 },
});
