import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Landing.module.css';

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) return <div className="app-loading">Loading…</div>;
  if (user) return <Navigate to="/home" replace />;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Schedulite</h1>
        <p className={styles.tagline}>
          Effortless group scheduling. Create groups, plan events, and keep everyone in sync.
        </p>
        <Link to="/login" className={styles.cta}>
          Get Started
        </Link>
      </div>
    </div>
  );
}
