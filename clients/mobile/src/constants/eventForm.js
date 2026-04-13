export const RECURRENCE_TYPES = [
  { value: 'NONE', label: 'Does not repeat' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

export const REMINDER_PRESETS = [
  { value: 15, label: '15 min before' },
  { value: 30, label: '30 min before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '24 hours before' },
  { value: 10080, label: '1 week before' },
];

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function toDatetimeLocalValue(isoOrDate) {
  if (!isoOrDate) return '';
  const dt = new Date(isoOrDate);
  if (Number.isNaN(dt.getTime())) return '';
  return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function recurrenceFieldsFromEvent(event) {
  const r = event?.recurrence || {};
  const type = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'].includes(r.type) ? r.type : 'NONE';
  return {
    recurrenceType: type,
    recurrenceInterval: Math.max(1, r.interval || 1),
    recurrenceWeekdays: Array.isArray(r.weekdays) ? [...r.weekdays] : [],
    recurrenceUntil: toDatetimeLocalValue(r.until),
  };
}

export function reminderSetFromEvent(event) {
  const arr = event?.reminderOffsetsMinutes?.length > 0 ? event.reminderOffsetsMinutes : [1440];
  return new Set(arr);
}

export function buildRecurrencePayload({
  recurrenceType,
  recurrenceInterval,
  recurrenceWeekdays,
  recurrenceUntil,
  startAtForWeekdayFallback,
}) {
  return {
    type: recurrenceType,
    interval: Math.max(1, parseInt(recurrenceInterval, 10) || 1),
    weekdays:
      recurrenceType === 'WEEKLY' && recurrenceWeekdays.length
        ? recurrenceWeekdays
        : recurrenceType === 'WEEKLY'
          ? [new Date(startAtForWeekdayFallback).getDay()]
          : [],
    until: recurrenceUntil ? new Date(recurrenceUntil).toISOString() : null,
  };
}

