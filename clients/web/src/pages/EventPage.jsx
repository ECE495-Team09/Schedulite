import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEvents, getSingleGroup, deleteEvent, makeRSVP } from '../api/client';
import PageHeader from '../components/PageHeader';
import styles from './EventPage.module.css';

function getMemberUserId(m) {
  return typeof m.userId === 'object' ? m.userId._id?.toString() : m.userId?.toString();
}

/** Counts RSVP buckets; when `group` is set, includes members with no RSVP row as "no response". */
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

function rsvpDonutStyle(stats) {
  const { attending, notAttending, maybe, noResponse } = stats;
  const total = attending + notAttending + maybe + noResponse;
  const green = '#22c55e';
  const red = '#ef4444';
  const yellow = '#eab308';
  const grey = '#9ca3af';
  if (total === 0) {
    return { background: `conic-gradient(${grey} 0deg 360deg)` };
  }
  let a = 0;
  const parts = [];
  const push = (color, count) => {
    if (count <= 0) return;
    const deg = (count / total) * 360;
    const end = a + deg;
    parts.push(`${color} ${a}deg ${end}deg`);
    a = end;
  };
  push(green, attending);
  push(red, notAttending);
  push(yellow, maybe);
  push(grey, noResponse);
  return { background: `conic-gradient(${parts.join(', ')})` };
}

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
  const [rsvpMetersReady, setRsvpMetersReady] = useState(false);
  const [rsvpNoteModal, setRsvpNoteModal] = useState(null);

  useEffect(() => {
    if (!rsvpNoteModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setRsvpNoteModal(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rsvpNoteModal]);

  useEffect(() => {
    if (loading || error) {
      setRsvpMetersReady(false);
      return;
    }
    setRsvpMetersReady(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setRsvpMetersReady(true));
    });
    return () => cancelAnimationFrame(id);
  }, [loading, error, eventId]);

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
  const createdById = createdBy?._id ?? createdBy;
  const isEventCreator = createdById && String(createdById) === String(userId);
  const canViewMemberNotes = Boolean(isAdmin || isEventCreator);
  const rsvpStats = computeRsvpStats(event, group);
  const rsvpTotal =
    rsvpStats.attending +
    rsvpStats.notAttending +
    rsvpStats.maybe +
    rsvpStats.noResponse;
  const pct = (n) => (rsvpTotal > 0 ? (n / rsvpTotal) * 100 : 0);
  const myRsvp = event.rsvps?.find((r) => String(r.userId) === String(userId));
  const myStatus = myRsvp?.status;

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
        rsvps: updated.rsvps ?? prev.rsvps,
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
            type="button"
            className={`${styles.rsvpBtn} ${styles.rsvpBtnIn} ${myStatus === 'In' || myStatus === 'YES' ? styles.rsvpBtnSelected : ''}`}
            onClick={() => handleRSVP('In')}
            disabled={rsvping}
          >
            Attending
          </button>

          <button
            type="button"
            className={`${styles.rsvpBtn} ${styles.rsvpBtnOut} ${myStatus === 'Out' || myStatus === 'NO' ? styles.rsvpBtnSelected : ''}`}
            onClick={() => handleRSVP('Out')}
            disabled={rsvping}
          >
            Not attending
          </button>

          <button
            type="button"
            className={`${styles.rsvpBtn} ${styles.rsvpBtnMaybe} ${myStatus === 'Maybe' || myStatus === 'MAYBE' ? styles.rsvpBtnSelected : ''}`}
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

      {/* ── RSVP overview ── */}
      <section className="app-card" aria-labelledby="event-rsvp-chart-heading">
        <h2 id="event-rsvp-chart-heading" className="app-card-title">RSVP overview</h2>
        <div className={styles.rsvpChartRow}>
          <div className={styles.donutWrap} aria-hidden>
            <div className={styles.donut} style={rsvpDonutStyle(rsvpStats)}>
              <div className={styles.donutHole} />
            </div>
          </div>
          <ul className={styles.rsvpLegend}>
            <li className={styles.legendBarRow}>
              <div className={styles.legendBarLabel}>
                <span className={`${styles.legendSwatch} ${styles.legendAttending}`} />
                <span>Attending</span>
                <span className={styles.legendCount}>{rsvpStats.attending}</span>
              </div>
              <div className={styles.meterTrack}>
                <div
                  className={`${styles.meterFill} ${styles.meterFillAttending}`}
                  style={{ width: rsvpMetersReady ? `${pct(rsvpStats.attending)}%` : '0%' }}
                />
              </div>
            </li>
            <li className={styles.legendBarRow}>
              <div className={styles.legendBarLabel}>
                <span className={`${styles.legendSwatch} ${styles.legendNotAttending}`} />
                <span>Not attending</span>
                <span className={styles.legendCount}>{rsvpStats.notAttending}</span>
              </div>
              <div className={styles.meterTrack}>
                <div
                  className={`${styles.meterFill} ${styles.meterFillNotAttending}`}
                  style={{ width: rsvpMetersReady ? `${pct(rsvpStats.notAttending)}%` : '0%' }}
                />
              </div>
            </li>
            <li className={styles.legendBarRow}>
              <div className={styles.legendBarLabel}>
                <span className={`${styles.legendSwatch} ${styles.legendMaybe}`} />
                <span>Maybe</span>
                <span className={styles.legendCount}>{rsvpStats.maybe}</span>
              </div>
              <div className={styles.meterTrack}>
                <div
                  className={`${styles.meterFill} ${styles.meterFillMaybe}`}
                  style={{ width: rsvpMetersReady ? `${pct(rsvpStats.maybe)}%` : '0%' }}
                />
              </div>
            </li>
            <li className={styles.legendBarRow}>
              <div className={styles.legendBarLabel}>
                <span className={`${styles.legendSwatch} ${styles.legendNoResponse}`} />
                <span>Hasn&apos;t responded</span>
                <span className={styles.legendCount}>{rsvpStats.noResponse}</span>
              </div>
              <div className={styles.meterTrack}>
                <div
                  className={`${styles.meterFill} ${styles.meterFillNoResponse}`}
                  style={{ width: rsvpMetersReady ? `${pct(rsvpStats.noResponse)}%` : '0%' }}
                />
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Attendees / RSVPs ── */}
      <section className="app-card" aria-labelledby="event-attendees-heading">
        <h2 id="event-attendees-heading" className="app-card-title">
          Attendees {event.rsvps?.length > 0 && `(${event.rsvps.length})`}
        </h2>
        {canViewMemberNotes && event.rsvps?.length > 0 ? (
          <p className={styles.organizerNoteHint}>
            Click a response to view that member&apos;s RSVP note (if any).
          </p>
        ) : null}
        {event.rsvps?.length > 0 ? (
          <ul className={styles.rsvpList}>
            {event.rsvps.map((r, i) => {
              const label =
                String(r.userId) === String(userId) ? `${user?.name || 'You'} (you)` : 'Member';
              const statusLabel = String(r.status).replace('_', ' ');
              const openNote = () =>
                setRsvpNoteModal({
                  label,
                  statusLabel,
                  note: (r.note && String(r.note).trim()) || '',
                });
              return (
                <li key={`${r.userId}-${i}`} className={styles.rsvpItem}>
                  {canViewMemberNotes ? (
                    <button
                      type="button"
                      className={styles.rsvpItemButton}
                      onClick={openNote}
                      aria-label={`View RSVP note for ${label}, ${statusLabel}`}
                    >
                      <span className={styles.rsvpName}>{label}</span>
                      <span className={`${styles.rsvpBadge} ${styles[`rsvp${r.status}`] || ''}`}>
                        {statusLabel}
                      </span>
                    </button>
                  ) : (
                    <div className={styles.rsvpItemStatic}>
                      <span className={styles.rsvpName}>{label}</span>
                      <span className={`${styles.rsvpBadge} ${styles[`rsvp${r.status}`] || ''}`}>
                        {statusLabel}
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
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

      {rsvpNoteModal ? (
        <div
          className={styles.noteModalBackdrop}
          role="presentation"
          onClick={() => setRsvpNoteModal(null)}
        >
          <div
            className={styles.noteModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rsvp-note-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="rsvp-note-dialog-title" className={styles.noteModalTitle}>
              RSVP note
            </h3>
            <p className={styles.noteModalMeta}>
              {rsvpNoteModal.label} · {rsvpNoteModal.statusLabel}
            </p>
            <p className={styles.noteModalBody}>
              {rsvpNoteModal.note ? (
                rsvpNoteModal.note
              ) : (
                <span className={styles.noteModalEmpty}>No note was left with this RSVP.</span>
              )}
            </p>
            <button
              type="button"
              className={styles.noteModalClose}
              onClick={() => setRsvpNoteModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
