import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createGroup } from '../api/client';
import styles from './CreateGroup.module.css';

export default function CreateGroup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await createGroup(name.trim());
      navigate(`/groups/${res.group._id}`);
    } catch (err) {
      setError(err.message || 'Failed to create group.');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.header}>
        <Link to="/home" className={styles.backLink}>← Back to Home</Link>
        <h1 className={styles.heading}>Create a Group</h1>
        <p className={styles.subheading}>
          Start a new group and invite members using an auto-generated join
          code.
        </p>
      </div>

      {/* Form card */}
      <section className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Group name */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="groupName">
              Group Name <span className={styles.required}>*</span>
            </label>
            <input
              id="groupName"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CS 490 Project Team"
              maxLength={80}
              required
              autoFocus
            />
            <span className={styles.hint}>
              {name.length}/80 characters
            </span>
          </div>

          {/* Auto-generated fields info */}
          <div className={styles.infoBox}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Join Code</span>
              <span className={styles.infoValue}>Auto-generated</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Owner</span>
              <span className={styles.infoValue}>You (set automatically)</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Initial members</span>
              <span className={styles.infoValue}>Just you, as Owner</span>
            </div>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <div className={styles.formFooter}>
            <Link to="/home" className={styles.cancelBtn}>
              Cancel
            </Link>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !name.trim()}
            >
              {submitting ? 'Creating…' : 'Create Group'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

