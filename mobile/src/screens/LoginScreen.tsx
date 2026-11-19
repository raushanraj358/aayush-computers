import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { signInWithGoogle } from '../lib/googleAuth';

export default function LoginScreen() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onGoogle() {
    setBusy(true);
    setError('');
    const result = await signInWithGoogle();
    if (!result.ok) setError(result.message);
    setBusy(false);
    // On success, useSession() updates and the app shows the signed-in screens.
  }

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <Text style={s.brand}>AYUSH COMPUTER</Text>
        <Text style={s.tag}>Your Trusted Technology Partner</Text>
        <Text style={s.title}>Sign in</Text>
        <Text style={s.sub}>Track your orders and repairs, or send an enquiry.</Text>
      </View>

      <View style={s.body}>
        <Pressable style={[s.google, busy && { opacity: 0.6 }]} onPress={onGoogle} disabled={busy} accessibilityRole="button">
          {busy ? <ActivityIndicator /> : <Text style={s.googleText}>Continue with Google</Text>}
        </Pressable>
        {!!error && <Text style={s.error}>{error}</Text>}
        {/* The mobile number and SMS code option is added here later. */}
      </View>
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
  google: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 14, alignItems: 'center' },
  googleText: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  error: { color: '#b91c1c', marginTop: 12 },
});
