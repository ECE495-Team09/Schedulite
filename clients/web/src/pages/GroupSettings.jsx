import { Link, useParams } from 'react-router-dom';
import styles from './GroupSettings.module.css';

export default function GroupSettings() {
  const { groupId } = useParams();

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Group Settings</h1>

      <section className={styles.card}>
        <h2>General</h2>
        <p className={styles.muted}>Privacy, roles, and group size settings will go here.</p>
      </section>

      <section className={styles.card}>
        <h2>Event Settings</h2>
        <p className={styles.muted}>Admin event configuration will go here.</p>
      </section>

      <section className={styles.card}>
        <h2>Danger Zone</h2>
        <p className={styles.muted}>Delete group, transfer ownership, etc.</p>
      </section>

      <Link to={`/groups/${groupId}`} className={styles.backLink}>← Back to Group</Link>
    </div>
  );
}
