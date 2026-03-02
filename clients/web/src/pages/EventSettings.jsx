import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export default function EventSettings() {
  const { eventId } = useParams();

  return (
    <div className="app-page">
      <PageHeader
        backTo={`/events/${eventId}`}
        backLabel="Back to Event"
        context="Event"
        title="Event settings"
      />

      <section className="app-card" aria-labelledby="event-settings-schedule-heading">
        <h2 id="event-settings-schedule-heading" className="app-card-title">Schedule</h2>
        <p className="app-muted">Recurrence settings (once, daily, weekly, monthly) will go here.</p>
      </section>

      <section className="app-card" aria-labelledby="event-settings-details-heading">
        <h2 id="event-settings-details-heading" className="app-card-title">Details</h2>
        <p className="app-muted">Edit event name, location, and description.</p>
      </section>

      <section className="app-card" aria-labelledby="event-settings-danger-heading">
        <h2 id="event-settings-danger-heading" className="app-card-title">Danger zone</h2>
        <p className="app-muted">Cancel or delete event.</p>
      </section>

      <Link to={`/events/${eventId}`} className="app-back-link">
        ← Back to Event
      </Link>
    </div>
  );
}
