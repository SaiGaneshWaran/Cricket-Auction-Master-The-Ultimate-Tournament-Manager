import {  motion,AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './BidHistory.module.css';


const BidHistory = ({ bidHistory, teams }) => {
  const [bids, setBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    setBids(bidHistory || []);
    setFilteredBids(bidHistory || []);
  }, [bidHistory]);

  // Existing animation variants
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

  const getTeamName = (teamId) => {
    const team = teams?.find(t => t.id === teamId);
    return team ? team.name : teamId;
  };

  const handleFilterChange = (filterType) => {
    setFilter(filterType);
    if (filterType === 'all') {
      setFilteredBids(bids);
    } else if (filterType === 'highest') {
      const sorted = [...bids].sort((a, b) => b.amount - a.amount);
      setFilteredBids(sorted.slice(0, 5));
    } else if (filterType === 'recent') {
      const sorted = [...bids].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      setFilteredBids(sorted.slice(0, 5));
    }
  };

  const getBidTrend = (bid, index) => {
    if (index === 0) return null;
    const previousBid = filteredBids[index - 1];
    return bid.amount > previousBid.amount ? 'increase' : 'decrease';
  };

  return (
    <div className={styles.bidHistory}>
      <motion.div className={styles.header}>
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={styles.title}
        >
          Bid History
        </motion.h3>
        <motion.div className={styles.filters}>
          <button 
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'highest' ? styles.active : ''}`}
            onClick={() => handleFilterChange('highest')}
          >
            Highest
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'recent' ? styles.active : ''}`}
            onClick={() => handleFilterChange('recent')}
          >
            Recent
          </button>
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className={styles.bidList}
        >
          {filteredBids.map((bid, index) => (
            <motion.li
              key={bid.timestamp}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`${styles.bidItem} ${styles[getBidTrend(bid, index)]}`}
            >
              <span className={styles.teamName}>{getTeamName(bid.teamId)}</span>
              <span className={styles.bidAmount}>
                ₹{bid.amount.toLocaleString()}
                {getBidTrend(bid, index) && (
                  <motion.span 
                    className={styles.trend}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {getBidTrend(bid, index) === 'increase' ? '↑' : '↓'}
                  </motion.span>
                )}
              </span>
              <span className={styles.bidTime}>{formatTime(bid.timestamp)}</span>
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
};

BidHistory.propTypes = {
  bidHistory: PropTypes.arrayOf(
    PropTypes.shape({
      teamId: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired
    })
  ),
  teams: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  )
};

BidHistory.defaultProps = {
  bidHistory: [],
  teams: []
};

export default BidHistory;