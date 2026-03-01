import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <section className={`app-card ${styles.card}`}>
      <h2 className="app-card-title">Welcome</h2>
      <p className={styles.muted}>
        You're signed in. Events and groups can be wired up here once the backend routes are implemented.
      </p>
      <dl className={styles.profile}>
        <dt>Email</dt>
        <dd>{user?.email}</dd>
        <dt>Name</dt>
        <dd>{user?.name || '—'}</dd>
      </dl>
    </section>
  );
}
