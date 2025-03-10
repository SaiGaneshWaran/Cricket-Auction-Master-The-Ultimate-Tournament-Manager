import {  AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
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

  return (
    <div className={styles.layout}>
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
      <footer className={styles.footer}>
        <p>Cricket Auction Manager © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Layout;