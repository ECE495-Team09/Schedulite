import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../theme';

export default function Landing({ navigation }) {
  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.title}>Schedulite</Text>
        <Text style={styles.tagline}>
          Effortless group scheduling. Create groups, plan events, and keep everyone in sync.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={() => navigation.navigate('Login')}
          accessibilityLabel="Get started with Schedulite"
        >
          <Text style={styles.ctaText}>Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  hero: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
    color: theme.text,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  cta: {
    backgroundColor: theme.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: theme.cardRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  ctaPressed: {
    backgroundColor: theme.accentHover,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
