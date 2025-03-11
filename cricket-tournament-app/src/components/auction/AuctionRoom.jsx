import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuction } from '../../hooks/useAuction';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import BidHistory from './BidHistory';
import TeamBalance from './TeamBalance';
import { formatCurrency, getPlayerRoleIcon } from '../../utils/auctionHelper';
import './AuctionRoom.module.css';

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
    completePlayerAuction,
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
      <div className="auction-container">
        <h2>No tournament data found.</h2>
        <button 
          className="primary-button"
          onClick={() => navigate('/setup/tournament')}
        >
          Create Tournament
        </button>
      </div>
    );
  }

  if (showRoomInfo) {
    return (
      <div className="auction-room-join">
        <h2>Join Auction Room</h2>
        <div className="room-info">
          <p>Room Code: <span className="room-code">{roomId || roomCode}</span></p>
          <p>Tournament: {tournamentData.name}</p>
        </div>
        
        <div className="team-selection">
          <h3>Select Your Team</h3>
          <div className="teams-grid">
            {tournamentData.teams.map(team => (
              <motion.div
                key={team.id}
                className="team-selection-card"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleJoinAsTeam(team.id)}
              >
                <div className="team-icon">{team.icon}</div>
                <h4>{team.name}</h4>
                <p>Budget: {formatCurrency(team.budget)}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="spectator-option">
          <button 
            className="secondary-button"
            onClick={() => setShowRoomInfo(false)}
          >
            Join as Spectator
          </button>
        </div>
      </div>
    );
  }

  if (auctionStatus === 'waiting') {
    return (
      <div className="auction-room waiting-screen">
        <h2>Auction Room</h2>
        <div className="room-info">
          <p>Room Code: <span className="room-code">{roomCode}</span></p>
          <p>Share this code with team captains to join</p>
        </div>
        
        <div className="waiting-actions">
          <motion.button
            className="primary-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startAuction}
          >
            Start Auction
          </motion.button>
        </div>
        
        <div className="team-list">
          <h3>Teams</h3>
          <div className="teams-overview">
            {auctionData.teams.map(team => (
              <div key={team.id} className="team-overview-card">
                <div className="team-badge">
                  <span className="team-icon">{team.icon}</span>
                  <h4>{team.name}</h4>
                </div>
                <p>Budget: {formatCurrency(team.budget)}</p>
                <p>Slots: {team.slots.total}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (auctionStatus === 'completed') {
    return (
      <div className="auction-room completed-screen">
        <h2>Auction Completed!</h2>
        
        <motion.button
          className="primary-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportAuctionData}
        >
          Export Auction Results
        </motion.button>
        
        <motion.button
          className="secondary-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/match/points')}
        >
          Go to Tournament Dashboard
        </motion.button>
        
        <div className="auction-summary">
          <h3>Auction Summary</h3>
          
          <div className="teams-summary">
            {auctionData.teams.map(team => (
              <div key={team.id} className="team-summary-card">
                <div className="team-header">
                  <h4>{team.name}</h4>
                  <div className="team-stats">
                    <span>Spent: {formatCurrency(team.budget - team.remainingBudget)}</span>
                    <span>Remaining: {formatCurrency(team.remainingBudget)}</span>
                  </div>
                </div>
                
                <div className="team-players">
                  <h5>Players</h5>
                  <div className="player-list">
                    {team.players.map(player => (
                      <div key={player.id} className="player-item">
                        <span>{getPlayerRoleIcon(player.role)}</span>
                        <span>{player.name}</span>
                        <span className="player-price">{formatCurrency(player.purchasePrice)}</span>
                      </div>
                    ))}
                    
                    {team.players.length === 0 && (
                      <p className="empty-state">No players purchased</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auction-room active-auction">
      {showConfetti && (
        <div className="confetti-container">
          {/* Confetti animation would be implemented here */}
          🎉🎊🎉🎊🎉🎊🎉🎊
        </div>
      )}
      
      <div className="auction-header">
        <div className="room-info">
          <h2>Live Auction</h2>
          <p>Room: {roomCode}</p>
        </div>
        
        <div className="timer-container">
          <motion.div 
            className="timer"
            animate={{
              scale: timer <= 5 ? [1, 1.2, 1] : 1
            }}
            transition={{
              duration: 1,
              repeat: timer <= 5 ? Infinity : 0
            }}
          >
            {formatTimeRemaining(timer)}
          </motion.div>
        </div>
      </div>
      
      <div className="auction-main">
        <div className="player-showcase">
          {currentPlayer && (
            <motion.div 
              className="player-card"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                background: getPlayerCardColor(currentPlayer.role),
              }}
            >
              <div className="player-role-icon">
                {getPlayerRoleIcon(currentPlayer.role)}
              </div>
              
              <h3 className="player-name">{currentPlayer.name}</h3>
              <p className="player-role">{currentPlayer.role}</p>
              
              <div className="base-price">
                Base Price: {formatCurrency(currentPlayer.basePrice)}
              </div>
              
              <AnimatePresence>
                <motion.div 
                  key={currentBid}
                  className="current-bid"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                >
                  <span className="bid-label">Current Bid:</span>
                  <span className="bid-amount">{formatCurrency(currentBid)}</span>
                  {highestBidder && (
                    <span className="highest-bidder">by {highestBidder.name}</span>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </div>
        
        <div className="auction-sidebar">
          <TeamBalance 
            teams={auctionData.teams}
            currentTeamId={selectedTeam}
          />
          
          <BidHistory bidHistory={bidHistory} />
          
          {selectedTeam && (
            <div className="bidding-actions">
              <motion.button
                className="bid-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBid}
                disabled={highestBidder && highestBidder.id === selectedTeam}
              >
                Place Bid
              </motion.button>
            </div>
          )}
        </div>
      </div>
      
      <div className="auction-footer">
        <div className="auction-progress">
          <p>
            Players: {auctionData.soldPlayers.length} / {auctionData.soldPlayers.length + auctionData.availablePlayers.length} sold
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuctionRoom;