import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEvents, getSingleGroup, deleteEvent, makeRSVP, updateRSVP } from '../api/client';
import PageHeader from '../components/PageHeader';
import styles from './EventPage.module.css';

export default function EventPage() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rsvping, setRsvping] = useState(false);
  const [note, setNote] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

        // Fetch group data to determine admin status
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
        <PageHeader backTo="/home" backLabel="Back to Home" title="Event" />
        <section className="app-card">
          <p className="app-muted">{error}</p>
        </section>
      </div>
    );
  }

  const userId = user?._id || user?.id;
  const getMemberId = (m) =>
    typeof m.userId === 'object' ? m.userId._id?.toString() : m.userId?.toString();
  const groupName = typeof event.groupId === 'object' ? event.groupId.name : 'Group';
  const groupIdStr = typeof event.groupId === 'object' ? event.groupId._id : event.groupId;
  const groupLink = `/groups/${groupIdStr}`;
  const myMember = group?.members?.find((m) => getMemberId(m) === userId?.toString());
  const isAdmin = myMember && (myMember.role === 'OWNER' || myMember.role === 'ADMIN');
  const createdBy = event.createdBy;

  const handleDeleteEvent = async () => {
    setDeleting(true);
    try {
      await deleteEvent(eventId);
      navigate(groupLink);
    } catch (err) {
      alert(err.message || 'Failed to delete event.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };


  const handleRSVP = async (status) => {
    setRsvping(true);
    try {
      const updated = await makeRSVP(eventId, status, note);

      setEvent((prev) => ({
      ...prev,
      rsvps: updated.rsvps,
    }));

    setSuccessMessage(`RSVP "${status}" saved successfully!`);
    setNote('');

    setTimeout(() => setSuccessMessage(''), 5000);

    } catch (err) {
      alert(err.message || 'Failed to RSVP');
    } finally {
      setRsvping(false);
    }
  };

  return (
    <div className={`app-page ${styles.page}`}>
      <PageHeader
        backTo={groupLink}
        backLabel={`Back to ${groupName}`}
        context="Event"
        title={event.title}
      />

      {/* ── Event info ── */}
      <section className="app-card" aria-labelledby="event-info-heading">
        <div className={styles.headerRow}>
          <h2 id="event-info-heading" className="app-card-title">Event info</h2>
          {isAdmin && (
            <Link to={`/events/${eventId}/settings`} className="app-btn-secondary">
              Edit event
            </Link>
          )}
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Date &amp; Time</span>
            <span className={styles.infoValue}>
              {new Date(event.startAt).toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}{' '}
              at{' '}
              {new Date(event.startAt).toLocaleTimeString(undefined, {
                hour: 'numeric', minute: '2-digit',
              })}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Group</span>
            <Link to={groupLink} className={styles.infoLink}>{groupName}</Link>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Status</span>
            <span className={`${styles.statusBadge} ${styles[`status${event.status}`]}`}>
              {event.status}
            </span>
          </div>
          {createdBy && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Created by</span>
              <span className={styles.infoValue}>
                {createdBy._id === userId
                  ? `${createdBy.name || createdBy.email} (you)`
                  : createdBy.name || createdBy.email}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Location ── */}
      <section className="app-card" aria-labelledby="event-location-heading">
        <h2 id="event-location-heading" className="app-card-title">Location</h2>
        {event.location ? (
          <p className="app-body-text">{event.location}</p>
        ) : (
          <div className="app-empty">
            <p className="app-muted">No location specified.</p>
          </div>
        )}
      </section>

      {/* ── Details ── */}
      <section className="app-card" aria-labelledby="event-desc-heading">
        <h2 id="event-desc-heading" className="app-card-title">Details</h2>
        {event.description ? (
          <p className="app-body-text" style={{ whiteSpace: 'pre-wrap' }}>{event.description}</p>
        ) : (
          <div className="app-empty">
            <p className="app-muted">No details provided.</p>
          </div>
        )}
      </section>

      <section className="app-card">
        <h2 className="app-card-title">Your RSVP</h2>

        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}


        <div className={styles.rsvpActions}>
          <button
            className={styles.rsvpBtn}
            onClick={() => handleRSVP('In')}
            disabled={rsvping}
          >
            In
          </button>

          <button
            className={styles.rsvpBtn}
            onClick={() => handleRSVP('Out')}
            disabled={rsvping}
          >
            Out
          </button>

          <button
            className={styles.rsvpBtn}
            onClick={() => handleRSVP('Maybe')}
            disabled={rsvping}
          >
            Maybe
          </button>
        </div>

        <textarea
          className={styles.rsvpNote}
          placeholder="Add a note (optional)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </section>

      {/* ── Attendees / RSVPs ── */}
      <section className="app-card" aria-labelledby="event-attendees-heading">
        <h2 id="event-attendees-heading" className="app-card-title">
          Attendees {event.rsvps?.length > 0 && `(${event.rsvps.length})`}
        </h2>
        {event.rsvps?.length > 0 ? (
          <ul className={styles.rsvpList}>
            {event.rsvps.map((r, i) => (
              <li key={i} className={styles.rsvpItem}>
                <span className={styles.rsvpName}>
                  {r.userId === userId ? `${user?.name || 'You'} (you)` : 'Member'}
                </span>
                <span className={`${styles.rsvpBadge} ${styles[`rsvp${r.status}`]}`}>
                  {r.status.replace('_', ' ')}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="app-empty">
            <p className="app-muted">No responses yet.</p>
          </div>
        )}
      </section>

      {/* ── Danger zone (admins only) ── */}
      {isAdmin && (
        <section className={`app-card ${styles.dangerCard}`} aria-labelledby="event-danger-heading">
          <h2 id="event-danger-heading" className="app-card-title">Danger zone</h2>
          <p className={styles.dangerDesc}>
            Permanently delete this event. This cannot be undone.
          </p>
          {!confirmDelete ? (
            <button
              type="button"
              className={styles.dangerBtn}
              onClick={() => setConfirmDelete(true)}
            >
              Delete event
            </button>
          ) : (
            <div className={styles.confirmBox}>
              <p className={styles.confirmText}>
                Are you sure you want to delete this event? It will be removed from the group.
              </p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={handleDeleteEvent}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : 'Yes, delete event'}
                </button>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
