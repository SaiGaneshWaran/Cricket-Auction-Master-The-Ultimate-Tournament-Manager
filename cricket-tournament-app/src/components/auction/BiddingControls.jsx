import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/helpers';
import Button from '../common/Button';
import Card from '../common/Card';

const BiddingControls = ({ 
  currentBid, 
  currentBidder, 
  teamId, 
  teamBalance,
  onPlaceBid, 
  disabled = false 
}) => {
  const [nextBid, setNextBid] = useState(0);
  const [quickBids, setQuickBids] = useState([]);
  const [canBid, setCanBid] = useState(false);
  
  // Calculate next bid and quick bids
  useEffect(() => {
    if (currentBid && teamBalance) {
      // Default next bid is 4% higher than current bid, rounded to 2 decimal places
      const calculatedNextBid = Math.ceil(currentBid * 1.04 * 100) / 100;
      setNextBid(calculatedNextBid);
      
      // Calculate quick bid options (8%, 15%, 25% increments)
      const quickBidOptions = [
        Math.ceil(currentBid * 1.08 * 100) / 100,
        Math.ceil(currentBid * 1.15 * 100) / 100,
        Math.ceil(currentBid * 1.25 * 100) / 100
      ];
      
      setQuickBids(quickBidOptions);
      
      // Check if user can bid (has enough balance)
      setCanBid(calculatedNextBid <= teamBalance.remaining);
    }
  }, [currentBid, teamBalance]);
  
  // Handle place bid
  const handlePlaceBid = (bidAmount = nextBid) => {
    if (bidAmount > teamBalance.remaining) {
      return false; // Not enough balance
    }
    
    onPlaceBid(bidAmount);
  };
  
  // If current bidder is this team, show "highest bidder" message
  if (currentBidder === teamId) {
    return (
      <Card variant="glass" className="p-4 text-center">
        <div className="text-xl font-bold text-green-400 mb-2">You are the highest bidder!</div>
        <p className="text-blue-300">Current bid: {formatCurrency(currentBid)}</p>
      </Card>
    );
  }
  
  return (
    <Card variant="glass" className="p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
        <div>
          <p className="text-sm text-blue-300">Current Bid</p>
          <p className="text-xl font-bold text-white">{formatCurrency(currentBid)}</p>
        </div>
        
        <div className="mt-2 sm:mt-0">
          <p className="text-sm text-blue-300">Your Balance</p>
          <p className="text-xl font-bold text-white">{formatCurrency(teamBalance?.remaining || 0)}</p>
        </div>
      </div>
      
      <div className="flex flex-col space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {/* Normal bid */}
          <Button
            variant="primary"
            size="lg"
            onClick={() => handlePlaceBid()}
            disabled={disabled || !canBid}
            className="col-span-3"
          >
            Bid {formatCurrency(nextBid)}
          </Button>
          
          {/* Quick bids */}
          {quickBids.map((bid, index) => (
            <Button
              key={index}
              variant={index === 0 ? "secondary" : index === 1 ? "tertiary" : "glass"}
              size="md"
              onClick={() => handlePlaceBid(bid)}
              disabled={disabled || bid > teamBalance?.remaining}
            >
              {formatCurrency(bid)}
            </Button>
          ))}
        </div>
        
        <AnimatePresence>
          {(!canBid && teamBalance) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-900 bg-opacity-30 text-red-300 p-3 rounded-lg text-center"
            >
              <p className="text-sm">
                {teamBalance.remaining === 0 
                  ? "You've spent your entire budget!" 
                  : "You don't have enough balance for the next bid!"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default BiddingControls;