import { useEffect, useState } from 'react';
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
import { getEvents, getSingleGroup, updateEvent, deleteEvent } from '../api/client';
import ScreenHeader from '../components/ScreenHeader';
import {
  RECURRENCE_TYPES,
  REMINDER_PRESETS,
  WEEKDAY_LABELS,
  recurrenceFieldsFromEvent,
  reminderSetFromEvent,
  buildRecurrencePayload,
  toDatetimeLocalValue,
} from '../constants/eventForm';
import EventDateTimeField from '../components/EventDateTimeField';
import { theme } from '../theme';

export default function EventSettingsScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState('');
  const [startAtDate, setStartAtDate] = useState(() => new Date());
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [recurrenceType, setRecurrenceType] = useState('NONE');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState([]);
  const [recurrenceUntilDate, setRecurrenceUntilDate] = useState(null);
  const [reminderSelections, setReminderSelections] = useState(() => new Set([1440]));
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
        setTitle(found.title || '');
        setStartAtDate(
          found.startAt && !Number.isNaN(new Date(found.startAt).getTime())
            ? new Date(found.startAt)
            : new Date()
        );
        setLocation(found.location || '');
        setDescription(found.description || '');
        const rf = recurrenceFieldsFromEvent(found);
        setRecurrenceType(rf.recurrenceType);
        setRecurrenceInterval(rf.recurrenceInterval);
        setRecurrenceWeekdays(rf.recurrenceWeekdays);
        setRecurrenceUntilDate(
          rf.recurrenceUntil
            ? new Date(rf.recurrenceUntil)
            : null
        );
        setReminderSelections(reminderSetFromEvent(found));

        const gId = typeof found.groupId === 'object' ? found.groupId._id : found.groupId;
        if (gId) {
          const groupRes = await getSingleGroup(gId);
          if (cancelled) return;
          const raw = groupRes.group;
          const g = Array.isArray(raw) ? raw[0] : raw;
          if (g) setGroup(g);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load event.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

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
          backLabel="← Back to Event"
          contextLabel="Event"
          title="Event settings"
          onBack={() => navigation.navigate('Event', { eventId })}
        />
        <View style={styles.card}>
          <Text style={styles.muted}>{error || 'Could not load event settings.'}</Text>
        </View>
      </ScrollView>
    );
  }

  const userId = user?._id || user?.id;
  const getMemberId = (m) =>
    typeof m.userId === 'object' ? m.userId._id?.toString() : m.userId?.toString();
  const myMember = group.members.find((m) => getMemberId(m) === userId?.toString());
  const isAdmin = myMember && (myMember.role === 'OWNER' || myMember.role === 'ADMIN');

  const hasChanges =
    title !== (event.title || '') ||
    toDatetimeLocalValue(startAtDate) !== toDatetimeLocalValue(event.startAt) ||
    location !== (event.location || '') ||
    description !== (event.description || '') ||
    JSON.stringify(buildRecurrencePayload({
      recurrenceType,
      recurrenceInterval,
      recurrenceWeekdays,
      recurrenceUntil: toDatetimeLocalValue(recurrenceUntilDate),
      startAtForWeekdayFallback: toDatetimeLocalValue(startAtDate),
    })) !== JSON.stringify(event?.recurrence || { type: 'NONE', interval: 1, weekdays: [], until: null }) ||
    [...(reminderSelections?.size ? reminderSelections : new Set([1440]))].sort((a,b)=>a-b).join(',') !==
      [...(event?.reminderOffsetsMinutes?.length ? event.reminderOffsetsMinutes : [1440])].sort((a,b)=>a-b).join(',');

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Missing title', 'Please enter an event title.');
      return;
    }
    const parsed = startAtDate;
    if (!parsed || Number.isNaN(parsed.getTime())) {
      Alert.alert('Invalid date/time', 'Please choose a valid start date and time.');
      return;
    }

    setSaving(true);
    try {
      const recurrence = buildRecurrencePayload({
        recurrenceType,
        recurrenceInterval,
        recurrenceWeekdays,
        recurrenceUntil: toDatetimeLocalValue(recurrenceUntilDate),
        startAtForWeekdayFallback: toDatetimeLocalValue(startAtDate),
      });
      const reminderOffsetsMinutes =
        reminderSelections.size > 0 ? [...reminderSelections].sort((a, b) => a - b) : [1440];

      await updateEvent(eventId, {
        title: trimmedTitle,
        startAt: parsed.toISOString(),
        location: location.trim(),
        description: description.trim(),
        recurrence,
        reminderOffsetsMinutes,
      });
      Alert.alert('Saved', 'Event updated.');
      navigation.replace('Event', { eventId });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update event.');
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        <ScreenHeader
          navigation={navigation}
          backLabel="← Back to Event"
          contextLabel="Event"
          title="Event settings"
          onBack={() => navigation.navigate('Event', { eventId })}
        />
        <View style={styles.card}>
          <Text style={styles.muted}>You do not have permission to edit this event.</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <ScreenHeader
        navigation={navigation}
        backLabel="← Back to Event"
        contextLabel="Event"
        title="Event settings"
        onBack={() => navigation.navigate('Event', { eventId })}
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Details</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Birthday dinner"
          maxLength={120}
        />

        <EventDateTimeField
          label="Date & time"
          value={startAtDate}
          onChange={setStartAtDate}
          hint="Uses your device’s local timezone."
        />

        <Text style={styles.label}>Repeats</Text>
        <View style={styles.selectWrap}>
          {RECURRENCE_TYPES.map((o) => (
            <Pressable
              key={o.value}
              style={[styles.chip, recurrenceType === o.value && styles.chipActive]}
              onPress={() => setRecurrenceType(o.value)}
            >
              <Text style={[styles.chipText, recurrenceType === o.value && styles.chipTextActive]}>
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>Reminders apply to each occurrence.</Text>

        {recurrenceType !== 'NONE' ? (
          <>
            <Text style={styles.label}>Every (interval)</Text>
            <TextInput
              style={styles.input}
              value={String(recurrenceInterval)}
              onChangeText={(t) => setRecurrenceInterval(Math.max(1, parseInt(t || '1', 10) || 1))}
              keyboardType="number-pad"
            />
            <Text style={styles.hint}>
              {recurrenceType === 'DAILY' && 'Repeat every N days'}
              {recurrenceType === 'WEEKLY' && 'Repeat every N weeks'}
              {recurrenceType === 'MONTHLY' && 'Repeat every N months'}
            </Text>

            {recurrenceType === 'WEEKLY' ? (
              <>
                <Text style={styles.label}>On weekdays</Text>
                <View style={styles.selectWrap}>
                  {WEEKDAY_LABELS.map((label, d) => {
                    const on = recurrenceWeekdays.includes(d);
                    return (
                      <Pressable
                        key={label}
                        style={[styles.chip, on && styles.chipActive]}
                        onPress={() =>
                          setRecurrenceWeekdays((prev) => {
                            const next = new Set(prev);
                            if (next.has(d)) next.delete(d);
                            else next.add(d);
                            return [...next].sort((a, b) => a - b);
                          })
                        }
                      >
                        <Text style={[styles.chipText, on && styles.chipTextActive]}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.hint}>If none selected, the weekday of the start date is used.</Text>
              </>
            ) : null}

            <EventDateTimeField
              label="Repeat until (optional)"
              value={recurrenceUntilDate}
              onChange={setRecurrenceUntilDate}
              minimumDate={startAtDate}
              clearable
            />
          </>
        ) : null}

        <Text style={styles.label}>Reminders (push)</Text>
        <View style={styles.selectWrap}>
          {REMINDER_PRESETS.map((p) => {
            const on = reminderSelections.has(p.value);
            return (
              <Pressable
                key={p.value}
                style={[styles.chip, on && styles.chipActive]}
                onPress={() =>
                  setReminderSelections((prev) => {
                    const next = new Set(prev);
                    if (next.has(p.value)) next.delete(p.value);
                    else next.add(p.value);
                    return next;
                  })
                }
              >
                <Text style={[styles.chipText, on && styles.chipTextActive]}>{p.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Main hall" />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          placeholder="Optional details"
        />
      </View>

      <View style={styles.footerRow}>
        <Pressable style={styles.btnSecondary} onPress={() => navigation.navigate('Event', { eventId })}>
          <Text style={styles.btnSecondaryText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.btnPrimary, (!hasChanges || saving) && styles.btnPrimaryDisabled]}
          onPress={handleSave}
          disabled={!hasChanges || saving}
        >
          <Text style={styles.btnPrimaryText}>{saving ? 'Saving…' : 'Save changes'}</Text>
        </Pressable>
      </View>

      <View style={[styles.card, styles.dangerCard]}>
        <Text style={styles.cardTitle}>Danger zone</Text>
        <Text style={styles.muted}>
          Permanently delete this event. It will be removed from the group and this cannot be undone.
        </Text>
        {!confirmDelete ? (
          <Pressable style={styles.dangerBtn} onPress={() => setConfirmDelete(true)}>
            <Text style={styles.dangerBtnText}>Delete event</Text>
          </Pressable>
        ) : (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.muted}>Are you sure you want to delete this event permanently?</Text>
            <View style={[styles.footerRow, { marginTop: 10 }]}>
              <Pressable
                style={[styles.dangerBtn, deleting && styles.btnDisabled]}
                onPress={async () => {
                  setDeleting(true);
                  try {
                    await deleteEvent(eventId);
                    const gId = typeof event.groupId === 'object' ? event.groupId._id : event.groupId;
                    navigation.navigate('Group', { groupId: String(gId) });
                  } catch (err) {
                    Alert.alert('Error', err.message || 'Failed to delete event.');
                    setDeleting(false);
                    setConfirmDelete(false);
                  }
                }}
                disabled={deleting}
              >
                <Text style={styles.dangerBtnText}>{deleting ? 'Deleting…' : 'Yes, delete event'}</Text>
              </Pressable>
              <Pressable
                style={styles.btnSecondary}
                onPress={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                <Text style={styles.btnSecondaryText}>Go back</Text>
              </Pressable>
            </View>
          </View>
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
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: theme.text, marginBottom: 12 },
  label: { fontSize: 13, color: theme.textMuted, marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.text,
  },
  textarea: { minHeight: 100 },
  hint: { marginTop: 6, color: theme.textMuted, fontSize: 12 },
  selectWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: '#fff',
  },
  chipActive: { borderColor: 'rgba(37, 99, 235, 0.35)', backgroundColor: 'rgba(37, 99, 235, 0.08)' },
  chipText: { color: theme.textMuted, fontWeight: '700', fontSize: 12 },
  chipTextActive: { color: theme.accent },
  muted: { color: theme.textMuted, fontSize: 15 },
  footerRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  dangerCard: { borderColor: 'rgba(220, 38, 38, 0.35)' },
  dangerBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignSelf: 'flex-start',
  },
  dangerBtnText: { color: '#fff', fontWeight: '800' },
  btnDisabled: { opacity: 0.6 },
  btnSecondary: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  btnSecondaryText: { color: theme.textMuted, fontWeight: '600' },
  btnPrimary: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  btnPrimaryDisabled: { opacity: 0.55 },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
});
