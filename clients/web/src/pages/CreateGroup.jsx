import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import styles from './CreateGroup.module.css';

export default function CreateGroup() {
  return (
    <div className={`app-page ${styles.page}`}>
      <PageHeader backTo="/home" backLabel="Back to Home" title="Create a group" />

      <section className="app-card" aria-labelledby="create-group-heading">
        <h2 id="create-group-heading" className="app-card-title" style={{ marginBottom: '1rem' }}>New group</h2>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()} aria-labelledby="create-group-heading">
          <div className="app-form-group">
            <label className="app-label" htmlFor="group-name">
              Group name
            </label>
            <input
              id="group-name"
              type="text"
              className="app-input"
              placeholder="My Awesome Group"
              aria-required="true"
            />
          </div>
          <div className="app-form-group">
            <label className="app-label" htmlFor="group-desc">
              Description
            </label>
            <textarea
              id="group-desc"
              className="app-textarea"
              placeholder="What is this group about?"
              rows={3}
            />
          </div>
          <button type="submit" className="app-btn-primary">
            Create group
          </button>
        </form>
      </section>

      <Link to="/home" className="app-back-link">
        ← Back to Home
      </Link>
    </div>
  );
}
