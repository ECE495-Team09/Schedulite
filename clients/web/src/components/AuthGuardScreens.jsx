import { Link } from 'react-router-dom';

/**
 * Accessible UI for route-guard states:
 * - Loading: auth check pending
 * - Unauthorized: user is not signed in
 * - Forbidden: user is signed in but lacks required role/permission
 */

export function LoadingScreen() {
  return (
    <div
      className="auth-guard auth-guard-loading"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <p className="auth-guard-message">Loading…</p>
    </div>
  );
}

export function UnauthorizedScreen() {
  return (
    <main
      className="auth-guard auth-guard-unauthorized"
      id="main-content"
      role="main"
      aria-labelledby="unauthorized-heading"
      aria-describedby="unauthorized-desc"
    >
      <div className="auth-guard-card">
        <h1 id="unauthorized-heading" className="auth-guard-title">
          Sign in required
        </h1>
        <p id="unauthorized-desc" className="auth-guard-desc">
          You need to sign in to access this page.
        </p>
        <Link
          to="/login"
          className="auth-guard-primary-link"
          replace
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}

/**
 * Renders accessible forbidden state (signed in but insufficient permission).
 * Use inside AppShell (no duplicate main); use role="region" so it's valid when nested in main.
 * @param {Object} props
 * @param {string} [props.title] - Heading (default: "Access denied")
 * @param {string} [props.message] - Description (default: "You don't have permission to access this page.")
 * @param {string} [props.backTo] - Path for back link (e.g. "/groups/123")
 * @param {string} [props.backLabel] - Accessible label for back link (e.g. "Back to group")
 */
export function ForbiddenScreen({ title = 'Access denied', message = "You don't have permission to access this page.", backTo, backLabel = 'Go back' }) {
  return (
    <div
      className="auth-guard auth-guard-forbidden"
      role="region"
      aria-labelledby="forbidden-heading"
      aria-describedby="forbidden-desc"
    >
      <div className="auth-guard-card">
        <h1 id="forbidden-heading" className="auth-guard-title">
          {title}
        </h1>
        <p id="forbidden-desc" className="auth-guard-desc">
          {message}
        </p>
        {backTo ? (
          <Link to={backTo} className="auth-guard-primary-link" replace>
            {backLabel}
          </Link>
        ) : (
          <Link to="/home" className="auth-guard-primary-link" replace>
            Back to home
          </Link>
        )}
      </div>
    </div>
  );
}
