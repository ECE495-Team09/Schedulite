import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AppShell({ children }) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.logo}>Schedulite</Text>
        <View style={styles.userRow}>
          {user?.photoUrl ? (
            <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
          ) : null}
          <Text style={styles.name} numberOfLines={1}>
            {user?.name || user?.email}
          </Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.main}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0f0f12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a30',
    backgroundColor: '#18181c',
  },
  logo: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f4f4f5',
    letterSpacing: -0.5,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  name: {
    fontSize: 15,
    color: '#a1a1aa',
    maxWidth: 120,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2a2a30',
    borderRadius: 6,
  },
  logoutText: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  main: {
    flex: 1,
    padding: 24,
  },
});
