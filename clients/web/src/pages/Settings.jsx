import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import styles from './Settings.module.css';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className={`app-page ${styles.page}`}>
      <PageHeader title="Settings" />

      <section className="app-card" aria-labelledby="settings-profile-heading">
        <h2 id="settings-profile-heading" className="app-card-title">Profile</h2>
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
          <dl>
            <dt>Name</dt>
            <dd>{user?.name || '—'}</dd>
            <dt>Email</dt>
            <dd>{user?.email || '—'}</dd>
          </dl>
        </div>
      </section>

      <section className="app-card" aria-labelledby="settings-general-heading">
        <h2 id="settings-general-heading" className="app-card-title">General</h2>
        <p className="app-muted">General settings will go here (notifications, theme, etc.).</p>
      </section>
    </div>
  );
}
