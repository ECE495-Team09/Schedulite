import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { createEvent } from '../api/client';
import PageHeader from '../components/PageHeader';
import {
  RECURRENCE_TYPES,
  REMINDER_PRESETS,
  WEEKDAY_LABELS,
  buildRecurrencePayload,
} from '../constants/eventForm';
import styles from './CreateEvent.module.css';

export default function CreateEvent() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [recurrenceType, setRecurrenceType] = useState('NONE');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState(() => []);
  const [recurrenceUntil, setRecurrenceUntil] = useState('');
  const [reminderSelections, setReminderSelections] = useState(() => new Set([1440]));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const backTo = `/groups/${groupId}`;

  const toggleWeekday = (d) => {
    setRecurrenceWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return [...next].sort((a, b) => a - b);
    });
  };

  const toggleReminder = (minutes) => {
    setReminderSelections((prev) => {
      const next = new Set(prev);
      if (next.has(minutes)) next.delete(minutes);
      else next.add(minutes);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !startAt) return;
    setSubmitting(true);
    setError(null);
    try {
      const recurrence = buildRecurrencePayload({
        recurrenceType,
        recurrenceInterval,
        recurrenceWeekdays,
        recurrenceUntil,
        startAtForWeekdayFallback: startAt,
      });
      const reminderOffsetsMinutes =
        reminderSelections.size > 0 ? [...reminderSelections].sort((a, b) => a - b) : [1440];

      await createEvent({
        groupId,
        title: title.trim(),
        startAt: new Date(startAt).toISOString(),
        location: location.trim(),
        description: description.trim(),
        recurrence,
        reminderOffsetsMinutes,
      });
      navigate(backTo);
    } catch (err) {
      setError(err.message || 'Failed to create event.');
      setSubmitting(false);
    }
  };

  return (
    <div className={`app-page ${styles.page}`}>
      <PageHeader
        backTo={backTo}
        backLabel="Back to Group"
        context="Event"
        title="Create event"
      />

      <section className="app-card" aria-labelledby="create-event-heading">
        <h2 id="create-event-heading" className="app-card-title" style={{ marginBottom: '1rem' }}>
          New event
        </h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-title">
              Event title <span className={styles.required}>*</span>
            </label>
            <input
              id="event-title"
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Team Meeting"
              maxLength={120}
              required
              autoFocus
            />
            <span className={styles.hint}>{title.length}/120 characters</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-start">
              Date &amp; time <span className={styles.required}>*</span>
            </label>
            <input
              id="event-start"
              type="datetime-local"
              className={styles.input}
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-recurrence">
              Repeats
            </label>
            <select
              id="event-recurrence"
              className={styles.input}
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value)}
            >
              {RECURRENCE_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className={styles.hint}>
              For weekly/monthly, reminders apply to each occurrence.
            </span>
          </div>

          {recurrenceType !== 'NONE' ? (
            <>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="rec-interval">
                  Every (interval)
                </label>
                <input
                  id="rec-interval"
                  type="number"
                  min={1}
                  max={52}
                  className={styles.input}
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(e.target.value)}
                />
                <span className={styles.hint}>
                  {recurrenceType === 'DAILY' && 'Repeat every N days'}
                  {recurrenceType === 'WEEKLY' && 'Repeat every N weeks'}
                  {recurrenceType === 'MONTHLY' && 'Repeat every N months (e.g. 1 = monthly)'}
                </span>
              </div>

              {recurrenceType === 'WEEKLY' ? (
                <div className={styles.field}>
                  <span className={styles.label}>On weekdays</span>
                  <div className={styles.weekdayRow}>
                    {WEEKDAY_LABELS.map((label, d) => (
                      <label key={label} className={styles.weekdayChip}>
                        <input
                          type="checkbox"
                          checked={recurrenceWeekdays.includes(d)}
                          onChange={() => toggleWeekday(d)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <span className={styles.hint}>If none selected, the weekday of the start date is used.</span>
                </div>
              ) : null}

              <div className={styles.field}>
                <label className={styles.label} htmlFor="rec-until">
                  Repeat until (optional)
                </label>
                <input
                  id="rec-until"
                  type="datetime-local"
                  className={styles.input}
                  value={recurrenceUntil}
                  onChange={(e) => setRecurrenceUntil(e.target.value)}
                />
              </div>
            </>
          ) : null}

          <div className={styles.field}>
            <span className={styles.label}>Reminders (push)</span>
            <div className={styles.reminderGrid}>
              {REMINDER_PRESETS.map((p) => (
                <label key={p.value} className={styles.reminderChip}>
                  <input
                    type="checkbox"
                    checked={reminderSelections.has(p.value)}
                    onChange={() => toggleReminder(p.value)}
                  />
                  {p.label}
                </label>
              ))}
            </div>
            <span className={styles.hint}>
              Notifications are sent to group members’ devices for each occurrence.
            </span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-location">
              Location
            </label>
            <input
              id="event-location"
              type="text"
              className={styles.input}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room 101 / Zoom link"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-desc">
              Details
            </label>
            <textarea
              id="event-desc"
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the event..."
              rows={3}
            />
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <div className={styles.formFooter}>
            <Link to={backTo} className={styles.cancelBtn}>
              Cancel
            </Link>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !title.trim() || !startAt}
            >
              {submitting ? 'Creating…' : 'Create event'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
