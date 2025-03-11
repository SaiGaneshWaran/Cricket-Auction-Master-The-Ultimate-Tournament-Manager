import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { clearAppData } from '../../store/localStorage';
import './Header.module.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tournamentData] = useLocalStorage('tournamentData', null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
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
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="logo-container" onClick={closeMenu}>
          <motion.div 
            className="logo"
            whileHover={{ rotate: 10 }}
            whileTap={{ scale: 0.95 }}
          >
            🏏
          </motion.div>
          <h1 className="app-title">
            {tournamentData ? tournamentData.name : 'Cricket Tournament'}
          </h1>
        </Link>
        
        <nav className="desktop-nav">
          {tournamentData ? (
            <ul className="nav-list">
              <li className={location.pathname.includes('/auction') ? 'active' : ''}>
                <Link to="/auction">Auction</Link>
              </li>
              <li className={location.pathname.includes('/match/simulate') ? 'active' : ''}>
                <Link to="/match/simulate">Matches</Link>
              </li>
              <li className={location.pathname.includes('/match/scoreboard') ? 'active' : ''}>
                <Link to="/match/scoreboard">Scoreboard</Link>
              </li>
              <li className={location.pathname.includes('/match/points') ? 'active' : ''}>
                <Link to="/match/points">Points Table</Link>
              </li>
            </ul>
          ) : (
            <ul className="nav-list">
              <li className={location.pathname === '/' ? 'active' : ''}>
                <Link to="/">Setup</Link>
              </li>
            </ul>
          )}
        </nav>
        
        <button 
          className={`mobile-menu-toggle ${menuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="menu-bar"></span>
          <span className="menu-bar"></span>
          <span className="menu-bar"></span>
        </button>
      </div>
      
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="mobile-nav">
              {tournamentData ? (
                <ul className="nav-list">
                  <li>
                    <Link to="/auction" onClick={closeMenu}>Auction</Link>
                  </li>
                  <li>
                    <Link to="/match/simulate" onClick={closeMenu}>Matches</Link>
                  </li>
                  <li>
                    <Link to="/match/scoreboard" onClick={closeMenu}>Scoreboard</Link>
                  </li>
                  <li>
                    <Link to="/match/points" onClick={closeMenu}>Points Table</Link>
                  </li>
                  <li className="reset-option">
                    <button onClick={handleResetTournament}>Reset Tournament</button>
                  </li>
                </ul>
              ) : (
                <ul className="nav-list">
                  <li>
                    <Link to="/" onClick={closeMenu}>Setup</Link>
                  </li>
                </ul>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div 
            className="reset-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="reset-confirm-dialog"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3>Reset Tournament?</h3>
              <p>This will delete all tournament data, including teams, players, auction results, and match history.</p>
              
              <div className="confirm-actions">
                <motion.button
                  className="cancel-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={cancelReset}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  className="confirm-button"
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