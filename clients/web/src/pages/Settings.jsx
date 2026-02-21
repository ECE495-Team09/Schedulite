import { useAuth } from '../context/AuthContext';
import styles from './Settings.module.css';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Settings</h2>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Profile</h3>
        <div className={styles.profile}>
          {user?.photoUrl && (
            <img
              src={user.photoUrl}
              alt=""
              className={styles.avatar}
              width={64}
              height={64}
            />
          )}
          <dl className={styles.dl}>
            <dt>Name</dt>
            <dd>{user?.name || '—'}</dd>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </dl>
        </div>
      </section>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>General settings</h3>
        <p className={styles.placeholder}>
          App preferences and notifications (coming soon).
        </p>
      </section>
    </div>
  );
}
