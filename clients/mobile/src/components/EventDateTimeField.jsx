import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../theme';

function safeDate(d) {
  if (!d || Number.isNaN(d.getTime())) return new Date();
  return d;
}

function mergeDatePart(current, next) {
  const c = safeDate(current);
  return new Date(
    next.getFullYear(),
    next.getMonth(),
    next.getDate(),
    c.getHours(),
    c.getMinutes(),
    0,
    0
  );
}

function mergeTimePart(current, next) {
  const c = safeDate(current);
  return new Date(
    c.getFullYear(),
    c.getMonth(),
    c.getDate(),
    next.getHours(),
    next.getMinutes(),
    0,
    0
  );
}

/**
 * Web-style “pick date & time” with native pickers: date and time in one row, tap to change.
 * `value` is local wall time; parent converts to ISO for the API.
 * When `clearable` is true, `value` may be `null` (no date chosen).
 */
export default function EventDateTimeField({
  label,
  value,
  onChange,
  minimumDate,
  hint,
  clearable = false,
}) {
  const [iosSheet, setIosSheet] = useState(null);
  const [androidKind, setAndroidKind] = useState(null);

  const hasValue = value != null && !Number.isNaN(safeDate(value).getTime());
  const d = hasValue ? safeDate(value) : new Date();

  const dateLine = hasValue
    ? d.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';
  const timeLine = hasValue
    ? d.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';

  const openDate = () => {
    if (!hasValue) {
      onChange(new Date());
      return;
    }
    if (Platform.OS === 'ios') setIosSheet('date');
    else setAndroidKind('date');
  };
  const openTime = () => {
    if (!hasValue) {
      onChange(new Date());
      return;
    }
    if (Platform.OS === 'ios') setIosSheet('time');
    else setAndroidKind('time');
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {!hasValue && clearable ? (
        <Pressable
          style={styles.selectFull}
          onPress={() => onChange(new Date())}
          accessibilityLabel="Set date and time"
        >
          <Text style={styles.selectTextMuted}>Tap to set (optional)</Text>
          <Text style={styles.caret}>▾</Text>
        </Pressable>
      ) : (
        <View style={styles.row}>
          <Pressable style={styles.select} onPress={openDate} accessibilityLabel="Select date">
            <Text style={styles.selectText} numberOfLines={1}>
              {dateLine}
            </Text>
            <Text style={styles.caret}>▾</Text>
          </Pressable>
          <Pressable style={styles.select} onPress={openTime} accessibilityLabel="Select time">
            <Text style={styles.selectText}>{timeLine}</Text>
            <Text style={styles.caret}>▾</Text>
          </Pressable>
        </View>
      )}

      {clearable && onChange && hasValue ? (
        <Pressable
          style={styles.clear}
          onPress={() => onChange(null)}
          hitSlop={8}
        >
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
      ) : null}

      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      {Platform.OS === 'ios' && iosSheet && hasValue ? (
        <Modal
          animationType="slide"
          transparent
          visible
          onRequestClose={() => setIosSheet(null)}
        >
          <View style={styles.modalRoot}>
            <Pressable style={styles.modalBackdrop} onPress={() => setIosSheet(null)} />
            <View style={styles.iosPanel}>
              <View style={styles.iosToolbar}>
                <Pressable onPress={() => setIosSheet(null)}>
                  <Text style={styles.iosBtn}>Cancel</Text>
                </Pressable>
                <Text style={styles.iosTitle}>{iosSheet === 'date' ? 'Date' : 'Time'}</Text>
                <Pressable onPress={() => setIosSheet(null)}>
                  <Text style={styles.iosBtnPrimary}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={d}
                mode={iosSheet}
                display="spinner"
                themeVariant="light"
                onChange={(e, next) => {
                  if (e.type === 'dismissed' || !next) return;
                  if (iosSheet === 'date') onChange(mergeDatePart(d, next));
                  else onChange(mergeTimePart(d, next));
                }}
                minimumDate={iosSheet === 'date' ? minimumDate : undefined}
              />
            </View>
          </View>
        </Modal>
      ) : null}

      {Platform.OS === 'android' && androidKind === 'date' && hasValue ? (
        <DateTimePicker
          value={d}
          mode="date"
          display="default"
          onChange={(e, next) => {
            setAndroidKind(null);
            if (e.type === 'dismissed' || !next) return;
            onChange(mergeDatePart(d, next));
          }}
          minimumDate={minimumDate}
        />
      ) : null}

      {Platform.OS === 'android' && androidKind === 'time' && hasValue ? (
        <DateTimePicker
          value={d}
          mode="time"
          display="default"
          onChange={(e, next) => {
            setAndroidKind(null);
            if (e.type === 'dismissed' || !next) return;
            onChange(mergeTimePart(d, next));
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 2 },
  label: { fontSize: 13, color: theme.textMuted, marginBottom: 6, marginTop: 10 },
  row: { flexDirection: 'row', gap: 10 },
  select: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 46,
  },
  selectText: { fontSize: 15, color: theme.text, fontWeight: '600', flex: 1, marginRight: 6 },
  caret: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  hint: { marginTop: 6, color: theme.textMuted, fontSize: 12 },
  clear: { alignSelf: 'flex-start', marginTop: 8, paddingVertical: 4 },
  clearText: { color: theme.accent, fontWeight: '600', fontSize: 14 },
  selectFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 46,
  },
  selectTextMuted: { fontSize: 15, color: theme.textMuted, fontWeight: '600' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  iosPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingBottom: 28,
  },
  iosToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  iosTitle: { fontSize: 15, fontWeight: '600', color: theme.text },
  iosBtn: { fontSize: 16, color: theme.textMuted },
  iosBtnPrimary: { fontSize: 16, color: theme.accent, fontWeight: '600' },
});
