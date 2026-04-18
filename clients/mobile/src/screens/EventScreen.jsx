import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { getEvents, getSingleGroup, deleteEvent, makeRSVP } from '../api/client';
import ScreenHeader from '../components/ScreenHeader';
import { theme } from '../theme';

function getMemberUserId(m) {
  return typeof m.userId === 'object' ? m.userId._id?.toString() : m.userId?.toString();
}

function computeRsvpStats(event, group) {
  const members = group?.members ?? [];
  const rsvps = event?.rsvps ?? [];
  const rsvpByUser = new Map(
    rsvps.map((r) => {
      const uid = typeof r.userId === 'object' ? r.userId._id?.toString() : String(r.userId);
      return [uid, r];
    })
  );
  const isAttending = (s) => s === 'In' || s === 'YES';
  const isNot = (s) => s === 'Out' || s === 'NO';
  const isMaybe = (s) => s === 'Maybe' || s === 'MAYBE';
  const counts = { attending: 0, notAttending: 0, maybe: 0, noResponse: 0 };

  if (members.length > 0) {
    for (const m of members) {
      const uid = getMemberUserId(m);
      const r = rsvpByUser.get(uid);
      const s = r?.status;
      if (isAttending(s)) counts.attending += 1;
      else if (isNot(s)) counts.notAttending += 1;
      else if (isMaybe(s)) counts.maybe += 1;
      else counts.noResponse += 1;
    }
  } else {
    for (const r of rsvps) {
      const s = r.status;
      if (isAttending(s)) counts.attending += 1;
      else if (isNot(s)) counts.notAttending += 1;
      else if (isMaybe(s)) counts.maybe += 1;
      else counts.noResponse += 1;
    }
  }
  return counts;
}

