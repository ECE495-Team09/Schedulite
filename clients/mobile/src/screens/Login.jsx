import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle } from '../api/client';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function Login() {
  const { user, setAuth } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      if (signInResult?.type !== 'success' || !signInResult?.data?.idToken) return; // user cancelled
      const idToken = signInResult.data.idToken;
      const res = await loginWithGoogle(idToken);
      await setAuth(res.token, res.user);
    } catch (err) {
      console.error('Login failed:', err);
      Alert.alert('Login failed', err.message || 'Google sign-in was cancelled or failed');
    }
  };

  return (
    <View style={styles.page}>
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
    backgroundColor: '#0f0f12',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 352,
    padding: 32,
    backgroundColor: '#18181c',
    borderWidth: 1,
    borderColor: '#2a2a30',
    borderRadius: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#f4f4f5',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    color: '#a1a1aa',
    fontSize: 15,
    marginBottom: 28,
  },
  googleButton: {
    backgroundColor: '#18181c',
    borderWidth: 1,
    borderColor: '#2a2a30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 280,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#f4f4f5',
    fontSize: 16,
  },
});
