import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import styles from './Layout.module.css';

const Layout = () => {
  return (
    <div className={styles.layoutContainer}>
      <div className={styles.pageBackground}></div>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link to="/">Cricket Tournament Manager</Link>
        </div>
        <nav className={styles.navigation}>
          <Link to="/setup/tournament" className={styles.navLink}>Setup</Link>
          <Link to="/auction" className={styles.navLink}>Auction</Link>
          <Link to="/match/simulate" className={styles.navLink}>Matches</Link>
          <Link to="/" className={styles.navLink}>Points Table</Link>
        </nav>
      </header>
      
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Cricket Tournament Manager</p>
      </footer>
    </div>
  );
};

export default Layout;