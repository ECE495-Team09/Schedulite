import { Link } from 'react-router-dom';
import styles from './PageHeader.module.css';

/**
 * Consistent top-of-page header: optional back link, optional context (Group/Event), and page title.
 * Use for every page so layout stays predictable.
 */
export default function PageHeader({ backTo, backLabel, context, title }) {
  const titleId = title ? 'page-title' : undefined;
  return (
    <header className={styles.header} aria-labelledby={titleId}>
      <div className={styles.topRow}>
        {backTo && (
          <Link to={backTo} className={styles.back} aria-label={backLabel || 'Go back'}>
            ← {backLabel || 'Back'}
          </Link>
        )}
        {context && <span className={styles.context}>{context}</span>}
      </div>
      {title && <h1 id={titleId} className={styles.title}>{title}</h1>}
    </header>
  );
}
