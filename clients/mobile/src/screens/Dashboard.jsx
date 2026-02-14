import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Welcome</Text>
      <Text style={styles.muted}>
        You're signed in. Events and groups can be wired up here once the backend routes are implemented.
      </Text>
      <View style={styles.profile}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name || '—'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#f5f5f5',
  },
  muted: {
    fontSize: 15,
    color: '#888',
    marginBottom: 20,
  },
  profile: {
    gap: 4,
  },
  label: {
    fontSize: 15,
    color: '#888',
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: '#f5f5f5',
  },
});
