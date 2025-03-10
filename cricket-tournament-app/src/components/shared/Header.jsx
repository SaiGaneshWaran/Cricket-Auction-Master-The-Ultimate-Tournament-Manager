
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const tournamentName = JSON.parse(localStorage.getItem('tournamentConfig'))?.name || 'Cricket Tournament';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Setup' },
    { path: '/auction', label: 'Auction' },
    { path: '/matches', label: 'Matches' },
    { path: '/leaderboard', label: 'Leaderboard' }
  ];

  return (
    <motion.header
      className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className={styles.container}>
        <motion.h1 
          className={styles.title}
          whileHover={{ scale: 1.05 }}
        >
          {tournamentName}
        </motion.h1>

        <nav className={styles.nav}>
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`${styles.navLink} ${
                location.pathname === path ? styles.active : ''
              }`}
            >
              <motion.span
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {label}
              </motion.span>
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;