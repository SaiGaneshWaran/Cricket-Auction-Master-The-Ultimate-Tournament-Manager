import {  motion,AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import BidHistory from './BidHistory';
import TeamBalance from './TeamBalance';
import styles from './AuctionRoom.module.css';

import useLocalStorage from '../../hooks/useLocalStorage';
import { getFromStorage,saveToStorage } from '../../store/localStorage';
import { validateAuctionStatus } from '../../utils/auctionHelper';

const AuctionRoom = () => {
  const [currentPlayer, setCurrentPlayer] = useState({
    name: '',
    basePrice: 0,
    id: null
  });
  const [currentBid, setCurrentBid] = useState(0);
  const [timer, setTimer] = useState(15);
  const [highestBidder, setHighestBidder] = useState(null);
  const [isAuctionActive, setIsAuctionActive] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);

  const [teams] = useLocalStorage('teams', []);
  const [error, setError] = useState(null);
  const [playerQueue, setPlayerQueue] = useState([]);
  const [auctionStats, setAuctionStats] = useState({
    totalPlayers: 0,
    soldPlayers: 0,
    totalAmount: 0
  });

  useEffect(() => {
    const savedQueue = getFromStorage('playerQueue', []);
    setPlayerQueue(savedQueue);
    
    // Load auction stats
    const stats = getFromStorage('auctionStats', {
      totalPlayers: savedQueue.length,
      soldPlayers: 0,
      totalAmount: 0
    });
    setAuctionStats(stats);
  }, []);

  // Existing useEffect for timer
  useEffect(() => {
    let interval;
    if (isAuctionActive && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      handlePlayerSold();
    }
    return () => clearInterval(interval);
  }, [timer, isAuctionActive]);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: { opacity: 0 }
  };

  
  const handleNextPlayer = () => {
    if (playerQueue.length === 0) {
      setError('No more players in queue');
      return;
    }

    const nextPlayer = playerQueue[0];
    const updatedQueue = playerQueue.slice(1);
    
    setPlayerQueue(updatedQueue);
    saveToStorage('playerQueue', updatedQueue);
    
    setCurrentPlayer(nextPlayer);
    setCurrentBid(nextPlayer.basePrice);
    setIsAuctionActive(true);
    setTimer(15);
    setError(null);
  };

  const handleBid = (teamId, bidAmount) => {
    // Validate team status
    const validation = validateAuctionStatus(teamId);
    if (!validation.canBid) {
      setError(validation.message);
      return;
    }

    if (bidAmount > currentBid && isAuctionActive) {
      const team = teams.find(t => t.id === teamId);
      if (bidAmount > team.budget) {
        setError('Bid amount exceeds team budget');
        return;
      }

      setCurrentBid(bidAmount);
      setHighestBidder(teamId);
      setTimer(15);
      setError(null);
      
      setBidHistory(prev => [...prev, {
        teamId,
        teamName: team.name,
        amount: bidAmount,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Existing handlePlayerSold with added stats update
  const handlePlayerSold = () => {
    if (highestBidder) {
      // Existing localStorage updates
      const soldPlayers = JSON.parse(localStorage.getItem('soldPlayers') || '[]');
      soldPlayers.push({
        playerId: currentPlayer.id,
        teamId: highestBidder,
        soldPrice: currentBid,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('soldPlayers', JSON.stringify(soldPlayers));

      // Update team balance
      const teams = JSON.parse(localStorage.getItem('teams') || '[]');
      const updatedTeams = teams.map(team => {
        if (team.id === highestBidder) {
          return {
            ...team,
            budget: team.budget - currentBid,
            players: [...team.players, currentPlayer.id]
          };
        }
        return team;
      });
      localStorage.setItem('teams', JSON.stringify(updatedTeams));

      // Update auction stats
      const updatedStats = {
        ...auctionStats,
        soldPlayers: auctionStats.soldPlayers + 1,
        totalAmount: auctionStats.totalAmount + currentBid
      };
      setAuctionStats(updatedStats);
      saveToStorage('auctionStats', updatedStats);
    }

    setIsAuctionActive(false);
    setBidHistory([]);
    setError(null);
  };

  return (
    <motion.div 
    className={styles.auctionRoom}
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {/* Existing AnimatePresence and player display */}
    {error && (
      <motion.div 
        className={styles.error}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        {error}
      </motion.div>
    )}

    {/* Stats Display */}
    <motion.div className={styles.auctionStats}>
      <div>Players Sold: {auctionStats.soldPlayers}/{auctionStats.totalPlayers}</div>
      <div>Total Amount: ₹{auctionStats.totalAmount.toLocaleString()}</div>
    </motion.div>

    {/* Existing TeamBalance component */}
    <TeamBalance 
      onBid={handleBid} 
      highestBidder={highestBidder}
      currentBid={currentBid}
    />

      <AnimatePresence>
        <motion.div 
          className={styles.bidSection}
          animate={{ 
            scale: timer <= 10 ? [1, 1.1, 1] : 1,
            transition: { duration: 0.5, repeat: timer <= 10 ? Infinity : 0 }
          }}
        >
          <motion.h3
            className={styles.bidAmount}
            animate={{ 
              color: highestBidder ? "#4CAF50" : "#333"
            }}
          >
            Current Bid: ₹{currentBid.toLocaleString()}
          </motion.h3>
          <motion.div
            className={styles.timer}
            animate={{ 
              color: timer <= 5 ? "#ff0000" : "#333",
              scale: timer <= 5 ? [1, 1.2, 1] : 1
            }}
            transition={{ duration: 0.5 }}
          >
            <h4>Time Remaining: {timer}s</h4>
          </motion.div>
          {highestBidder && (
            <motion.p
              className={styles.highestBidder}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              Highest Bidder: Team {highestBidder}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.div 
        className={styles.auctionControls}
        variants={containerVariants}
      >
        <motion.button 
          className={styles.nextPlayerButton}
          onClick={handleNextPlayer}
          disabled={isAuctionActive}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Next Player
        </motion.button>
        <BidHistory bidHistory={bidHistory} />
        <TeamBalance onBid={handleBid} highestBidder={highestBidder} />
      </motion.div>
    </motion.div>
);
};

export default AuctionRoom;