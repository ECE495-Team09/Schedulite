import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getSingleGroup, getEvents } from '../api/client';
import { getAvatarColor } from '../utils/avatar';
import ScreenHeader from '../components/ScreenHeader';
import { theme } from '../theme';

export default function GroupScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [groupsRes, eventsRes] = await Promise.all([getSingleGroup(groupId), getEvents()]);
        if (cancelled) return;
        const raw = groupsRes.group;
        const found = Array.isArray(raw) ? raw[0] : raw;
        if (!found) {
          setError('Group not found or you are not a member.');
          return;
        }
        setGroup(found);
        const all = eventsRes.events || [];
        setEvents(
          all.filter((e) => {
            const gId = typeof e.groupId === 'object' ? e.groupId._id : e.groupId;
            return String(gId) === String(groupId);
          })
        );
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load group');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [groupId]);

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
          backLabel="← Back to Home"
          contextLabel="Group"
          title="Group"
        />
        <View style={styles.card}>
          <Text style={styles.muted}>{error || 'Not found'}</Text>
        </View>
      </ScrollView>
    );
  }

  const userId = user?._id || user?.id;
  const getMemberId = (m) =>
    typeof m.userId === 'object' ? m.userId._id?.toString() : m.userId?.toString();
  const myMember = group.members.find((m) => getMemberId(m) === userId?.toString());
  const isAdmin = myMember && (myMember.role === 'OWNER' || myMember.role === 'ADMIN');

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <ScreenHeader
        navigation={navigation}
        backLabel="← Back to Home"
        contextLabel="Group"
        title={group.name}
      />

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Group info</Text>
          {isAdmin ? (
            <Pressable
              style={styles.btnSecondary}
              onPress={() =>
                navigation.navigate('GroupSettings', { groupId: String(groupId) })
              }
            >
              <Text style={styles.btnSecondaryText}>Group settings</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Join Code</Text>
            <Text style={styles.joinCode}>{group.joinCode}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Members</Text>
            <Text style={styles.infoValue}>{group.members.length}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : '—'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Members</Text>
        {group.members.length === 0 ? (
          <Text style={styles.muted}>No members yet.</Text>
        ) : (
          group.members.map((m, i) => {
            const memberId = typeof m.userId === 'object' ? m.userId._id : m.userId;
            const memberName =
              typeof m.userId === 'object' ? (m.userId.name || m.userId.email) : null;
            const isMe = String(memberId) === String(userId);
            const displayName = memberName || (isMe ? user.name || user.email : null);
            const seed = displayName || String(memberId ?? '');
            const fb = getAvatarColor(seed);
            return (
              <View key={i} style={styles.memberRow}>
                <View style={styles.memberNameRow}>
                  <View style={[styles.memberAvatarFallback, { backgroundColor: fb.background }]}>
                    <Text style={[styles.memberLetter, { color: fb.color }]}>
                      {(displayName || '?')[0]?.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.memberName}>
                    {isMe ? `${user.name || user.email} (you)` : memberName || 'Member'}
                  </Text>
                </View>
                <Text style={styles.roleBadge}>{m.role}</Text>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Events</Text>
          {isAdmin ? (
            <Pressable
              style={styles.btnPrimary}
              onPress={() =>
                navigation.navigate('CreateEvent', { groupId: String(groupId) })
              }
            >
              <Text style={styles.btnPrimaryText}>Create event</Text>
            </Pressable>
          ) : null}
        </View>
        {events.length === 0 ? (
          <Text style={styles.muted}>
            No events yet.{isAdmin ? ' Create one to get started.' : ''}
          </Text>
        ) : (
          events.map((ev) => (
            <Pressable
              key={ev._id}
              style={styles.eventRow}
              onPress={() => navigation.navigate('Event', { eventId: ev._id })}
            >
              <View>
                <Text style={styles.eventTitle}>{ev.title}</Text>
                {ev.location ? <Text style={styles.eventMeta}>{ev.location}</Text> : null}
              </View>
              <Text style={styles.eventDate}>
                {new Date(ev.startAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </Pressable>
          ))
        )}
      </View>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  muted: { color: theme.textMuted, fontSize: 15 },
  infoGrid: { gap: 12 },
  infoItem: { marginBottom: 4 },
  infoLabel: { fontSize: 13, color: theme.textMuted, marginBottom: 4 },
  infoValue: { fontSize: 16, color: theme.text },
  joinCode: { fontSize: 18, fontWeight: '600', letterSpacing: 3, color: theme.text },
  btnSecondary: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  btnSecondaryText: { color: theme.textMuted, fontSize: 14, fontWeight: '500' },
  btnPrimary: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.accent,
  },
  btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 10,
  },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  memberAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberLetter: { fontSize: 16, fontWeight: '600' },
  memberName: { fontSize: 16, color: theme.text, flex: 1, minWidth: 0 },
  roleBadge: { fontSize: 12, color: theme.textMuted, fontWeight: '500', flexShrink: 0, marginTop: 2 },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  eventTitle: { fontSize: 16, fontWeight: '600', color: theme.text },
  eventMeta: { fontSize: 14, color: theme.textMuted, marginTop: 4 },
  eventDate: { fontSize: 14, color: theme.textMuted },
});
