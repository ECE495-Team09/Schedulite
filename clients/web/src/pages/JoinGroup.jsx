import { Link } from 'react-router-dom';
import styles from './JoinGroup.module.css';

export default function JoinGroup() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Join a Group</h1>

      <section className={styles.card}>
        <p className={styles.muted}>Enter a group invite code to join an existing group.</p>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter group code"
          />
          <button type="submit" className={styles.submitBtn}>Join</button>
        </form>
      </section>

      <Link to="/home" className={styles.backLink}>← Back to Home</Link>
    </div>
  );
}
