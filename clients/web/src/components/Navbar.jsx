import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarColor } from '../utils/avatar';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const avatarSeed = user?.name?.trim() || user?.email || user?.id || '?';
  const avatarLetter = (user?.name || user?.email || '?')[0]?.toUpperCase();

  return (
    <nav className={styles.navbar} aria-label="Main navigation">
      <div className={styles.left}>
        <Link to="/home" className={styles.logo}>
          Schedulite
        </Link>
      </div>

      <div className={styles.right}>
        {user && (
          <div className={styles.userInfo} aria-label={`Signed in as ${user.name || user.email}`}>
            <span
              className={styles.avatarFallback}
              style={getAvatarColor(avatarSeed)}
              aria-hidden
            >
              {avatarLetter}
            </span>
            <span className={styles.userName}>{user.name || user.email}</span>
          </div>
        )}
        <Link
          to="/settings"
          className={`${styles.iconBtn} ${isActive('/settings') ? styles.active : ''}`}
          aria-label="Open settings"
          aria-current={isActive('/settings') ? 'page' : undefined}
        >
          <span aria-hidden="true">⚙</span>
        </Link>
        <button type="button" className={styles.logoutBtn} onClick={logout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
