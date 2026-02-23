import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import styles from './EventPage.module.css';

export default function EventPage() {
  const { eventId } = useParams();
  const isAdmin = false; // placeholder – TODO: fetch from backend

  return (
    <div className={`app-page ${styles.page}`}>
      <PageHeader
        backTo="/home"
        backLabel="Back to Home"
        context="Event"
        title="Event details"
      />

      <section className="app-card" aria-labelledby="event-info-heading">
        <div className={styles.headerRow}>
          <h2 id="event-info-heading" className="app-card-title">Event info</h2>
          {isAdmin && (
            <Link to={`/events/${eventId}/settings`} className="app-btn-secondary">
              Event settings
            </Link>
          )}
        </div>
        <p className="app-muted">Event ID: {eventId}</p>
        <p className="app-muted" style={{ marginTop: '0.25rem' }}>
          Event details will be loaded from the backend.
        </p>
      </section>

      <section className="app-card" aria-labelledby="event-location-heading">
        <h2 id="event-location-heading" className="app-card-title">Location</h2>
        <div className="app-empty">
          <p className="app-muted">Location info will appear here.</p>
        </div>
      </section>

      <section className="app-card" aria-labelledby="event-attendees-heading">
        <h2 className="app-card-title" id="event-attendees-heading">Attendees</h2>
        <div className="app-empty">
          <p className="app-muted">Attendee list will appear here.</p>
        </div>
      </section>

      <Link to="/home" className="app-back-link">
        ← Back to Home
      </Link>
    </div>
  );
}
