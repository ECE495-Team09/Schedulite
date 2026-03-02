import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle } from '../api/client';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { user, setAuth } = useAuth();

  useEffect(() => {
    if (user) navigate('/home', { replace: true });
  }, [user, navigate]);

  const handleGoogleSuccess = async ({ credential }) => {
    try {
      const res = await loginWithGoogle(credential);
      setAuth(res.token, res.user);
      navigate('/home', { replace: true });
    } catch (err) {
      console.error('Login failed:', err);
      alert(err.message || 'Login failed');
    }
  };

  return (
    <main id="main-content" className={styles.page} tabIndex={-1}>
      <div className={styles.card} role="region" aria-labelledby="login-title" aria-describedby="login-desc">
        <h1 id="login-title" className={styles.title}>Schedulite</h1>
        <p id="login-desc" className={styles.subtitle}>Sign in to manage your schedule</p>
        <div className={styles.googleWrapper}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert('Google sign-in was cancelled or failed')}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="280"
        />
        </div>
      </div>
    </main>
  );
}
