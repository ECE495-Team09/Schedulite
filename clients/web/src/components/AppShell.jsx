import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import styles from './AppShell.module.css';

export default function AppShell() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
