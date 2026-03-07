import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGroups, getEvents } from '../api/client';
import PageHeader from '../components/PageHeader';
import styles from './Home.module.css';

export default function Home() {
  const { user } = useAuth();

  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    async function fetchGroups() {
      try {
        setLoading(true);
        const [groupsResponse, eventsResponse] = await Promise.all([
          getGroups(),
          getEvents()
        ]);
        setGroups(groupsResponse.groups || []);
        setEvents(eventsResponse.events || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Unable to load groups and events.');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchGroups();
    }
  }, [user]);


    const firstName = user?.name?.split(' ')[0] || 'there';

    return (
    <div className={`app-page ${styles.page}`}>
      <header className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>Welcome back, {firstName}</h1>
        <p className={styles.welcomeSubtitle}>Here’s an overview of your groups and upcoming events.</p>
      </header>

      <section className={`app-card ${styles.sectionCard}`} aria-labelledby="home-groups-heading">
        <div className={styles.sectionHeader}>
          <h2 id="home-groups-heading" className={styles.sectionTitle}>Your groups</h2>
          <div className={styles.actions}>
            <Link to="/groups/join" className="app-btn-secondary">
              Join group
            </Link>
            <Link to="/groups/create" className="app-btn-primary">
              Create group
            </Link>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Loading…</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className={styles.emptyState}>
            <p className={styles.emptyError}>{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && groups.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              Groups you join or create will appear here. Join with a code or create a group to get started.
            </p>
          </div>
        )}

        {/* Groups list */}
        {!loading && !error && groups.length > 0 && (
          <ul className={styles.list}>
            {groups.map(group => (
              <li key={group._id}>
                <Link
                  to={`/groups/${group._id}`}
                  className={styles.groupLink}
                >
                  <span className={styles.itemTitle}>{group.name}</span>
                  {group.description && (
                    <span className={styles.itemMeta}>{group.description}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`app-card ${styles.sectionCard}`} aria-labelledby="home-events-heading">
        <h2 id="home-events-heading" className={styles.sectionTitle}>
          Upcoming events
        </h2>

        {events.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              Events from your groups will show up here. Create an event in a group to see it.
            </p>
          </div>
        ) : (
          <ul className={styles.list}>
            {events.map(event => (
              <li key={event._id}>
                <Link
                  to={`/events/${event._id}`}
                  className={styles.eventLink}
                >
                  <span className={styles.itemTitle}>{event.title}</span>
                  <span className={styles.itemMeta}>
                    {new Date(event.startAt).toLocaleString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  {(event.groupId?.name ?? event.groupName) && (
                    <span className={styles.itemMeta}>Group: {event.groupId?.name ?? event.groupName}</span>
                  )}
                  {event.description && (
                    <span className={styles.itemMeta}>{event.description}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}