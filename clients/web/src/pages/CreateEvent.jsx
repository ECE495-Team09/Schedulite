import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { createEvent } from '../api/client';
import PageHeader from '../components/PageHeader';
import styles from './CreateEvent.module.css';

export default function CreateEvent() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [recurrence, setRecurrence] = useState('once');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const backTo = `/groups/${groupId}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !startAt) return;
    setSubmitting(true);
    setError(null);
    try {
      await createEvent({
        groupId,
        title: title.trim(),
        startAt: new Date(startAt).toISOString(),
        location: location.trim(),
        description: description.trim(),
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
          {/* Title */}
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

          {/* Date / time */}
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

          {/* Recurrence */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-recurrence">
              Recurrence
            </label>
            <select
              id="event-recurrence"
              className={styles.input}
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            >
              <option value="once">Once (no repeat)</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <span className={styles.hint}>
              How often this event repeats.
            </span>
          </div>

          {/* Location */}
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

          {/* Description */}
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
