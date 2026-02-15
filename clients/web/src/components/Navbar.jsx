import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <Link to="/home" className={styles.logo}>
          Schedulite
        </Link>
        <Link
          to="/home"
          className={`${styles.navLink} ${isActive('/home') ? styles.active : ''}`}
        >
          Home
        </Link>
      </div>

      <div className={styles.right}>
        {user && (
          <div className={styles.userInfo}>
            {user.photoUrl && (
              <img
                src={user.photoUrl}
                alt=""
                className={styles.avatar}
                width={28}
                height={28}
              />
            )}
            <span className={styles.userName}>{user.name || user.email}</span>
          </div>
        )}
        <Link
          to="/settings"
          className={`${styles.iconBtn} ${isActive('/settings') ? styles.active : ''}`}
          title="Settings"
        >
          ⚙
        </Link>
        <button type="button" className={styles.logoutBtn} onClick={logout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
