import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/auctionHelper';
import './BidHistory.module.css';

const BidHistory = ({ bidHistory = [] }) => {
  const containerVariants = {
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
    visible: { x: 0, opacity: 1 }
  };

  return (
    <div className="bid-history-container">
      <h3 className="bid-history-title">Bid History</h3>
      
      {bidHistory.length === 0 ? (
        <p className="no-bids">No bids yet</p>
      ) : (
        <motion.ul 
          className="bid-history-list"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {bidHistory.slice().reverse().map((bid, index) => (
              <motion.li 
                key={`${bid.teamId}_${bid.timestamp}`}
                className="bid-history-item"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ x: 20, opacity: 0 }}
                layout
              >
                <div className="bid-info">
                  <span className="bid-team">{bid.teamName}</span>
                  <span className="bid-amount">{formatCurrency(bid.amount)}</span>
                </div>
                
                {index === 0 && (
                  <span className="latest-badge">Latest</span>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
};

BidHistory.propTypes = {
  bidHistory: PropTypes.arrayOf(
    PropTypes.shape({
      teamId: PropTypes.string.isRequired,
      teamName: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      timestamp: PropTypes.number.isRequired
    })
  )
};

export default BidHistory;