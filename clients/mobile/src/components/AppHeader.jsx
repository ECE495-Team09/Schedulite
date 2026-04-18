import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import { getAvatarColor } from '../utils/avatar';

export default function AppHeader({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const isSettings = route.name === 'Settings';

  const avatarSeed = user?.name?.trim() || user?.email || user?.id || '?';
  const avatarLetter = (user?.name || user?.email || '?')[0]?.toUpperCase();
  const colors = getAvatarColor(String(avatarSeed));

  return (
    <View style={[styles.bar, { paddingTop: Math.max(insets.top, 8), borderBottomColor: theme.border }]}>
      <View style={styles.left}>
        <Pressable onPress={() => navigation.navigate('Home')} accessibilityRole="button">
          <Text style={styles.logo}>Schedulite</Text>
        </Pressable>
      </View>

      <View style={styles.right}>
        <View style={[styles.avatarFallback, { backgroundColor: colors.background }]}>
          <Text style={[styles.avatarLetter, { color: colors.color }]}>{avatarLetter}</Text>
        </View>
        <Text style={styles.userName} numberOfLines={1}>
          {user?.name || user?.email}
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={[styles.iconBtn, isSettings && styles.iconBtnActive]}
          accessibilityLabel="Open settings"
        >
          <Text style={styles.iconBtnText}>⚙</Text>
        </Pressable>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.cardRadius,
    paddingBottom: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  logo: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    letterSpacing: -0.3,
  },
  navLink: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  navLinkActive: {},
  navLinkText: {
    fontSize: 15,
    color: theme.textMuted,
  },
  navLinkTextActive: {
    color: theme.accent,
    fontWeight: '500',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    justifyContent: 'flex-end',
  },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 13,
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    color: theme.textMuted,
    maxWidth: 100,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  iconBtnActive: {},
  iconBtnText: {
    fontSize: 18,
    color: theme.textMuted,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textMuted,
  },
});
