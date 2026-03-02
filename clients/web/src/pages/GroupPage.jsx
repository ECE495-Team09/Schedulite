import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGroups, getEvents } from '../api/client';
import PageHeader from '../components/PageHeader';
import styles from './GroupPage.module.css';
import { useAuth } from '../context/AuthContext';
import { getSingleGroup } from '../api/client';
import { useState, useEffect } from 'react';

export default function GroupPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  
  let isAdmin;
  const [group, setSingleGroup] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroup() {
      try {
        setLoading(true);
        const response = await getSingleGroup(groupId);
        setSingleGroup(response.group || []);
      } catch (err) {
        console.error('Failed to fetch group:', err);
        setError('Unable to load group.');
      } finally {
        setLoading(false);
      }
    }

    if (user && groupId) {
      fetchGroup();
    }
  }, [user]);
  
  if(group[0]){
    if(user._id == group[0].ownerId){
      isAdmin = true;
    } else {
      isAdmin = false;
    }
  } else {
    console.error('Group undefined, ', group);
  }

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
            {group.members.map((m, i) => (
              <li key={i} className={styles.memberItem}>
                <span className={styles.memberName}>
                  {m.userId === user?.id ? `${user.name || user.email} (you)` : `Member`}
                </span>
                <span className={`${styles.roleBadge} ${styles[`role${m.role}`]}`}>
                  {m.role}
                </span>
              </li>
            ))}
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
