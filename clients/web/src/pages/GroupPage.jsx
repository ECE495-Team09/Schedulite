import { Link, useParams } from 'react-router-dom';
import styles from './GroupPage.module.css';

export default function GroupPage() {
  const { groupId } = useParams();

  // TODO: fetch group data from backend
  const isAdmin = false; // placeholder

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>Group Details</h1>
        {isAdmin && (
          <Link to={`/groups/${groupId}/settings`} className={styles.settingsLink}>
            ⚙ Group Settings
          </Link>
        )}
      </div>

      <section className={styles.card}>
        <h2>Group Info</h2>
        <p className={styles.muted}>Group ID: {groupId}</p>
        <p className={styles.muted}>Group details will be loaded from the backend.</p>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2>Members</h2>
        </div>
        <p className={styles.muted}>Member list will appear here.</p>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2>Events</h2>
          {isAdmin && (
            <Link to={`/groups/${groupId}/events/create`} className={styles.actionBtn}>
              + Create Event
            </Link>
          )}
        </div>
        <p className={styles.muted}>Group events will appear here.</p>
      </section>

      <Link to="/home" className={styles.backLink}>← Back to Home</Link>
    </div>
  );
}
