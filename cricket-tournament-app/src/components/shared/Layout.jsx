import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Header from './Header';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  const location = useLocation();

  const pageVariants = {
    initial: {
      opacity: 0,
      x: -20
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className={styles.layout}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Header />
      <motion.main 
        className={styles.main}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        key={location.pathname}
      >
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </motion.main>
      <motion.footer 
        className={styles.footer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p>Cricket Auction Manager © {new Date().getFullYear()}</p>
        <div className={styles.footerLinks}>
          <a href="/about">About</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
      </motion.footer>
    </motion.div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;