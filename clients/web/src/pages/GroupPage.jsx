import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import styles from './GroupPage.module.css';

export default function GroupPage() {
  const { groupId } = useParams();
  const isAdmin = false; // placeholder – TODO: fetch from backend

  return (
    <div className={`app-page ${styles.page}`}>
      <PageHeader
        backTo="/home"
        backLabel="Back to Home"
        context="Group"
        title="Group details"
      />

      <section className="app-card" aria-labelledby="group-info-heading">
        <div className={styles.headerRow}>
          <h2 id="group-info-heading" className="app-card-title">Group info</h2>
          {isAdmin && (
            <Link to={`/groups/${groupId}/settings`} className="app-btn-secondary">
              Group settings
            </Link>
          )}
        </div>
        <p className="app-muted">Group ID: {groupId}</p>
        <p className="app-muted" style={{ marginTop: '0.25rem' }}>
          Group details will be loaded from the backend.
        </p>
      </section>

      <section className="app-card" aria-labelledby="group-members-heading">
        <div className={styles.sectionHeader}>
          <h2 id="group-members-heading" className="app-card-title">Members</h2>
        </div>
        <div className="app-empty">
          <p className="app-muted">Member list will appear here.</p>
        </div>
      </section>

      <section className="app-card" aria-labelledby="group-events-heading">
        <div className={styles.sectionHeader}>
          <h2 id="group-events-heading" className="app-card-title">Events</h2>
          {isAdmin && (
            <Link to={`/groups/${groupId}/events/create`} className="app-btn-primary">
              Create event
            </Link>
          )}
        </div>
        <div className="app-empty">
          <p className="app-muted">Group events will appear here.</p>
        </div>
      </section>

      <Link to="/home" className="app-back-link">
        ← Back to Home
      </Link>
    </div>
  );
}
