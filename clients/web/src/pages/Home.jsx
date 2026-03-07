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
        setError('Unable to load groups.');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchGroups();
    }
  }, [user]);


    return (
    <div className={`app-page ${styles.page}`}>
      <PageHeader title={`Welcome, ${user?.name?.split(' ')[0] || 'there'}`} />

      <section className="app-card" aria-labelledby="home-groups-heading">
        <div className={styles.sectionHeader}>
          <h2 id="home-groups-heading" className="app-card-title">Your groups</h2>
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
          <div className="app-empty">
            <p className="app-muted">Loading groups...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="app-empty">
            <p className="app-error">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && groups.length === 0 && (
          <div className="app-empty">
            <p className="app-muted">
              Groups you join or create will appear here. Join with a code or create a group to get started.
            </p>
          </div>
        )}

        {/* Groups list */}
        {!loading && !error && groups.length > 0 && (
          <ul className="app-empty">
            {groups.map(group => (
              <li key={group._id} className="app-muted">
                <Link
                  to={`/groups/${group._id}`}
                  className={styles.groupLink}
                >
                  <h3>{group.name}</h3>
                  {group.description && (
                    <p className="app-muted">{group.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="app-card" aria-labelledby="home-events-heading">
        <h2 id="home-events-heading" className="app-card-title">
          Upcoming events
        </h2>

        {events.length === 0 ? (
          <div className="app-empty">
            <p className="app-muted">
              Events from your groups will show up here. Create an event in a group to see it.
            </p>
          </div>
        ) : (
          <ul className="app-empty">
            {events.map(event => (
              <li key={event._id} className="app-muted">
                <Link
                  to={`/events/${event._id}`}
                  className={styles.eventLink}
                >
                  <h3>{event.title}</h3>
                  <p>{new Date(event.startAt).toLocaleString()}</p>
                  
                  {event.groupName && (
                    <p className="app-muted">Group: {event.groupName}</p>
                  )}

                  {event.description && (
                    <p className="app-muted">{event.description}</p>
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