import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Home.module.css';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Welcome, {user?.name || 'there'}!</h1>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Your Groups</h2>
          <div className={styles.actions}>
            <Link to="/groups/join" className={styles.linkBtn}>Join Group</Link>
            <Link to="/groups/create" className={styles.linkBtnPrimary}>Create Group</Link>
          </div>
        </div>
        <div className={styles.placeholder}>
          <p className={styles.muted}>Your groups will appear here.</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Upcoming Events</h2>
        </div>
        <div className={styles.placeholder}>
          <p className={styles.muted}>Your upcoming events will appear here.</p>
        </div>
      </section>
    </div>
  );
}
