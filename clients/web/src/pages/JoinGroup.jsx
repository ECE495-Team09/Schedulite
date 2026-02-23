import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import styles from './JoinGroup.module.css';

export default function JoinGroup() {
  return (
    <div className={`app-page ${styles.page}`}>
      <PageHeader backTo="/home" backLabel="Back to Home" title="Join a group" />

      <section className="app-card" aria-labelledby="join-group-heading">
        <h2 id="join-group-heading" className="app-card-title" style={{ marginBottom: '0.5rem' }}>Join a group</h2>
        <p className="app-muted" style={{ marginBottom: '1rem' }}>
          Enter a group invite code to join an existing group.
        </p>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()} aria-labelledby="join-group-heading">
          <label className="app-label" htmlFor="join-code">
            Group code
          </label>
          <input
            id="join-code"
            type="text"
            className="app-input"
            placeholder="Enter group code"
            autoComplete="off"
            aria-required="true"
          />
          <button type="submit" className="app-btn-primary" style={{ marginTop: '1rem' }}>
            Join
          </button>
        </form>
      </section>

      <Link to="/home" className="app-back-link">
        ← Back to Home
      </Link>
    </div>
  );
}
