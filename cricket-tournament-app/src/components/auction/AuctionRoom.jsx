import {  AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import BidHistory from './BidHistory';
import TeamBalance from './TeamBalance';
import styles from './AuctionRoom.module.css';

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

  const playerCardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300 }
    },
    exit: { 
      y: -50, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };
  const handleNextPlayer = () => {
    // Simulate fetching next player from queue
    const nextPlayer = {
      name: 'Test Player',
      basePrice: 1000000,
      id: Date.now()
    };
    setCurrentPlayer(nextPlayer);
    setCurrentBid(nextPlayer.basePrice);
    setIsAuctionActive(true);
    setTimer(15);
  };

  const handleBid = (teamId, bidAmount) => {
    if (bidAmount > currentBid && isAuctionActive) {
      setCurrentBid(bidAmount);
      setHighestBidder(teamId);
      setTimer(15);
      
      // Add to bid history
      setBidHistory(prev => [...prev, {
        teamId,
        amount: bidAmount,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handlePlayerSold = () => {
    if (highestBidder) {
      // Save to localStorage
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
    }

    setIsAuctionActive(false);
    setBidHistory([]);
  };

  return (
    <motion.div 
      className={styles.auctionRoom}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="wait">
        {currentPlayer.id && (
          <motion.div 
            className={styles.currentPlayer}
            key={currentPlayer.id}
            variants={playerCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h2>{currentPlayer.name}</h2>
            <p>Base Price: ₹{currentPlayer.basePrice.toLocaleString()}</p>
          </motion.div>
        )}
      </AnimatePresence>
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