import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import { getFromStorage } from '../../store/localStorage';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const tournamentName = getFromStorage('tournamentConfig')?.name || 'Cricket Tournament';

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

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  const linkVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
    initial: { opacity: 0, y: -20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 } 
    }
  };

  return (
    <motion.header
      className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.container}>
        <motion.h1 
          className={styles.title}
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {tournamentName}
        </motion.h1>

        <nav className={styles.nav}>
          {navLinks.map(({ path, label }, index) => (
            <motion.div
              key={path}
              variants={linkVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={path}
                className={`${styles.navLink} ${
                  location.pathname === path ? styles.active : ''
                }`}
              >
                <motion.span
                  whileHover="hover"
                  whileTap="tap"
                  variants={linkVariants}
                >
                  {label}
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;