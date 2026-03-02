import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGroups } from '../api/client';
import PageHeader from '../components/PageHeader';
import styles from './GroupSettings.module.css';

export default function GroupSettings() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editable fields
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  // Danger zone
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getGroups();
        if (cancelled) return;
        const found = res.groups.find((g) => g._id === groupId);
        if (!found) {
          setError('Group not found.');
          return;
        }
        setGroup(found);
        setName(found.name);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load group');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [groupId]);

  if (loading) return <div className="app-loading">Loading…</div>;

  if (error) {
    return (
      <div className="app-page">
        <PageHeader backTo={`/groups/${groupId}`} backLabel="Back to Group" title="Group Settings" />
        <section className="app-card">
          <p className="app-muted">{error}</p>
        </section>
      </div>
    );
  }

  const myMember = group.members.find((m) => m.userId === user?.id);
  const isOwner = myMember?.role === 'OWNER';
  const isAdmin = myMember && (myMember.role === 'OWNER' || myMember.role === 'ADMIN');

  if (!isAdmin) {
    return (
      <div className="app-page">
        <PageHeader backTo={`/groups/${groupId}`} backLabel="Back to Group" title="Group Settings" />
        <section className="app-card">
          <p className="app-muted">You do not have permission to access group settings.</p>
        </section>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      // TODO: Needs a PUT /groups/:id backend route to save changes
      setSaveMsg({ ok: false, text: 'Update group route not yet implemented on the backend.' });
    } catch (err) {
      setSaveMsg({ ok: false, text: err.message || 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // TODO: Needs a DELETE /groups/:id backend route
      alert('Delete group route not yet implemented on the backend.');
      setDeleting(false);
      setConfirmDelete(false);
    } catch (err) {
      alert(err.message || 'Failed to delete group.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className={`app-page ${styles.page}`}>
      <PageHeader
        backTo={`/groups/${groupId}`}
        backLabel="Back to Group"
        context="Group"
        title="Group settings"
      />

      {/* ── General ── */}
      <section className="app-card" aria-labelledby="gs-general">
        <h2 id="gs-general" className="app-card-title">General</h2>
        <form className={styles.form} onSubmit={handleSave}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="groupName">Group Name</label>
            <input
              id="groupName"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
            />
            <span className={styles.hint}>{name.length}/80 characters</span>
          </div>

          <div className={styles.readonlyField}>
            <span className={styles.label}>Join Code</span>
            <span className={styles.codeValue}>{group.joinCode}</span>
          </div>

          <div className={styles.readonlyField}>
            <span className={styles.label}>Owner</span>
            <span className={styles.readonlyValue}>
              {group.ownerId === user?.id ? `${user.name || user.email} (you)` : 'Another member'}
            </span>
          </div>

          <div className={styles.readonlyField}>
            <span className={styles.label}>Created</span>
            <span className={styles.readonlyValue}>
              {new Date(group.createdAt).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
          </div>

          {saveMsg && (
            <p className={saveMsg.ok ? styles.msgSuccess : styles.msgError}>{saveMsg.text}</p>
          )}

          <div className={styles.formFooter}>
            <button type="submit" className="app-btn-primary" disabled={saving || name === group.name}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      {/* ── Members ── */}
      <section className="app-card" aria-labelledby="gs-members">
        <h2 id="gs-members" className="app-card-title">Members ({group.members.length})</h2>
        <ul className={styles.memberList}>
          {group.members.map((m, i) => (
            <li key={i} className={styles.memberItem}>
              <span className={styles.memberName}>
                {m.userId === user?.id ? `${user.name || user.email} (you)` : `Member`}
              </span>
              <span className={`${styles.roleBadge} ${styles[`role${m.role}`]}`}>
                {m.role}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Danger zone ── */}
      {isOwner && (
        <section className={`app-card ${styles.dangerCard}`} aria-labelledby="gs-danger">
          <h2 id="gs-danger" className="app-card-title">Danger zone</h2>
          <p className={styles.dangerDesc}>
            Permanently delete this group and all associated events. This cannot be undone.
          </p>

          {!confirmDelete ? (
            <button
              type="button"
              className={styles.dangerBtn}
              onClick={() => setConfirmDelete(true)}
            >
              Delete group
            </button>
          ) : (
            <div className={styles.confirmBox}>
              <p className={styles.confirmText}>
                Are you absolutely sure? This will delete the group, all members, and events.
              </p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
