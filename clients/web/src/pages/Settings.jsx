import { useAuth } from '../context/AuthContext';
import styles from './Settings.module.css';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Settings</h1>

      <section className={styles.card}>
        <h2>Profile</h2>
        <dl className={styles.profile}>
          <dt>Name</dt>
          <dd>{user?.name || '—'}</dd>
          <dt>Email</dt>
          <dd>{user?.email || '—'}</dd>
        </dl>
      </section>

      <section className={styles.card}>
        <h2>General</h2>
        <p className={styles.muted}>General settings will go here (notifications, theme, etc.).</p>
      </section>
    </div>
  );
}
