import { Link, useParams } from 'react-router-dom';
import styles from './CreateEvent.module.css';

export default function CreateEvent() {
  const { groupId } = useParams();

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Create Event</h1>

      <section className={styles.card}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.label}>
            Event Name
            <input type="text" className={styles.input} placeholder="Team Meeting" />
          </label>
          <label className={styles.label}>
            Location
            <input type="text" className={styles.input} placeholder="Room 101 / Zoom link" />
          </label>
          <label className={styles.label}>
            Details
            <textarea className={styles.textarea} placeholder="Describe the event..." rows={3} />
          </label>
          <label className={styles.label}>
            Schedule
            <select className={styles.select}>
              <option value="once">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <button type="submit" className={styles.submitBtn}>Create Event</button>
        </form>
      </section>

      <Link to={groupId ? `/groups/${groupId}` : '/home'} className={styles.backLink}>
        ← Back to {groupId ? 'Group' : 'Home'}
      </Link>
    </div>
  );
}
