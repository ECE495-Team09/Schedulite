import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import styles from './CreateEvent.module.css';

export default function CreateEvent() {
  const { groupId } = useParams();
  const backTo = groupId ? `/groups/${groupId}` : '/home';
  const backLabel = groupId ? 'Back to Group' : 'Back to Home';

  return (
    <div className={`app-page ${styles.page}`}>
      <PageHeader
        backTo={backTo}
        backLabel={backLabel}
        context="Event"
        title="Create event"
      />

      <section className="app-card" aria-labelledby="create-event-heading">
        <h2 id="create-event-heading" className="app-card-title" style={{ marginBottom: '1rem' }}>New event</h2>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()} aria-labelledby="create-event-heading">
          <div className="app-form-group">
            <label className="app-label" htmlFor="event-name">
              Event name
            </label>
            <input
              id="event-name"
              type="text"
              className="app-input"
              placeholder="Team Meeting"
              aria-required="true"
            />
          </div>
          <div className="app-form-group">
            <label className="app-label" htmlFor="event-location">
              Location
            </label>
            <input
              id="event-location"
              type="text"
              className="app-input"
              placeholder="Room 101 / Zoom link"
            />
          </div>
          <div className="app-form-group">
            <label className="app-label" htmlFor="event-details">
              Details
            </label>
            <textarea
              id="event-details"
              className="app-textarea"
              placeholder="Describe the event..."
              rows={3}
            />
          </div>
          <div className="app-form-group">
            <label className="app-label" htmlFor="event-schedule">
              Schedule
            </label>
            <select id="event-schedule" className="app-select">
              <option value="once">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button type="submit" className="app-btn-primary">
            Create event
          </button>
        </form>
      </section>

      <Link to={backTo} className="app-back-link">
        ← {backLabel}
      </Link>
    </div>
  );
}
