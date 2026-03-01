import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Landing.module.css';

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) return <div className="app-loading">Loading…</div>;
  if (user) return <Navigate to="/home" replace />;

  return (
    <main id="main-content" className={styles.page} tabIndex={-1}>
      <div className={styles.hero} role="region" aria-labelledby="landing-title">
        <h1 id="landing-title" className={styles.title}>Schedulite</h1>
        <p className={styles.tagline}>
          Effortless group scheduling. Create groups, plan events, and keep everyone in sync.
        </p>
        <Link to="/login" className={styles.cta} aria-label="Get started with Schedulite">
          Get Started
        </Link>
      </div>
    </main>
  );
}