function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlicePath(cx, cy, rInner, rOuter, startAngle, endAngle) {
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const p1 = polar(cx, cy, rOuter, startAngle);
  const p2 = polar(cx, cy, rOuter, endAngle);
  const p3 = polar(cx, cy, rInner, endAngle);
  const p4 = polar(cx, cy, rInner, startAngle);
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

function RsvpDonut({ stats, size = 160 }) {
  const { attending, notAttending, maybe, noResponse } = stats;
  const total = attending + notAttending + maybe + noResponse;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 4;
  const rInner = rOuter * 0.58;
  const colors = ['#22c55e', '#ef4444', '#eab308', '#9ca3af'];
  const counts = [attending, notAttending, maybe, noResponse];

  if (total === 0) {
    return (
      <Svg width={size} height={size}>
        <Path d={donutSlicePath(cx, cy, rInner, rOuter, 0, 359.99)} fill="#9ca3af" />
      </Svg>
    );
  }

  let angle = 0;
  const paths = [];
  counts.forEach((count, i) => {
    if (count <= 0) return;
    const sweep = (count / total) * 360;
    const end = Math.min(angle + sweep, angle + 359.99);
    paths.push(
      <Path
        key={`seg-${i}-${angle}`}
        d={donutSlicePath(cx, cy, rInner, rOuter, angle, end)}
        fill={colors[i]}
      />
    );
    angle += sweep;
  });

  return <Svg width={size} height={size}>{paths}</Svg>;
}

function RsvpMeterBar({ color, pct, delayMs }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 520,
      delay: delayMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, delayMs, anim]);

  return (
    <View style={styles.meterTrack}>
      <Animated.View
        style={[
          styles.meterFill,
          {
            backgroundColor: color,
            width: anim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

function RsvpMeterLegend({ stats }) {
  const total = stats.attending + stats.notAttending + stats.maybe + stats.noResponse;
  const pct = (n) => (total > 0 ? (n / total) * 100 : 0);
  const rows = [
    { key: 'a', color: '#22c55e', label: 'Attending', count: stats.attending },
    { key: 'n', color: '#ef4444', label: 'Not attending', count: stats.notAttending },
    { key: 'm', color: '#eab308', label: 'Maybe', count: stats.maybe },
    { key: 'u', color: '#9ca3af', label: "Hasn't responded", count: stats.noResponse },
  ];

  return (
    <View style={styles.meterLegendWrap}>
      {rows.map((r, i) => (
        <View key={r.key} style={styles.legendBarBlock}>
          <View style={styles.legendBarLabel}>
            <View style={[styles.legendSwatch, { backgroundColor: r.color }]} />
            <Text style={styles.legendText}>
              {r.label}{' '}
              <Text style={styles.legendCount}>{r.count}</Text>
            </Text>
          </View>
          <RsvpMeterBar color={r.color} pct={pct(r.count)} delayMs={i * 45} />
        </View>
      ))}
    </View>
  );
}

function badgeStylesForStatus(status) {
  const s = String(status);
  if (s === 'In' || s === 'YES') return [styles.rsvpBadge, styles.rsvpBadgeIn];
  if (s === 'Out' || s === 'NO') return [styles.rsvpBadge, styles.rsvpBadgeOut];
  if (s === 'Maybe' || s === 'MAYBE') return [styles.rsvpBadge, styles.rsvpBadgeMaybe];
  return [styles.rsvpBadge, styles.rsvpBadgeMuted];
}

export default function EventScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rsvping, setRsvping] = useState(false);
  const [note, setNote] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rsvpNoteModal, setRsvpNoteModal] = useState(null);

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

  const handleRSVP = async (status) => {
    setRsvping(true);
    try {
      const updated = await makeRSVP(eventId, status, note);
      setEvent((prev) => ({
        ...prev,
        rsvps: updated.rsvps ?? prev.rsvps,
      }));
      setSuccessMessage(`RSVP saved (${status}).`);
      setNote('');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      Alert.alert('RSVP failed', err.message || 'Could not save RSVP.');
    } finally {
      setRsvping(false);
    }
  };

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
  const createdById = createdBy?._id ?? createdBy;
  const isEventCreator = createdById && String(createdById) === String(userId);
  const canViewMemberNotes = Boolean(isAdmin || isEventCreator);
  const rsvpStats = computeRsvpStats(event, group);
  const myRsvp = event.rsvps?.find((r) => String(r.userId) === String(userId));
  const myStatus = myRsvp?.status;

  return (
    <>
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
              onPress={() => navigation.navigate('EventSettings', { eventId })}
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
        <Text style={styles.cardTitle}>Your RSVP</Text>
        {successMessage ? <Text style={styles.successMessage}>{successMessage}</Text> : null}
        <View style={styles.rsvpActions}>
          <Pressable
            style={[
              styles.rsvpBtn,
              styles.rsvpBtnIn,
              (myStatus === 'In' || myStatus === 'YES') && styles.rsvpBtnSelected,
              rsvping && styles.rsvpBtnDisabled,
            ]}
            onPress={() => handleRSVP('In')}
            disabled={rsvping}
          >
            <Text style={styles.rsvpBtnTextIn}>Attending</Text>
          </Pressable>
          <Pressable
            style={[
              styles.rsvpBtn,
              styles.rsvpBtnOut,
              (myStatus === 'Out' || myStatus === 'NO') && styles.rsvpBtnSelected,
              rsvping && styles.rsvpBtnDisabled,
            ]}
            onPress={() => handleRSVP('Out')}
            disabled={rsvping}
          >
            <Text style={styles.rsvpBtnTextOut}>Not attending</Text>
          </Pressable>
          <Pressable
            style={[
              styles.rsvpBtn,
              styles.rsvpBtnMaybe,
              (myStatus === 'Maybe' || myStatus === 'MAYBE') && styles.rsvpBtnSelected,
              rsvping && styles.rsvpBtnDisabled,
            ]}
            onPress={() => handleRSVP('Maybe')}
            disabled={rsvping}
          >
            <Text style={styles.rsvpBtnTextMaybe}>Maybe</Text>
          </Pressable>
        </View>
        <TextInput
          style={styles.rsvpNote}
          placeholder="Add a note (optional)…"
          placeholderTextColor={theme.textFaint}
          value={note}
          onChangeText={setNote}
          multiline
          editable={!rsvping}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>RSVP overview</Text>
        <View style={styles.rsvpChartRow}>
          <RsvpDonut stats={rsvpStats} />
          <RsvpMeterLegend stats={rsvpStats} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Attendees {event.rsvps?.length > 0 ? `(${event.rsvps.length})` : ''}
        </Text>
        {canViewMemberNotes && event.rsvps?.length > 0 ? (
          <Text style={styles.organizerNoteHint}>
            Tap a response to view that member&apos;s RSVP note (if any).
          </Text>
        ) : null}
        {event.rsvps?.length > 0 ? (
          event.rsvps.map((r, i) => {
            const label =
              String(r.userId) === String(userId) ? `${user?.name || 'You'} (you)` : 'Member';
            const statusLabel = String(r.status).replace('_', ' ');
            const key = `${String(r.userId)}-${i}`;
            const openNote = () =>
              setRsvpNoteModal({
                label,
                statusLabel,
                note: (r.note && String(r.note).trim()) || '',
              });
            if (canViewMemberNotes) {
              return (
                <Pressable
                  key={key}
                  style={[styles.rsvpRow, styles.rsvpRowPressable]}
                  onPress={openNote}
                  accessibilityRole="button"
                  accessibilityLabel={`View RSVP note for ${label}`}
                >
                  <Text style={styles.rsvpName}>{label}</Text>
                  <Text style={badgeStylesForStatus(r.status)}>{statusLabel}</Text>
                </Pressable>
              );
            }
            return (
              <View key={key} style={styles.rsvpRow}>
                <Text style={styles.rsvpName}>{label}</Text>
                <Text style={badgeStylesForStatus(r.status)}>{statusLabel}</Text>
              </View>
            );
          })
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

    <Modal
      visible={!!rsvpNoteModal}
      transparent
      animationType="fade"
      onRequestClose={() => setRsvpNoteModal(null)}
    >
      <View style={styles.noteModalRoot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={[StyleSheet.absoluteFillObject, styles.noteModalDim]}
          onPress={() => setRsvpNoteModal(null)}
        />
        <View style={styles.noteModalCard}>
          <Text style={styles.noteModalTitle}>RSVP note</Text>
          {rsvpNoteModal ? (
            <>
              <Text style={styles.noteModalMeta}>
                {rsvpNoteModal.label} · {rsvpNoteModal.statusLabel}
              </Text>
              <Text style={styles.noteModalBody}>
                {rsvpNoteModal.note || 'No note was left with this RSVP.'}
              </Text>
            </>
          ) : null}
          <Pressable style={styles.noteModalClose} onPress={() => setRsvpNoteModal(null)}>
            <Text style={styles.noteModalCloseText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
    </>
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
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  rsvpRowPressable: {
    borderRadius: 8,
  },
  organizerNoteHint: {
    fontSize: 13,
    color: theme.textMuted,
    marginBottom: 10,
    lineHeight: 18,
  },
  noteModalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noteModalDim: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  noteModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.border,
    zIndex: 2,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  noteModalTitle: { fontSize: 18, fontWeight: '600', color: theme.text, marginBottom: 8 },
  noteModalMeta: { fontSize: 14, color: theme.textMuted, marginBottom: 12 },
  noteModalBody: { fontSize: 16, color: theme.text, lineHeight: 24, marginBottom: 16 },
  noteModalClose: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.bgAlt,
  },
  noteModalCloseText: { fontSize: 15, fontWeight: '600', color: theme.text },
  rsvpName: { fontSize: 15, color: theme.text },
  rsvpBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  rsvpBadgeIn: { color: '#14532d', backgroundColor: 'rgba(34, 197, 94, 0.2)' },
  rsvpBadgeOut: { color: '#7f1d1d', backgroundColor: 'rgba(239, 68, 68, 0.18)' },
  rsvpBadgeMaybe: { color: '#713f12', backgroundColor: 'rgba(234, 179, 8, 0.22)' },
  rsvpBadgeMuted: { color: theme.textMuted, backgroundColor: theme.bgAlt },
  successMessage: {
    fontSize: 14,
    color: theme.success,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.25)',
  },
  rsvpActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  rsvpBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 100,
    flexGrow: 1,
    flexBasis: '30%',
  },
  rsvpBtnIn: { backgroundColor: 'rgba(34, 197, 94, 0.18)', borderColor: 'rgba(34, 197, 94, 0.45)' },
  rsvpBtnOut: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)' },
  rsvpBtnMaybe: { backgroundColor: 'rgba(234, 179, 8, 0.2)', borderColor: 'rgba(234, 179, 8, 0.5)' },
  rsvpBtnSelected: {
    borderColor: theme.accent,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  rsvpBtnDisabled: { opacity: 0.55 },
  rsvpBtnTextIn: { fontSize: 14, fontWeight: '600', color: '#14532d', textAlign: 'center' },
  rsvpBtnTextOut: { fontSize: 14, fontWeight: '600', color: '#7f1d1d', textAlign: 'center' },
  rsvpBtnTextMaybe: { fontSize: 14, fontWeight: '600', color: '#713f12', textAlign: 'center' },
  rsvpNote: {
    marginTop: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.bgAlt,
    color: theme.text,
    fontSize: 16,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  rsvpChartRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 4,
  },
  meterLegendWrap: { flex: 1, minWidth: 200, gap: 10 },
  legendBarBlock: { marginBottom: 2 },
  legendBarLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  legendSwatch: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 14, color: theme.text, flex: 1, flexWrap: 'wrap' },
  legendCount: { fontWeight: '700', color: theme.text },
  meterTrack: {
    width: '100%',
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.bgAlt,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  meterFill: {
    height: 7,
    borderRadius: 3,
  },
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
