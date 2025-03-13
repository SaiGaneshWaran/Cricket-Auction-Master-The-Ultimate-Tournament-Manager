import React from 'react';
import { motion } from 'framer-motion';
import styles from './BidHistory.module.css';

const BidHistory = ({ bidHistory }) => {
  return (
    <div className={styles.bidHistoryContainer}>
      <h3>Bid History</h3>
      
      {bidHistory.length === 0 ? (
        <div className={styles.noBids}>No bids placed yet</div>
      ) : (
        <ul className={styles.bidList}>
          {bidHistory.slice().reverse().map((bid, index) => (
            <motion.li 
              key={index}
              className={styles.bidItem}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className={styles.bidInfo}>
                <span className={styles.bidTeamName}>{bid.team.name}</span>
                <span className={styles.bidAmount}>₹{bid.amount.toLocaleString()}</span>
              </div>
              <div className={styles.bidTimestamp}>
                {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </motion.li>
          ))}
        </ul>
      )}
      
      {bidHistory.length > 0 && (
        <div className={styles.bidStats}>
          <div className={styles.statItem}>
            <span>Highest Bid:</span>
            <span className={styles.statValue}>
              ₹{Math.max(...bidHistory.map(bid => bid.amount)).toLocaleString()}
            </span>
          </div>
          <div className={styles.statItem}>
            <span>Total Bids:</span>
            <span className={styles.statValue}>{bidHistory.length}</span>
          </div>
          <div className={styles.statItem}>
            <span>Most Active:</span>
            <span className={styles.statValue}>
              {getActiveBidder(bidHistory)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get most active bidder
const getActiveBidder = (bidHistory) => {
  if (!bidHistory.length) return 'None';
  
  const bidCounts = {};
  bidHistory.forEach(bid => {
    const teamName = bid.team.name;
    bidCounts[teamName] = (bidCounts[teamName] || 0) + 1;
  });
  
  let maxCount = 0;
  let activeTeam = 'None';
  
  Object.entries(bidCounts).forEach(([team, count]) => {
    if (count > maxCount) {
      maxCount = count;
      activeTeam = team;
    }
  });
  
  return activeTeam;
};

export default BidHistory;