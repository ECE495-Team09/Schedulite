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
import { getSingleGroup, createEvent } from '../api/client';
import ScreenHeader from '../components/ScreenHeader';
import {
  RECURRENCE_TYPES,
  REMINDER_PRESETS,
  WEEKDAY_LABELS,
  buildRecurrencePayload,
  toDatetimeLocalValue,
} from '../constants/eventForm';
import EventDateTimeField from '../components/EventDateTimeField';
import { theme } from '../theme';

function defaultStartDate() {
  return new Date(Date.now() + 60 * 60 * 1000);
}

export default function CreateEventScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState('');
  const [startAtDate, setStartAtDate] = useState(() => defaultStartDate());
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [recurrenceType, setRecurrenceType] = useState('NONE');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState(() => []);
  const [recurrenceUntilDate, setRecurrenceUntilDate] = useState(null);
  const [reminderSelections, setReminderSelections] = useState(() => new Set([1440]));

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
          contextLabel="Event"
          title="Create event"
          onBack={() => navigation.navigate('Group', { groupId })}
        />
        <View style={styles.card}>
          <Text style={styles.muted}>{error || 'Could not load group.'}</Text>
        </View>
      </ScrollView>
    );
  }

  const userId = user?._id || user?.id;
  const getMemberId = (m) =>
    typeof m.userId === 'object' ? m.userId._id?.toString() : m.userId?.toString();
  const myMember = group.members?.find((m) => getMemberId(m) === userId?.toString());
  const isAdmin = myMember && (myMember.role === 'OWNER' || myMember.role === 'ADMIN');

  async function handleCreate() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return Alert.alert('Missing title', 'Please enter an event title.');
    const parsed = startAtDate;
    if (!parsed || Number.isNaN(parsed.getTime())) {
      return Alert.alert('Invalid date/time', 'Please choose a valid start date and time.');
    }
    setSaving(true);
    try {
      const startStr = toDatetimeLocalValue(parsed);
      const untilStr = toDatetimeLocalValue(recurrenceUntilDate);
      const recurrence = buildRecurrencePayload({
        recurrenceType,
        recurrenceInterval,
        recurrenceWeekdays,
        recurrenceUntil: untilStr,
        startAtForWeekdayFallback: startStr,
      });
      const reminderOffsetsMinutes =
        reminderSelections.size > 0 ? [...reminderSelections].sort((a, b) => a - b) : [1440];

      const created = await createEvent({
        groupId,
        title: trimmedTitle,
        startAt: parsed.toISOString(),
        location: location.trim(),
        description: description.trim(),
        recurrence,
        reminderOffsetsMinutes,
      });
      navigation.replace('Event', { eventId: created._id });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create event.');
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        <ScreenHeader
          navigation={navigation}
          backLabel="← Back to Group"
          contextLabel="Event"
          title="Create event"
          onBack={() => navigation.navigate('Group', { groupId })}
        />
        <View style={styles.card}>
          <Text style={styles.muted}>You do not have permission to create events in this group.</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <ScreenHeader
        navigation={navigation}
        backLabel="← Back to Group"
        contextLabel="Event"
        title="Create event"
        onBack={() => navigation.navigate('Group', { groupId })}
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
        <Text style={styles.hint}>For weekly/monthly, reminders apply to each occurrence.</Text>

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
                <Text style={styles.hint}>
                  If none selected, the weekday of the start date is used.
                </Text>
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
        <Text style={styles.hint}>Notifications are sent for each occurrence.</Text>

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
        <Pressable style={styles.btnSecondary} onPress={() => navigation.navigate('Group', { groupId })}>
          <Text style={styles.btnSecondaryText}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.btnPrimary, saving && styles.btnPrimaryDisabled]} onPress={handleCreate} disabled={saving}>
          <Text style={styles.btnPrimaryText}>{saving ? 'Creating…' : 'Create event'}</Text>
        </Pressable>
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

