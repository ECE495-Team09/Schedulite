import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateMe, deleteMe } from '../api/client';
import styles from './Settings.module.css';

export default function Settings() {
  const { user, setAuth, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleStartEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setSaveMsg(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(user?.name || '');
    setEmail(user?.email || '');
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await updateMe({ name, email });
      const token = localStorage.getItem('schedulite_token');
      setAuth(token, res.user);
      setSaveMsg({ ok: true, text: 'Profile saved successfully.' });
      setIsEditing(false);
    } catch (err) {
      setSaveMsg({ ok: false, text: err.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMe();
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      alert(err.message || 'Failed to delete account.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className={`app-page ${styles.page}`}>
      <PageHeader title="Settings" />

      <section className={`${styles.card} ${isEditing ? styles.editing : ''}`}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Profile</h2>
          {!isEditing && (
            <button type="button" className={styles.editBtn} onClick={handleStartEdit}>
              Edit
            </button>
          )}
        </div>

        <p className={styles.cardDesc}>Manage your profile name and email. Click Edit to change these fields.</p>

        {!isEditing ? (
          <div className={styles.profileView}>
            <div className={styles.avatarBlock}>
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="Avatar" className={styles.avatar} />
              ) : (
                <div className={styles.avatarFallback}>{(user?.name || user?.email || '?')[0]?.toUpperCase()}</div>
              )}
            </div>

            <dl className={styles.profile}>
              <dt>Name</dt>
              <dd>{user?.name || '—'}</dd>
              <dt>Email</dt>
              <dd>{user?.email || '—'}</dd>
            </dl>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSave} onClick={(e) => e.stopPropagation()}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">Name</label>
              <input id="name" type="text" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email</label>
              <input id="email" type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>

            {saveMsg && <p className={saveMsg.ok ? styles.msgSuccess : styles.msgError}>{saveMsg.text}</p>}

            <div className={styles.formFooter}>
              <button type="button" className={styles.ghostBtn} onClick={handleCancelEdit} disabled={saving}>Cancel</button>
              <button type="submit" className={styles.primaryBtn} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        )}
      </section>

      <section className={`${styles.card} ${styles.dangerCard}`}>
        <h2 className={styles.cardTitle}>Danger zone</h2>
        <p className={styles.cardDesc}>Permanently delete your account and all associated data. This action cannot be undone.</p>

        {!confirmDelete ? (
          <button type="button" className={styles.dangerBtn} onClick={() => setConfirmDelete(true)}>Delete my account</button>
        ) : (
          <div className={styles.confirmBox}>
            <p className={styles.confirmText}>Are you absolutely sure? Your account will be deleted immediately.</p>
            <div className={styles.confirmActions}>
              <button type="button" className={styles.dangerBtn} onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Yes, delete my account'}</button>
              <button type="button" className={styles.ghostBtn} onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancel</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

