import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuction } from '../../hooks/useAuction';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import BidHistory from './BidHistory';
import TeamBalance from './TeamBalance';
import { formatCurrency, getPlayerRoleIcon } from '../../utils/auctionHelper';
import styles from './AuctionRoom.module.css';

const AuctionRoom = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [tournamentData] = useLocalStorage('tournamentData', null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const {
    auctionData,
    currentPlayer,
    bidHistory,
    timer,
    auctionStatus,
    roomCode,
    currentBid,
    highestBidder,
    initializeAuction,
    startAuction,
    placeBid,
    exportAuctionData,
  } = useAuction();

  // Initialize auction when component mounts
  useEffect(() => {
    if (!tournamentData) {
      navigate('/setup/tournament');
      return;
    }
    
    if (!auctionData && !roomId) {
      // Create a new auction
      const generatedRoomId = initializeAuction(tournamentData);
      navigate(`/auction/${generatedRoomId}`, { replace: true });
    } else if (roomId && !auctionData) {
      // User is joining an existing auction room
      setShowRoomInfo(true);
    }
  }, [tournamentData, auctionData, roomId, navigate, initializeAuction]);

  // Handle confetti display when a team completes their squad
  useEffect(() => {
    if (auctionData && auctionData.teams) {
      const teamCompletedSquad = auctionData.teams.find(team => 
        team.slots.remaining === 0 && team.slots.total > 0
      );
      
      if (teamCompletedSquad) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  }, [auctionData]);

  // Join auction as a team captain
  const handleJoinAsTeam = (teamId) => {
    setSelectedTeam(teamId);
    setShowRoomInfo(false);
  };

  // Handle bidding
  const handleBid = () => {
    if (!selectedTeam) return;
    
    const success = placeBid(selectedTeam);
    if (!success) {
      // Show error if bid failed
      alert('Bid failed. Check your budget and available slots.');
    }
  };

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    return `${seconds}s`;
  };

  // Get player card background color based on their role
  const getPlayerCardColor = (role) => {
    const roleColors = {
      'Batsman': 'linear-gradient(135deg, #ff6b6b, #f03e3e)',
      'Bowler': 'linear-gradient(135deg, #38d9a9, #20c997)',
      'All-Rounder': 'linear-gradient(135deg, #748ffc, #4c6ef5)',
      'Wicket-Keeper': 'linear-gradient(135deg, #fcc419, #f59f00)',
      'Captain': 'linear-gradient(135deg, #9775fa, #7950f2)',
    };
    
    return roleColors[role] || 'linear-gradient(135deg, #adb5bd, #868e96)';
  };

  if (!tournamentData) {
    return (
      <div className={styles.auctionContainer}>
        <h2>No tournament data found.</h2>
        <button 
          className={styles.primaryButton}
          onClick={() => navigate('/setup/tournament')}
        >
          Create Tournament
        </button>
      </div>
    );
  }

  if (showRoomInfo) {
    return (
      <motion.div 
        className={styles.auctionRoomJoin}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.glowingBackground}></div>
        <motion.h2 
          className={styles.joinTitle}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Join Auction Room
        </motion.h2>
        
        <motion.div 
          className={styles.roomInfo}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p>Room Code: <span className={styles.roomCode}>{roomId || roomCode}</span></p>
          <p>Tournament: <span className={styles.tournamentName}>{tournamentData.name}</span></p>
        </motion.div>
        
        <div className={styles.teamSelection}>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Select Your Team
          </motion.h3>
          
          <div className={styles.teamsGrid}>
            {tournamentData.teams.map((team, index) => (
              <motion.div
                key={team.id}
                className={styles.teamSelectionCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 10px 25px rgba(76, 110, 245, 0.5)" 
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleJoinAsTeam(team.id)}
              >
                <div className={styles.teamIcon}>{team.icon}</div>
                <h4>{team.name}</h4>
                <p className={styles.teamBudget}>{formatCurrency(team.budget)}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        <motion.div 
          className={styles.spectatorOption}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button 
            className={styles.secondaryButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowRoomInfo(false)}
          >
            Join as Spectator
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (auctionStatus === 'waiting') {
    return (
      <div className={styles.auctionRoomWaiting}>
        <div className={styles.glowingBackground}></div>
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Auction Room
        </motion.h2>
        
        <motion.div 
          className={styles.roomInfo}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p>Room Code: <span className={styles.roomCode}>{roomCode}</span></p>
          <p>Share this code with team captains to join</p>
        </motion.div>
        
        <motion.div 
          className={styles.waitingActions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            className={styles.primaryButton}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 20px rgba(76, 110, 245, 0.7)" 
            }}
            whileTap={{ scale: 0.95 }}
            onClick={startAuction}
          >
            Start Auction
          </motion.button>
        </motion.div>
        
        <motion.div 
          className={styles.teamList}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Teams</h3>
          <div className={styles.teamsOverview}>
            {auctionData?.teams ? 
              auctionData.teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  className={styles.teamOverviewCard}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className={styles.teamBadge}>
                    <span className={styles.teamIcon}>{team.icon}</span>
                    <h4>{team.name}</h4>
                  </div>
                  <p>Budget: <span className={styles.budgetValue}>{formatCurrency(team.budget)}</span></p>
                  <p>Slots: <span className={styles.slotValue}>{team.slots.total}</span></p>
                </motion.div>
              )) 
              : null
            }
          </div>
        </motion.div>
      </div>
    );
  }

  if (auctionStatus === 'completed') {
    return (
      <div className={styles.auctionRoomCompleted}>
        <div className={styles.glowingBackground}></div>
        <motion.div
          className={styles.completedContent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            Auction Completed! 🏆
          </motion.h2>
          
          <motion.div 
            className={styles.completedActions}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              className={styles.primaryButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportAuctionData}
            >
              Export Auction Results
            </motion.button>
            
            <motion.button
              className={styles.secondaryButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/match/points')}
            >
              Go to Tournament Dashboard
            </motion.button>
          </motion.div>
          
          <motion.div 
            className={styles.auctionSummary}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3>Auction Summary</h3>
            
            <div className={styles.teamsSummary}>
              {auctionData.teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  className={styles.teamSummaryCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <div className={styles.teamHeader}>
                    <h4>{team.name} {team.icon}</h4>
                    <div className={styles.teamStats}>
                      <span>Spent: {formatCurrency(team.budget - team.remainingBudget)}</span>
                      <span>Remaining: {formatCurrency(team.remainingBudget)}</span>
                    </div>
                  </div>
                  
                  <div className={styles.teamPlayers}>
                    <h5>Players</h5>
                    <div className={styles.playerList}>
                      {team.players.map((player, playerIndex) => (
                        <motion.div
                          key={player.id}
                          className={styles.playerItem}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + playerIndex * 0.05 }}
                        >
                          <span className={styles.playerRoleIcon}>{getPlayerRoleIcon(player.role)}</span>
                          <span className={styles.playerName}>{player.name}</span>
                          <span className={styles.playerPrice}>{formatCurrency(player.purchasePrice)}</span>
                        </motion.div>
                      ))}
                      
                      {team.players.length === 0 && (
                        <p className={styles.emptyState}>No players purchased</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.auctionRoomActive}>
      <div className={styles.glowingBackground}></div>
      {showConfetti && (
        <div className={styles.confettiContainer}>
          {Array(50).fill().map((_, i) => (
            <motion.div 
              key={i}
              className={styles.confettiPiece}
              initial={{ 
                top: "-10%", 
                left: `${Math.random() * 100}%`,
                backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
              animate={{ 
                top: "110%", 
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 720}deg)`
              }}
              transition={{ duration: 3 + Math.random() * 2, ease: "easeIn" }}
            />
          ))}
        </div>
      )}
      
      <div className={styles.auctionHeader}>
        <div className={styles.roomInfo}>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Live Auction
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Room: {roomCode}
          </motion.p>
        </div>
        
        <div className={styles.timerContainer}>
          <motion.div 
            className={styles.timer}
            animate={{
              scale: timer <= 5 ? [1, 1.2, 1] : 1,
              boxShadow: timer <= 5 ? [
                "0 0 0 0 rgba(255, 82, 82, 0.7)",
                "0 0 0 20px rgba(255, 82, 82, 0)",
                "0 0 0 0 rgba(255, 82, 82, 0)"
              ] : "0 0 0 0 rgba(76, 110, 245, 0.4)"
            }}
            transition={{
              duration: 1,
              repeat: timer <= 5 ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            {formatTimeRemaining(timer)}
          </motion.div>
        </div>
      </div>
      
      <div className={styles.auctionMain}>
        <div className={styles.playerShowcase}>
          {currentPlayer ? (
            <motion.div 
              className={styles.playerCard}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              style={{
                background: getPlayerCardColor(currentPlayer.role),
              }}
            >
              <motion.div 
                className={styles.playerRoleIcon}
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1.2, 1.2, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                {getPlayerRoleIcon(currentPlayer.role)}
              </motion.div>
              
              <motion.h3 
                className={styles.playerName}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {currentPlayer.name}
              </motion.h3>
              <motion.p 
                className={styles.playerRole}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {currentPlayer.role}
              </motion.p>
              
              <motion.div 
                className={styles.basePrice}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Base Price: {formatCurrency(currentPlayer.basePrice)}
              </motion.div>
              
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentBid}
                  className={styles.currentBid}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                >
                  <span className={styles.bidLabel}>Current Bid:</span>
                  <span className={styles.bidAmount}>{formatCurrency(currentBid)}</span>
                  {highestBidder && (
                    <motion.span 
                      className={styles.highestBidder}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      by {highestBidder.name}
                    </motion.span>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className={styles.noPlayerMessage}>
              Waiting for auction to start...
            </div>
          )}
        </div>
        
        <div className={styles.auctionSidebar}>
          <TeamBalance 
            teams={auctionData.teams}
            currentTeamId={selectedTeam}
          />
          
          <BidHistory bidHistory={bidHistory} />
          
          {selectedTeam && (
            <motion.div 
              className={styles.biddingActions}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                className={styles.bidButton}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 15px rgba(76, 110, 245, 0.7)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBid}
                disabled={highestBidder && highestBidder.id === selectedTeam}
              >
                Place Bid
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
      
      <motion.div 
        className={styles.auctionFooter}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className={styles.auctionProgress}>
          <motion.div 
            className={styles.progressBar}
            initial={{ width: "0%" }}
            animate={{ 
              width: `${(auctionData.soldPlayers.length / (auctionData.soldPlayers.length + auctionData.availablePlayers.length)) * 100}%` 
            }}
            transition={{ duration: 0.8 }}
          />
          <p>
            Players: {auctionData.soldPlayers.length} / {auctionData.soldPlayers.length + auctionData.availablePlayers.length} sold
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuctionRoom;