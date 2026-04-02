import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle } from '../api/client';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { theme } from '../theme';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';

export default function Login({ navigation }) {
  const { setAuth } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      if (signInResult?.type !== 'success' || !signInResult?.data?.idToken) return;
      const idToken = signInResult.data.idToken;
      const res = await loginWithGoogle(idToken);
      await setAuth(res.token, res.user);
    } catch (err) {
      console.error('Login failed:', err);
      Alert.alert('Login failed', err.message || 'Google sign-in was cancelled or failed');
    }
  };

  if (!GOOGLE_WEB_CLIENT_ID) {
    return (
      <View style={styles.page}>
        <Pressable onPress={() => navigation.navigate('Landing')} style={styles.backWrap}>
          <Text style={styles.backLink}>← Back</Text>
        </Pressable>
        <View style={styles.card}>
          <Text style={styles.title}>Schedulite</Text>
          <Text style={styles.subtitle}>
            Google sign-in is not configured. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your environment
            (see .env.example) and rebuild.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Pressable onPress={() => navigation.navigate('Landing')} style={styles.backWrap}>
        <Text style={styles.backLink}>← Back</Text>
      </Pressable>
      <View style={styles.card}>
        <Text style={styles.title}>Schedulite</Text>
        <Text style={styles.subtitle}>Sign in to manage your schedule</Text>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backWrap: {
    position: 'absolute',
    top: 56,
    left: 24,
  },
  backLink: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    maxWidth: 352,
    padding: 32,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 15,
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 22,
  },
  googleButton: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 280,
    alignItems: 'center',
  },
  googleButtonText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '500',
  },
});
