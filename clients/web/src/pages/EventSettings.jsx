import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEvents, getSingleGroup, updateEvent, deleteEvent } from '../api/client';
import PageHeader from '../components/PageHeader';
import { ForbiddenScreen } from '../components/AuthGuardScreens';
import styles from './EventSettings.module.css';

export default function EventSettings() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editable fields
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  // Danger zone
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const eventsRes = await getEvents();
        if (cancelled) return;
        const found = eventsRes.events.find((e) => e._id === eventId);
        if (!found) {
          setError('Event not found.');
          return;
        }
        setEvent(found);
        setTitle(found.title);
        // Convert ISO date to datetime-local format
        const dt = new Date(found.startAt);
        const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setStartAt(local);
        setLocation(found.location || '');
        setDescription(found.description || '');

        const gId = typeof found.groupId === 'object' ? found.groupId._id : found.groupId;
        if (gId) {
          const groupRes = await getSingleGroup(gId);
          if (!cancelled && groupRes.group?.[0]) {
            setGroup(groupRes.group[0]);
          }
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

  if (loading) return <div className="app-loading">Loading…</div>;

  if (error) {
    return (
      <div className="app-page">
        <PageHeader backTo={`/events/${eventId}`} backLabel="Back to Event" title="Event Settings" />
        <section className="app-card">
          <p className="app-muted">{error}</p>
        </section>
      </div>
    );
  }

  const userId = user?._id || user?.id;
  const getMemberId = (m) =>
    typeof m.userId === 'object' ? m.userId._id?.toString() : m.userId?.toString();
  const myMember = group?.members?.find((m) => getMemberId(m) === userId?.toString());
  const isAdmin = myMember && (myMember.role === 'OWNER' || myMember.role === 'ADMIN');

  if (!isAdmin) {
    return (
      <ForbiddenScreen
        title="Access denied"
        message="You do not have permission to edit event settings."
        backTo={`/events/${eventId}`}
        backLabel="Back to event"
      />
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const updated = await updateEvent(eventId, {
        title: title.trim(),
        startAt: new Date(startAt).toISOString(),
        location: location.trim(),
        description: description.trim(),
      });
      setEvent(updated);
      setSaveMsg({ ok: true, text: 'Event updated.' });
    } catch (err) {
      setSaveMsg({ ok: false, text: err.message || 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEvent = async () => {
    setCancelling(true);
    try {
      await deleteEvent(eventId);
      const gId = typeof event.groupId === 'object' ? event.groupId._id : event.groupId;
      navigate(`/groups/${gId}`);
    } catch (err) {
      alert(err.message || 'Failed to cancel event.');
      setCancelling(false);
      setConfirmCancel(false);
    }
  };

  const hasChanges =
    title !== event.title ||
    location !== (event.location || '') ||
    description !== (event.description || '');

  return (
    <div className={`app-page ${styles.page}`}>
      <PageHeader
        backTo={`/events/${eventId}`}
        backLabel="Back to Event"
        context="Event"
        title="Event settings"
      />

      {/* ── Details ── */}
      <section className="app-card" aria-labelledby="es-details">
        <h2 id="es-details" className="app-card-title">Details</h2>
        <form className={styles.form} onSubmit={handleSave}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="eventTitle">Event Title</label>
            <input
              id="eventTitle"
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
            />
            <span className={styles.hint}>{title.length}/120 characters</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="eventStart">Date &amp; Time</label>
            <input
              id="eventStart"
              type="datetime-local"
              className={styles.input}
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="eventLocation">Location</label>
            <input
              id="eventLocation"
              type="text"
              className={styles.input}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room 101 / Zoom link"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="eventDesc">Description</label>
            <textarea
              id="eventDesc"
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the event..."
              rows={3}
            />
          </div>

          {saveMsg && (
            <p className={saveMsg.ok ? styles.msgSuccess : styles.msgError}>{saveMsg.text}</p>
          )}

          <div className={styles.formFooter}>
            <button type="submit" className="app-btn-primary" disabled={saving || !hasChanges}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      {/* ── Danger zone ── */}
      <section className={`app-card ${styles.dangerCard}`} aria-labelledby="es-danger">
        <h2 id="es-danger" className="app-card-title">Danger zone</h2>
        <p className={styles.dangerDesc}>
          Permanently delete this event. It will be removed from the group and this cannot be undone.
        </p>

        {!confirmCancel ? (
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={() => setConfirmCancel(true)}
          >
            Delete event
          </button>
        ) : (
          <div className={styles.confirmBox}>
            <p className={styles.confirmText}>
              Are you sure you want to delete this event? It will be removed from the group permanently.
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={handleCancelEvent}
                disabled={cancelling}
              >
                {cancelling ? 'Deleting…' : 'Yes, delete event'}
              </button>
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={() => setConfirmCancel(false)}
                disabled={cancelling}
              >
                Go back
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
