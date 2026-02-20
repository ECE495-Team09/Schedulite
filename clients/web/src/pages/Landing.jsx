import { Link } from 'react-router-dom';
import styles from './Landing.module.css';

export default function Landing() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Schedulite</h1>
        <p className={styles.tagline}>
          Schedule with your groups. Create events, share invites, stay in sync.
        </p>
        <Link to="/login" className={styles.cta}>
          Get started
        </Link>
      </div>
    </div>
  );
}
