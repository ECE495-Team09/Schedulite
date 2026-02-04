import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AppShell.module.css';

export default function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          Schedulite
        </Link>
        <div className={styles.userRow}>
          {user?.photoUrl && (
            <img
              src={user.photoUrl}
              alt=""
              className={styles.avatar}
              width={32}
              height={32}
            />
          )}
          <span className={styles.name}>{user?.name || user?.email}</span>
          <button type="button" className={styles.logoutBtn} onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
