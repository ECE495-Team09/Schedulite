import { useAuth } from '../context/AuthContext';
import styles from './Home.module.css';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Welcome, {user?.name?.split(' ')[0] || 'there'}</h2>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Your groups</h3>
        <p className={styles.placeholder}>
          Groups you join or create will appear here. Join with a code or create a group to get started.
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Upcoming events</h3>
        <p className={styles.placeholder}>
          Events from your groups will show up here. Create an event in a group to see it.
        </p>
      </section>
    </div>
  );
}
