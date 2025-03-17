import { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useTournament } from './TournamentContext';
import { generateUniqueId } from '../utils/helpers';

// Create context
const AuctionContext = createContext();

export const useAuction = () => useContext(AuctionContext);

export const AuctionProvider = ({ children }) => {
  const { currentTournament } = useTournament();
  const [currentAuction, setCurrentAuction] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [currentBidder, setCurrentBidder] = useState(null);
  const [timer, setTimer] = useState(15);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [auctionHistory, setAuctionHistory] = useState([]);
  const [remainingPlayers, setRemainingPlayers] = useState([]);
  const [soldPlayers, setSoldPlayers] = useState([]);
  const [teamBalances, setTeamBalances] = useState({});
  const [isAuctionActive, setIsAuctionActive] = useState(false);


  const auctionData = useMemo(() => {
    if (!currentTournament) return null;
    
    return {
      tournamentId: currentTournament.id,
      teams: currentTournament.teams,
      players: currentTournament.playerPool
    };
  }, [currentTournament]);

  


  // Initialize auction state from tournament data
  const initializeAuction = (tournamentData) => {
    try {
      const auction = tournamentData.auction;
      
      setCurrentAuction({
        tournamentId: tournamentData.id,
        teams: tournamentData.teams,
        status: tournamentData.status
      });
      
      setCurrentPlayer(auction.currentPlayer);
      setCurrentBid(auction.currentBid || 0);
      setCurrentBidder(auction.currentBidder);
      setTimer(auction.timer || 15);
      setAuctionHistory(auction.history || []);
      
      // Initialize remaining players and sold players
      const allPlayers = tournamentData.players || [];
      const sold = allPlayers.filter(p => p.team);
      const remaining = allPlayers.filter(p => !p.team);
      
      setRemainingPlayers(remaining);
      setSoldPlayers(sold);
      
      // Initialize team balances
      const balances = {};
      tournamentData.teams.forEach(team => {
        const teamPlayers = sold.filter(p => p.team === team.id);
        const spentAmount = teamPlayers.reduce((total, p) => total + p.soldPrice, 0);
        balances[team.id] = {
          totalBudget: tournamentData.teamBudget,
          spent: spentAmount,
          remaining: tournamentData.teamBudget - spentAmount,
          players: teamPlayers
        };
      });
      
      setTeamBalances(balances);
      
      // Set auction active if status is 'auction'
      setIsAuctionActive(tournamentData.status === 'auction');
    } catch (error) {
      console.error('Error initializing auction:', error);
      toast.error('Failed to initialize auction. Please try again.');
    }
  };

  // Timer effect
  useEffect(() => {
    let interval;
    
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timer === 0) {
      // Time's up, complete the bid
      completeBid();
    }
    
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  // Start the timer
  const startTimer = () => {
    setIsTimerRunning(true);
  };

  // Pause the timer
  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  // Reset the timer
  const resetTimer = (seconds = 15) => {
    setTimer(seconds);
    setIsTimerRunning(false);
  };

  // Place a bid
  const placeBid = (teamId, bidAmount) => {
    try {
      if (!isAuctionActive) {
        throw new Error('Auction is not active');
      }
      
      if (!currentPlayer) {
        throw new Error('No player available for bidding');
      }
      
      // Validate bid amount
      if (bidAmount <= currentBid) {
        throw new Error('Bid amount must be higher than current bid');
      }
      
      // Check if team has enough budget
      const teamBalance = teamBalances[teamId];
      if (!teamBalance) {
        throw new Error('Team not found');
      }
      
      if (bidAmount > teamBalance.remaining) {
        throw new Error('Not enough budget to place this bid');
      }
      
      // Update state
      setCurrentBid(bidAmount);
      setCurrentBidder(teamId);
      
      // Reset timer
      resetTimer();
      startTimer();
      
      // Add bid to history
      const newBid = {
        id: generateUniqueId(),
        playerId: currentPlayer.id,
        teamId,
        amount: bidAmount,
        timestamp: new Date().toISOString()
      };
      
      setAuctionHistory(prev => [...prev, newBid]);
      
      return newBid;
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error(error.message || 'Failed to place bid');
      throw error;
    }
  };

  // Complete the current bid
  const completeBid = () => {
    try {
      if (!isAuctionActive) {
        throw new Error('Auction is not active');
      }
      
      if (!currentPlayer) {
        throw new Error('No player available for bidding');
      }
      
      // Pause timer
      pauseTimer();
      
      const soldPlayer = {
        ...currentPlayer,
        team: currentBidder,
        soldPrice: currentBid,
        soldAt: new Date().toISOString()
      };
      
      // Update sold players list
      setSoldPlayers(prev => [...prev, soldPlayer]);
      
      // Update remaining players list
      setRemainingPlayers(prev => prev.filter(p => p.id !== currentPlayer.id));
      
      // Update team balance
      if (currentBidder) {
        setTeamBalances(prev => {
          const team = prev[currentBidder];
          return {
            ...prev,
            [currentBidder]: {
              ...team,
              spent: team.spent + currentBid,
              remaining: team.remaining - currentBid,
              players: [...team.players, soldPlayer]
            }
          };
        });
      }
      
      // Move to next player if available
      const nextPlayer = getNextPlayer();
      if (nextPlayer) {
        setCurrentPlayer(nextPlayer);
        setCurrentBid(nextPlayer.basePrice);
        setCurrentBidder(null);
        
        // Reset timer
        resetTimer();
      } else {
        // End auction if no more players
        setIsAuctionActive(false);
        setCurrentPlayer(null);
        setCurrentBid(0);
        setCurrentBidder(null);
      }
      
      // Save auction state
      saveAuctionState();
      
      return soldPlayer;
    } catch (error) {
      console.error('Error completing bid:', error);
      toast.error(error.message || 'Failed to complete bid');
      throw error;
    }
  };

  // Skip the current player
  const skipPlayer = () => {
    try {
      if (!isAuctionActive) {
        throw new Error('Auction is not active');
      }
      
      if (!currentPlayer) {
        throw new Error('No player available to skip');
      }
      
      // Pause timer
      pauseTimer();
      
      // Update remaining players list
      setRemainingPlayers(prev => prev.filter(p => p.id !== currentPlayer.id));
      
      // Move to next player if available
      const nextPlayer = getNextPlayer();
      if (nextPlayer) {
        setCurrentPlayer(nextPlayer);
        setCurrentBid(nextPlayer.basePrice);
        setCurrentBidder(null);
        
        // Reset timer
        resetTimer();
      } else {
        // End auction if no more players
        setIsAuctionActive(false);
        setCurrentPlayer(null);
        setCurrentBid(0);
        setCurrentBidder(null);
      }
      
      // Save auction state
      saveAuctionState();
      
      return nextPlayer;
    } catch (error) {
      console.error('Error skipping player:', error);
      toast.error(error.message || 'Failed to skip player');
      throw error;
    }
  };

  // Get the next player from the remaining players
  const getNextPlayer = () => {
    if (remainingPlayers.length === 0) {
      return null;
    }
    
    return remainingPlayers[0];
  };

  // Save current auction state to tournament
  const saveAuctionState = () => {
    if (!currentAuction) return;
    
    const updatedAuction = {
      currentPlayer,
      currentBid,
      currentBidder,
      timer,
      history: auctionHistory,
      lastUpdated: new Date().toISOString()
    };
    
    // Update tournament with new auction state
    updateTournament(currentAuction.tournamentId, {
      auction: updatedAuction,
      players: [...remainingPlayers, ...soldPlayers],
      teams: currentAuction.teams.map(team => {
        const balance = teamBalances[team.id];
        return {
          ...team,
          players: balance ? balance.players.map(p => p.id) : [],
          spent: balance ? balance.spent : 0,
          remaining: balance ? balance.remaining : team.budget
        };
      })
    });
  };

  // Start the auction
  const startAuction = useCallback(() => {
    if (!currentTournament) return;
    
    setIsAuctionActive(true);
    // Select first player
    if (currentTournament.playerPool && currentTournament.playerPool.length > 0) {
      setCurrentPlayer(currentTournament.playerPool[0]);
      setCurrentBid(currentTournament.playerPool[0].basePrice || 0);
      setTimer(30);
      setAuctionHistory([]);
    }
  }, [currentTournament]);
  // End the auction
  const endAuction = () => {
    try {
      // Set auction inactive
      setIsAuctionActive(false);
      setCurrentPlayer(null);
      setCurrentBid(0);
      setCurrentBidder(null);
      pauseTimer();
      
      // Save auction state
      saveAuctionState();
      
      return true;
    } catch (error) {
      console.error('Error ending auction:', error);
      toast.error(error.message || 'Failed to end auction');
      throw error;
    }
  };
  useEffect(() => {
    if (!isAuctionActive) return;
    
    const timerId = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 0) {
          // Handle timeout
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [isAuctionActive]);

  // Handle timer reaching zero
  useEffect(() => {
    if (timer === 0 && currentPlayer && isAuctionActive) {
      // Handle player auction completion
      // This should be optimized to prevent excessive state changes
    }
  }, [timer, currentPlayer, isAuctionActive]);

  const contextValue = {
    currentAuction,
    currentPlayer,
    currentBid,
    currentBidder,
    timer,
    isTimerRunning,
    auctionHistory,
    remainingPlayers,
    soldPlayers,
    teamBalances,
    isAuctionActive,
    initializeAuction,
    startTimer,
    pauseTimer,
    resetTimer,
    placeBid,
    completeBid,
    skipPlayer,
    getNextPlayer,
    saveAuctionState,
    startAuction,
    endAuction
  };

  return (
    <AuctionContext.Provider value={{
      isAuctionActive,
      currentAuction,
    currentPlayer,
    currentBid,
    currentBidder,
    timer,
    isTimerRunning,
    auctionHistory,
    remainingPlayers,
    soldPlayers,
    teamBalances,
    isAuctionActive,
    initializeAuction,
    startTimer,
    pauseTimer,
    resetTimer,
    placeBid,
    completeBid,
    skipPlayer,
    getNextPlayer,
    saveAuctionState,
    startAuction,
    endAuction
      // other methods...
    }}>
      {children}
    </AuctionContext.Provider>
  );
};

