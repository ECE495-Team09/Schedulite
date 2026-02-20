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
    backgroundColor: '#18181c',
    borderWidth: 1,
    borderColor: '#2a2a30',
    borderRadius: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f4f4f5',
    marginBottom: 8,
  },
  muted: {
    color: '#a1a1aa',
    fontSize: 15,
    marginBottom: 20,
  },
  profile: {
    gap: 4,
  },
  label: {
    color: '#a1a1aa',
    fontSize: 15,
    marginTop: 8,
  },
  value: {
    color: '#f4f4f5',
    fontSize: 15,
  },
});
