import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { joinGroup } from '../api/client';
import styles from './JoinGroup.module.css';

export default function JoinGroup() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await joinGroup(trimmed);
      navigate(`/groups/${res.group._id}`);
    } catch (err) {
      setError(err.message || 'Failed to join group.');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.header}>
        <Link to="/home" className={styles.backLink}>← Back to Home</Link>
        <h1 className={styles.heading}>Join a Group</h1>
        <p className={styles.subheading}>
          Enter the 6-character join code shared by a group owner or admin.
        </p>
      </div>

      {/* Form card */}
      <section className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="joinCode">
              Join Code
            </label>
            <input
              id="joinCode"
              type="text"
              className={styles.input}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. AB12CD"
              maxLength={8}
              autoComplete="off"
              spellCheck={false}
              autoFocus
              required
            />
            <span className={styles.hint}>
              Join codes are case-insensitive and auto-uppercased.
            </span>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <div className={styles.formFooter}>
            <Link to="/home" className={styles.cancelBtn}>
              Cancel
            </Link>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !code.trim()}
            >
              {submitting ? 'Joining…' : 'Join Group'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
