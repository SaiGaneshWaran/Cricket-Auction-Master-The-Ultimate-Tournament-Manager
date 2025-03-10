import { useState, useEffect, useCallback } from 'react';
import { getFromStorage} from '../store/localStorage';
import { validateBid, updateTeamAfterBid, recordAuctionTransaction } from '../utils/auctionHelper';

const useAuction = (initialPlayer = null) => {
  const [currentPlayer, setCurrentPlayer] = useState(initialPlayer);
  const [currentBid, setCurrentBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [timer, setTimer] = useState(30);
  const [isAuctionActive, setIsAuctionActive] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [error, setError] = useState(null);

  // Reset auction state for new player
  const startNewAuction = useCallback((player) => {
    setCurrentPlayer(player);
    setCurrentBid(player.basePrice);
    setHighestBidder(null);
    setTimer(30);
    setIsAuctionActive(true);
    setBidHistory([]);
    setError(null);
  }, []);

  // Handle bid submission
  const placeBid = useCallback((teamId, amount) => {
    if (!isAuctionActive) {
      setError('Auction is not active');
      return false;
    }

    const team = getFromStorage('teams', []).find(t => t.id === teamId);
    const bidValidation = validateBid(amount, team, currentBid);

    if (!bidValidation.isValid) {
      setError(bidValidation.message);
      return false;
    }

    setCurrentBid(amount);
    setHighestBidder(teamId);
    setTimer(30); // Reset timer on successful bid

    setBidHistory(prev => [...prev, {
      teamId,
      amount,
      timestamp: new Date().toISOString()
    }]);

    return true;
  }, [currentBid, isAuctionActive]);

  // Handle player sold
  const finishAuction = useCallback(() => {
    if (highestBidder) {
      const team = getFromStorage('teams', []).find(t => t.id === highestBidder);
      
      updateTeamAfterBid(highestBidder, currentBid);
      recordAuctionTransaction(currentPlayer, team, currentBid);
      
      setIsAuctionActive(false);
      return {
        success: true,
        player: currentPlayer,
        soldTo: team,
        amount: currentBid
      };
    }
    return { success: false };
  }, [currentPlayer, highestBidder, currentBid]);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (isAuctionActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      finishAuction();
    }
    return () => clearInterval(interval);
  }, [timer, isAuctionActive, finishAuction]);

  return {
    currentPlayer,
    currentBid,
    highestBidder,
    timer,
    isAuctionActive,
    bidHistory,
    error,
    startNewAuction,
    placeBid,
    finishAuction
  };
};

export default useAuction;