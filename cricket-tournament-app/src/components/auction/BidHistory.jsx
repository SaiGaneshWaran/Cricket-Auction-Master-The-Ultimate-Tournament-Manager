import {  AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './BidHistory.module.css';

const BidHistory = ({ bidHistory }) => {
  const [bids, setBids] = useState([]);
  
  useEffect(() => {
    setBids(bidHistory || []);
  }, [bidHistory]);

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className={styles.bidHistory}>
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.title}
      >
        Bid History
      </motion.h3>
      <AnimatePresence mode="wait">
        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className={styles.bidList}
        >
          {bids.map((bid) => (
            <motion.li
              key={bid.timestamp}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={styles.bidItem}
            >
              <span className={styles.teamName}>{bid.teamId}</span>
              <span className={styles.bidAmount}>₹{bid.amount.toLocaleString()}</span>
              <span className={styles.bidTime}>{formatTime(bid.timestamp)}</span>
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
};

// ...existing PropTypes and export...

BidHistory.propTypes = {
  bidHistory: PropTypes.arrayOf(
    PropTypes.shape({
      teamId: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired
    })
  )
};

BidHistory.defaultProps = {
  bidHistory: []
};

export default BidHistory;