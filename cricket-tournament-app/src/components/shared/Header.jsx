import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { clearAppData } from '../../store/localStorage';
import { FiHome, FiDollarSign, FiPlay, FiList, FiAward, FiMenu, FiX, FiSettings } from 'react-icons/fi';
import { GiCricketBat } from 'react-icons/gi';
import styles from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tournamentData] = useLocalStorage('tournamentData', null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Handle scroll event to change header appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Toggle menu open/closed
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  // Close menu
  const closeMenu = () => {
    setMenuOpen(false);
  };
  
  // Handle reset tournament
  const handleResetTournament = () => {
    setShowResetConfirm(true);
  };
  
  // Confirm reset
  const confirmReset = () => {
    clearAppData();
    setShowResetConfirm(false);
    setMenuOpen(false);
    navigate('/');
    window.location.reload(); // Force reload to clear all state
  };
  
  // Cancel reset
  const cancelReset = () => {
    setShowResetConfirm(false);
  };
  
  return (
    <header className={`${styles.appHeader} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.headerContent}>
        <Link to="/" className={styles.logoContainer} onClick={closeMenu}>
          <motion.div 
            className={styles.logo}
            whileHover={{ rotate: 15 }}
            whileTap={{ scale: 0.95 }}
          >
            <GiCricketBat className={styles.logoIcon} />
            <span className={styles.ballAnimation}></span>
          </motion.div>
          <motion.h1 
            className={styles.appTitle}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {tournamentData ? tournamentData.name : 'Cricket Tournament Manager'}
          </motion.h1>
        </Link>
        
        <nav className={styles.desktopNav}>
          {tournamentData ? (
            <motion.ul 
              className={styles.navList}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, staggerChildren: 0.1 }}
            >
              <motion.li 
                className={location.pathname.includes('/auction') ? styles.active : ''}
                whileHover={{ y: -3 }}
              >
                <Link to="/auction">
                  <FiDollarSign /> <span>Auction</span>
                </Link>
              </motion.li>
              <motion.li 
                className={location.pathname.includes('/match/simulate') ? styles.active : ''}
                whileHover={{ y: -3 }}
              >
                <Link to="/match/simulate">
                  <FiPlay /> <span>Matches</span>
                </Link>
              </motion.li>
              <motion.li 
                className={location.pathname.includes('/match/scoreboard') ? styles.active : ''}
                whileHover={{ y: -3 }}
              >
                <Link to="/match/scoreboard">
                  <FiList /> <span>Scoreboard</span>
                </Link>
              </motion.li>
              <motion.li 
                className={location.pathname.includes('/match/points') ? styles.active : ''}
                whileHover={{ y: -3 }}
              >
                <Link to="/match/points">
                  <FiAward /> <span>Points Table</span>
                </Link>
              </motion.li>
              <motion.li 
                whileHover={{ y: -3 }}
                className={styles.resetOption}
              >
                <button onClick={handleResetTournament}>
                  <FiSettings /> <span>Reset</span>
                </button>
              </motion.li>
            </motion.ul>
          ) : (
            <ul className={styles.navList}>
              <motion.li 
                className={location.pathname === '/' ? styles.active : ''}
                whileHover={{ y: -3 }}
              >
                <Link to="/">
                  <FiHome /> <span>Setup</span>
                </Link>
              </motion.li>
            </ul>
          )}
        </nav>
        
        <motion.button 
          className={`${styles.mobileMenuToggle} ${menuOpen ? styles.active : ''}`} 
          onClick={toggleMenu}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </motion.button>
      </div>
      
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className={styles.mobileNav}>
              {tournamentData ? (
                <motion.ul 
                  className={styles.navList}
                  initial="closed"
                  animate="open"
                  variants={{
                    open: { transition: { staggerChildren: 0.1 } },
                    closed: {}
                  }}
                >
                  <motion.li
                    variants={{
                      open: { opacity: 1, y: 0 },
                      closed: { opacity: 0, y: 20 }
                    }}
                  >
                    <Link to="/auction" onClick={closeMenu}>
                      <FiDollarSign /> Auction
                    </Link>
                  </motion.li>
                  <motion.li
                    variants={{
                      open: { opacity: 1, y: 0 },
                      closed: { opacity: 0, y: 20 }
                    }}
                  >
                    <Link to="/match/simulate" onClick={closeMenu}>
                      <FiPlay /> Matches
                    </Link>
                  </motion.li>
                  <motion.li
                    variants={{
                      open: { opacity: 1, y: 0 },
                      closed: { opacity: 0, y: 20 }
                    }}
                  >
                    <Link to="/match/scoreboard" onClick={closeMenu}>
                      <FiList /> Scoreboard
                    </Link>
                  </motion.li>
                  <motion.li
                    variants={{
                      open: { opacity: 1, y: 0 },
                      closed: { opacity: 0, y: 20 }
                    }}
                  >
                    <Link to="/match/points" onClick={closeMenu}>
                      <FiAward /> Points Table
                    </Link>
                  </motion.li>
                  <motion.li 
                    className={styles.resetOption}
                    variants={{
                      open: { opacity: 1, y: 0 },
                      closed: { opacity: 0, y: 20 }
                    }}
                  >
                    <button onClick={handleResetTournament}>
                      <FiSettings /> Reset Tournament
                    </button>
                  </motion.li>
                </motion.ul>
              ) : (
                <ul className={styles.navList}>
                  <motion.li
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Link to="/" onClick={closeMenu}>
                      <FiHome /> Setup
                    </Link>
                  </motion.li>
                </ul>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div 
            className={styles.resetConfirmOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.resetConfirmDialog}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className={styles.resetHeader}>
                <h3>Reset Tournament?</h3>
                <div className={styles.warningIcon}>⚠️</div>
              </div>
              
              <p>This will delete all tournament data, including teams, players, auction results, and match history.</p>
              
              <div className={styles.confirmActions}>
                <motion.button
                  className={styles.cancelButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={cancelReset}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  className={styles.confirmButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmReset}
                >
                  Reset
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;