import { Link } from 'react-router-dom';
import styles from './CreateGroup.module.css';

export default function CreateGroup() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Create a Group</h1>

      <section className={styles.card}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.label}>
            Group Name
            <input type="text" className={styles.input} placeholder="My Awesome Group" />
          </label>
          <label className={styles.label}>
            Description
            <textarea className={styles.textarea} placeholder="What is this group about?" rows={3} />
          </label>
          <button type="submit" className={styles.submitBtn}>Create Group</button>
        </form>
      </section>

      <Link to="/home" className={styles.backLink}>← Back to Home</Link>
    </div>
  );
}
