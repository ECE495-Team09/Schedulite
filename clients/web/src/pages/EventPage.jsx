import { Link, useParams } from 'react-router-dom';
import styles from './EventPage.module.css';

export default function EventPage() {
  const { eventId } = useParams();

  // TODO: fetch event data from backend
  const isAdmin = false; // placeholder

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>Event Details</h1>
        {isAdmin && (
          <Link to={`/events/${eventId}/settings`} className={styles.settingsLink}>
            ⚙ Event Settings
          </Link>
        )}
      </div>

      <section className={styles.card}>
        <h2>Event Info</h2>
        <p className={styles.muted}>Event ID: {eventId}</p>
        <p className={styles.muted}>Event details will be loaded from the backend.</p>
      </section>

      <section className={styles.card}>
        <h2>Location</h2>
        <p className={styles.muted}>Location info will appear here.</p>
      </section>

      <section className={styles.card}>
        <h2>Attendees</h2>
        <p className={styles.muted}>Attendee list will appear here.</p>
      </section>

      <Link to="/home" className={styles.backLink}>← Back to Home</Link>
    </div>
  );
}
