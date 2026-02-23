import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export default function GroupSettings() {
  const { groupId } = useParams();

  return (
    <div className="app-page">
      <PageHeader
        backTo={`/groups/${groupId}`}
        backLabel="Back to Group"
        context="Group"
        title="Group settings"
      />

      <section className="app-card" aria-labelledby="group-settings-general-heading">
        <h2 id="group-settings-general-heading" className="app-card-title">General</h2>
        <p className="app-muted">Privacy, roles, and group size settings will go here.</p>
      </section>

      <section className="app-card" aria-labelledby="group-settings-events-heading">
        <h2 id="group-settings-events-heading" className="app-card-title">Event settings</h2>
        <p className="app-muted">Admin event configuration will go here.</p>
      </section>

      <section className="app-card" aria-labelledby="group-settings-danger-heading">
        <h2 id="group-settings-danger-heading" className="app-card-title">Danger zone</h2>
        <p className="app-muted">Delete group, transfer ownership, etc.</p>
      </section>

      <Link to={`/groups/${groupId}`} className="app-back-link">
        ← Back to Group
      </Link>
    </div>
  );
}
