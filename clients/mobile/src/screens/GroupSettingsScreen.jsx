import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getSingleGroup, updateGroup, updateGroupMemberRole, kickGroupMember, deleteGroup } from '../api/client';
import ScreenHeader from '../components/ScreenHeader';
import { getAvatarColor } from '../utils/avatar';
import { theme } from '../theme';

function memberId(m) {
  return typeof m.userId === 'object' ? m.userId._id?.toString() : m.userId?.toString();
}

export default function GroupSettingsScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [busyUserId, setBusyUserId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getSingleGroup(groupId);
        if (cancelled) return;
        const raw = res.group;
        const g = Array.isArray(raw) ? raw[0] : raw;
        if (!g) {
          setError('Group not found.');
          return;
        }
        setGroup(g);
        setGroupName(g.name || '');
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load group.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const userId = user?._id || user?.id;
  const myMember = useMemo(
    () => group?.members?.find((m) => memberId(m) === userId?.toString()),
    [group?.members, userId]
  );
  const isOwner = myMember?.role === 'OWNER';
  const isAdmin = myMember && (myMember.role === 'OWNER' || myMember.role === 'ADMIN');

  async function reload() {
    const res = await getSingleGroup(groupId);
    const raw = res.group;
    const g = Array.isArray(raw) ? raw[0] : raw;
    setGroup(g);
    setGroupName(g?.name || '');
  }

  async function saveName() {
    const nextName = groupName.trim();
    if (!nextName) return Alert.alert('Missing name', 'Please enter a group name.');
    setSavingName(true);
    try {
      const res = await updateGroup(groupId, { name: nextName });
      setGroup(res.group);
      setGroupName(res.group?.name || nextName);
      Alert.alert('Saved', 'Group updated.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update group.');
    } finally {
      setSavingName(false);
    }
  }

  async function changeRole(targetUserId, role) {
    setBusyUserId(targetUserId);
    try {
      const res = await updateGroupMemberRole(groupId, targetUserId, role);
      setGroup(res.group);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update role.');
    } finally {
      setBusyUserId(null);
    }
  }

  async function kick(targetUserId) {
    setBusyUserId(targetUserId);
    try {
      const res = await kickGroupMember(groupId, targetUserId);
      setGroup(res.group);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to kick member.');
    } finally {
      setBusyUserId(null);
    }
  }

  async function disband() {
    Alert.alert(
      'Disband group?',
      'This will permanently delete the group and all events. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disband',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup(groupId);
              navigation.navigate('Home');
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to disband group.');
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (error || !group) {
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        <ScreenHeader
          navigation={navigation}
          backLabel="← Back to Group"
          contextLabel="Group"
          title="Group settings"
          onBack={() => navigation.navigate('Group', { groupId })}
        />
        <View style={styles.card}>
          <Text style={styles.muted}>{error || 'Could not load group.'}</Text>
        </View>
      </ScrollView>
    );
  }

  if (!isAdmin) {
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        <ScreenHeader
          navigation={navigation}
          backLabel="← Back to Group"
          contextLabel="Group"
          title="Group settings"
          onBack={() => navigation.navigate('Group', { groupId })}
        />
        <View style={styles.card}>
          <Text style={styles.muted}>You do not have permission to access group settings.</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <ScreenHeader
        navigation={navigation}
        backLabel="← Back to Group"
        contextLabel="Group"
        title="Group settings"
        onBack={() => navigation.navigate('Group', { groupId })}
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>General</Text>
        <Text style={styles.infoLabel}>Group name</Text>
        <TextInput
          style={styles.input}
          value={groupName}
          onChangeText={setGroupName}
          maxLength={80}
          placeholder="My group"
          placeholderTextColor={theme.textFaint}
        />
        <View style={[styles.footerRow, { marginTop: 12 }]}>
          <Pressable
            style={[
              styles.btnPrimary,
              (savingName || groupName.trim() === (group.name || '')) && styles.btnDisabled,
            ]}
            onPress={saveName}
            disabled={savingName || groupName.trim() === (group.name || '')}
          >
            <Text style={styles.btnPrimaryText}>{savingName ? 'Saving…' : 'Save changes'}</Text>
          </Pressable>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Join code</Text>
          <Text style={styles.codeValue}>{group.joinCode}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Members ({group.members.length})</Text>
        {group.members.map((m, i) => {
          const uid = memberId(m);
          const memberName =
            typeof m.userId === 'object' ? m.userId.name || m.userId.email : null;
          const isMe = uid === userId?.toString();
          const isMemberOwner = m.role === 'OWNER';
          const isMemberAdmin = m.role === 'ADMIN';
          const canPromote = !isMe && !isMemberOwner && !isMemberAdmin && isAdmin;
          const canDemote = !isMe && !isMemberOwner && isMemberAdmin && isOwner;
          const canKick =
            !isMe &&
            !isMemberOwner &&
            (m.role === 'MEMBER' ? isAdmin : isOwner);
          const acting = busyUserId === uid;

          const displayName = isMe ? `${user.name || user.email} (you)` : memberName || 'Member';
          const fb = getAvatarColor(displayName || String(uid ?? ''));

          return (
            <View key={i} style={styles.memberRow}>
              <View style={styles.memberLeft}>
                <View style={[styles.memberAvatarFallback, { backgroundColor: fb.background }]}>
                  <Text style={[styles.memberLetter, { color: fb.color }]}>
                    {(displayName || '?')[0]?.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={styles.roleText}>{m.role}</Text>
                </View>
              </View>

              <View style={styles.memberActions}>
                {canPromote ? (
                  <Pressable
                    style={[styles.pillBtn, styles.pillBtnNeutral, acting && styles.pillBtnDisabled]}
                    onPress={() => changeRole(uid, 'ADMIN')}
                    disabled={acting}
                  >
                    <Text style={styles.pillBtnText}>Make admin</Text>
                  </Pressable>
                ) : null}
                {canDemote ? (
                  <Pressable
                    style={[styles.pillBtn, styles.pillBtnNeutral, acting && styles.pillBtnDisabled]}
                    onPress={() => changeRole(uid, 'MEMBER')}
                    disabled={acting}
                  >
                    <Text style={styles.pillBtnText}>Remove admin</Text>
                  </Pressable>
                ) : null}
                {canKick ? (
                  <Pressable
                    style={[styles.pillBtn, styles.pillBtnDanger, acting && styles.pillBtnDisabled]}
                    onPress={() =>
                      Alert.alert('Kick member?', 'They will be removed from the group.', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Kick', style: 'destructive', onPress: () => kick(uid) },
                      ])
                    }
                    disabled={acting}
                  >
                    <Text style={[styles.pillBtnText, styles.pillBtnTextDanger]}>Kick</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}

        <Pressable style={styles.reloadBtn} onPress={reload}>
          <Text style={styles.reloadBtnText}>Refresh members</Text>
        </Pressable>
      </View>

      {isOwner ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Danger zone</Text>
          <Text style={styles.muted}>
            Permanently disband this group. All members will lose access and all events will be deleted.
          </Text>
          <Pressable style={styles.dangerBtn} onPress={disband}>
            <Text style={styles.dangerBtnText}>Disband group</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.bg },
  pageContent: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg },
  loadingText: { marginTop: 12, color: theme.textMuted },
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.cardRadius,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: theme.text, marginBottom: 12 },
  muted: { color: theme.textMuted, fontSize: 15 },
  hint: { marginTop: 10, color: theme.textMuted, fontSize: 12 },
  infoRow: { marginBottom: 10 },
  infoLabel: { fontSize: 13, color: theme.textMuted, marginBottom: 4 },
  infoValue: { fontSize: 16, color: theme.text },
  codeValue: { fontSize: 18, fontWeight: '700', letterSpacing: 3, color: theme.text },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.text,
  },
  footerRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btnPrimary: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '800' },
  btnDisabled: { opacity: 0.6 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 12,
  },
  memberLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  memberAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberLetter: { fontSize: 16, fontWeight: '600' },
  memberName: { fontSize: 16, color: theme.text, fontWeight: '600' },
  roleText: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  memberActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  pillBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillBtnNeutral: { borderColor: theme.border, backgroundColor: '#fff' },
  pillBtnDanger: { borderColor: '#fecaca', backgroundColor: '#fff' },
  pillBtnDisabled: { opacity: 0.55 },
  pillBtnText: { fontSize: 12, fontWeight: '700', color: theme.textMuted },
  pillBtnTextDanger: { color: '#b91c1c' },
  reloadBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: '#fff',
  },
  reloadBtnText: { color: theme.textMuted, fontWeight: '700' },
  dangerBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignSelf: 'flex-start',
  },
  dangerBtnText: { color: '#fff', fontWeight: '800' },
});

