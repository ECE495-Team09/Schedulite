import { Link, useParams } from 'react-router-dom';
import styles from './EventSettings.module.css';

export default function EventSettings() {
  const { eventId } = useParams();

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Event Settings</h1>

      <section className={styles.card}>
        <h2>Schedule</h2>
        <p className={styles.muted}>Recurrence settings (once, daily, weekly, monthly) will go here.</p>
      </section>

      <section className={styles.card}>
        <h2>Details</h2>
        <p className={styles.muted}>Edit event name, location, and description.</p>
      </section>

      <section className={styles.card}>
        <h2>Danger Zone</h2>
        <p className={styles.muted}>Cancel or delete event.</p>
      </section>

      <Link to={`/events/${eventId}`} className={styles.backLink}>← Back to Event</Link>
    </div>
  );
}
