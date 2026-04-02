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
import { getEvents, getSingleGroup, deleteEvent } from '../api/client';
import ScreenHeader from '../components/ScreenHeader';
import { theme } from '../theme';

export default function EventScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const eventsRes = await getEvents();
        if (cancelled) return;
        const found = eventsRes.events?.find((e) => e._id === eventId);
        if (!found) {
          setError('Event not found.');
          return;
        }
        setEvent(found);
        const gId = typeof found.groupId === 'object' ? found.groupId._id : found.groupId;
        if (gId) {
          const groupRes = await getSingleGroup(gId);
          if (cancelled) return;
          const raw = groupRes.group;
          const g = Array.isArray(raw) ? raw[0] : raw;
          if (g) setGroup(g);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load event');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [eventId]);

  const handleDeleteEvent = async () => {
    setDeleting(true);
    try {
      await deleteEvent(eventId);
      const gId = typeof event.groupId === 'object' ? event.groupId._id : event.groupId;
      navigation.replace('Group', { groupId: String(gId) });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to delete event.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        <ScreenHeader
          navigation={navigation}
          backLabel="← Back to Home"
          contextLabel="Event"
          title="Event"
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
  const myMember = group?.members?.find((m) => getMemberId(m) === userId?.toString());
  const isAdmin = myMember && (myMember.role === 'OWNER' || myMember.role === 'ADMIN');
  const groupName = typeof event.groupId === 'object' ? event.groupId.name : 'Group';
  const groupIdStr = typeof event.groupId === 'object' ? event.groupId._id : event.groupId;
  const createdBy = event.createdBy;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <ScreenHeader
        navigation={navigation}
        backLabel={`← Back to ${groupName}`}
        contextLabel="Event"
        title={event.title}
        onBack={() => navigation.navigate('Group', { groupId: String(groupIdStr) })}
      />

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Event info</Text>
          {isAdmin ? (
            <Pressable
              style={styles.btnSecondary}
              onPress={() => Alert.alert('Edit event', 'Use the web app to edit events for now.')}
            >
              <Text style={styles.btnSecondaryText}>Edit event</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Date & Time</Text>
          <Text style={styles.infoValue}>
            {new Date(event.startAt).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            at{' '}
            {new Date(event.startAt).toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Group</Text>
          <Pressable onPress={() => navigation.navigate('Group', { groupId: String(groupIdStr) })}>
            <Text style={styles.link}>{groupName}</Text>
          </Pressable>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValue}>{event.status}</Text>
        </View>
        {createdBy && (
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Created by</Text>
            <Text style={styles.infoValue}>
              {createdBy._id === userId || String(createdBy._id) === String(userId)
                ? `${createdBy.name || createdBy.email} (you)`
                : createdBy.name || createdBy.email}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location</Text>
        {event.location ? (
          <Text style={styles.bodyText}>{event.location}</Text>
        ) : (
          <Text style={styles.muted}>No location specified.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Details</Text>
        {event.description ? (
          <Text style={styles.bodyText}>{event.description}</Text>
        ) : (
          <Text style={styles.muted}>No details provided.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Attendees {event.rsvps?.length > 0 ? `(${event.rsvps.length})` : ''}
        </Text>
        {event.rsvps?.length > 0 ? (
          event.rsvps.map((r, i) => (
            <View key={i} style={styles.rsvpRow}>
              <Text style={styles.rsvpName}>
                {String(r.userId) === String(userId) ? `${user?.name || 'You'} (you)` : 'Member'}
              </Text>
              <Text style={styles.rsvpBadge}>{String(r.status).replace('_', ' ')}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.muted}>No responses yet.</Text>
        )}
      </View>

      {isAdmin ? (
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={styles.cardTitle}>Danger zone</Text>
          <Text style={styles.dangerDesc}>Permanently delete this event. This cannot be undone.</Text>
          {!confirmDelete ? (
            <Pressable style={styles.dangerBtn} onPress={() => setConfirmDelete(true)}>
              <Text style={styles.dangerBtnText}>Delete event</Text>
            </Pressable>
          ) : (
            <View>
              <Text style={styles.confirmText}>
                Are you sure you want to delete this event? It will be removed from the group.
              </Text>
              <View style={styles.confirmActions}>
                <Pressable
                  style={[styles.dangerBtn, deleting && { opacity: 0.6 }]}
                  onPress={handleDeleteEvent}
                  disabled={deleting}
                >
                  <Text style={styles.dangerBtnText}>{deleting ? 'Deleting…' : 'Yes, delete event'}</Text>
                </Pressable>
                <Pressable style={styles.ghostBtn} onPress={() => setConfirmDelete(false)} disabled={deleting}>
                  <Text style={styles.ghostText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
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
  dangerCard: { borderColor: 'rgba(220, 38, 38, 0.35)' },
  cardTitle: { fontSize: 17, fontWeight: '600', color: theme.text, marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  btnSecondary: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  btnSecondaryText: { color: theme.textMuted, fontSize: 14, fontWeight: '500' },
  infoBlock: { marginBottom: 12 },
  infoLabel: { fontSize: 13, color: theme.textMuted, marginBottom: 4 },
  infoValue: { fontSize: 16, color: theme.text, lineHeight: 22 },
  link: { fontSize: 16, color: theme.accent, fontWeight: '500' },
  muted: { color: theme.textMuted, fontSize: 15 },
  bodyText: { fontSize: 16, color: theme.text, lineHeight: 24 },
  rsvpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  rsvpName: { fontSize: 15, color: theme.text },
  rsvpBadge: { fontSize: 13, color: theme.textMuted },
  dangerDesc: { color: theme.textMuted, marginBottom: 12 },
  dangerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: theme.error,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dangerBtnText: { color: '#fff', fontWeight: '600' },
  confirmText: { marginBottom: 12, color: theme.textMuted },
  confirmActions: { gap: 10 },
  ghostBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    alignSelf: 'flex-start',
  },
  ghostText: { color: theme.textMuted, fontWeight: '500' },
});
