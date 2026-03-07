import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSingleGroup, getEvents } from '../api/client';
import PageHeader from '../components/PageHeader';
import styles from './GroupPage.module.css';

export default function GroupPage() {
  const { groupId } = useParams();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [groupsRes, eventsRes] = await Promise.all([getSingleGroup(groupId), getEvents()]);
        if (cancelled) return;
        // Backend returns { group: <single doc> }, not an array
        const found = Array.isArray(groupsRes.group) ? groupsRes.group[0] : groupsRes.group;
        if (!found) {
          setError('Group not found or you are not a member.');
          return;
        }
        setGroup(found);
        setEvents(
          eventsRes.events.filter((e) => {
            const gId = typeof e.groupId === 'object' ? e.groupId._id : e.groupId;
            return gId === groupId;
          })
        );
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load group');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [groupId]);

  if (loading) return <div className="app-loading">Loading…</div>;

  if (error) {
    return (
      <div className="app-page">
        <PageHeader backTo="/home" backLabel="Back to Home" title="Group" />
        <section className="app-card">
          <p className="app-muted">{error}</p>
        </section>
      </div>
    );
  }

  const userId = user?._id || user?.id;
  const getMemberId = (m) =>
    typeof m.userId === 'object' ? m.userId._id?.toString() : m.userId?.toString();
  const myMember = group.members.find((m) => getMemberId(m) === userId?.toString());
  const isAdmin = myMember && (myMember.role === 'OWNER' || myMember.role === 'ADMIN');

  return (
    <div className={`app-page ${styles.page}`}>
      <PageHeader backTo="/home" backLabel="Back to Home" context="Group" title={group.name} />

      {/* ── Group info ── */}
      <section className="app-card" aria-labelledby="group-info-heading">
        <div className={styles.sectionHeader}>
          <h2 id="group-info-heading" className="app-card-title">Group info</h2>
          {isAdmin && (
            <Link to={`/groups/${groupId}/settings`} className="app-btn-secondary">
              Group settings
            </Link>
          )}
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Join Code</span>
            <span className={`${styles.infoValue} ${styles.joinCode}`}>{group.joinCode}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Members</span>
            <span className={styles.infoValue}>{group.members.length}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Created</span>
            <span className={styles.infoValue}>{new Date(group.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </section>

      {/* ── Members ── */}
      <section className="app-card" aria-labelledby="group-members-heading">
        <h2 id="group-members-heading" className="app-card-title">Members</h2>
        {group.members.length === 0 ? (
          <div className="app-empty">
            <p className="app-muted">No members yet.</p>
          </div>
        ) : (
          <ul className={styles.memberList}>
            {group.members.map((m, i) => {
              const memberId = typeof m.userId === 'object' ? m.userId._id : m.userId;
              const memberName = typeof m.userId === 'object'
                ? (m.userId.name || m.userId.email)
                : null;
              const isMe = memberId === userId;
              return (
                <li key={i} className={styles.memberItem}>
                  <span className={styles.memberName}>
                    {isMe
                      ? `${user.name || user.email} (you)`
                      : (memberName || 'Member')}
                  </span>
                  <span className={`${styles.roleBadge} ${styles[`role${m.role}`]}`}>
                    {m.role}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Events ── */}
      <section className="app-card" aria-labelledby="group-events-heading">
        <div className={styles.sectionHeader}>
          <h2 id="group-events-heading" className="app-card-title">Events</h2>
          {isAdmin && (
            <Link to={`/groups/${groupId}/events/create`} className="app-btn-primary">
              Create event
            </Link>
          )}
        </div>
        {events.length === 0 ? (
          <div className="app-empty">
            <p className="app-muted">
              No events yet.{isAdmin ? ' Create one to get started.' : ''}
            </p>
          </div>
        ) : (
          <ul className={styles.eventList}>
            {events.map((ev) => (
              <li key={ev._id} className={styles.eventItem}>
                <Link to={`/events/${ev._id}`} className={styles.eventLink}>
                  <div>
                    <span className={styles.eventTitle}>{ev.title}</span>
                    {ev.location && (
                      <span className={styles.eventMeta}>{ev.location}</span>
                    )}
                  </div>
                  <span className={styles.eventDate}>
                    {new Date(ev.startAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}