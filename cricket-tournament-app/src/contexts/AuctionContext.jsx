import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import auctionService from '../services/auctionService';

const AuctionContext = createContext();

export function AuctionProvider({ children }) {
  const [currentAuction, setCurrentAuction] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [currentBidder, setCurrentBidder] = useState(null);
  const [timer, setTimer] = useState(15); // 15 seconds default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [auctionHistory, setAuctionHistory] = useState([]);
  const [teamBalances, setTeamBalances] = useState({});
  const [isAuctionActive, setIsAuctionActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auction state
  const initializeAuctionState = useCallback(async (tournament) => {
    try {
      console.log('Initializing auction state for tournament:', tournament.id);
      setLoading(true);
      
      // Initialize or get auction
      let auctionData = auctionService.getAuctionByTournamentId(tournament.id);
      
      if (!auctionData) {
        console.log('No existing auction found, creating new one');
        auctionData = await auctionService.initializeAuction(tournament);
      } else {
        console.log('Found existing auction:', auctionData.id);
      }
      
      // Set auction state
      setCurrentAuction(auctionData);
      setCurrentPlayer(auctionData.currentPlayer);
      
      // Set current bid
      if (auctionData.currentPlayer) {
        const basePrice = auctionData.currentPlayer.basePrice || 100000;
        const currentBid = auctionData.currentPlayer.currentBid || basePrice;
        setCurrentBid(currentBid);
        setCurrentBidder(auctionData.currentPlayer.currentBidder);
      }
      
      // Set history
      setAuctionHistory(auctionData.history || []);
      
      // Calculate team balances
      const balances = calculateTeamBalances(auctionData);
      setTeamBalances(balances);
      
      // Set auction activity
      setIsAuctionActive(auctionData.status === 'active');
      setTimer(15); // Reset timer to 15 seconds
      
      // Set initialization flag
      setIsInitialized(true);
      
      console.log('Auction initialization complete');
      setLoading(false);
      return auctionData;
    } catch (err) {
      console.error('Error initializing auction state:', err);
      setError(err.message || 'Failed to initialize auction');
      setLoading(false);
      throw err;
    }
  }, []);

  // Calculate team balances
  const calculateTeamBalances = useCallback((auction) => {
    const balances = {};
    
    if (!auction || !auction.teams) return balances;
    
    auction.teams.forEach(team => {
      // Initial budget from team definition
      const totalBudget = team.budget || 10000000; // Default 1 crore
      
      // Calculate spent amount from team's players
      const spent = (team.players || []).reduce((sum, player) => {
        return sum + (player.price || 0);
      }, 0);
      
      // Store in balances object
      balances[team.id] = {
        total: totalBudget,
        spent: spent,
        remaining: totalBudget - spent
      };
    });
    
    return balances;
  }, []);

  // Refresh auction data
  const refreshAuction = useCallback(async (auctionId) => {
    try {
      const auctionData = auctionService.getAuctionById(auctionId);
      if (!auctionData) throw new Error('Auction not found');
      
      // Update state
      setCurrentAuction(auctionData);
      setCurrentPlayer(auctionData.currentPlayer);
      
      if (auctionData.currentPlayer) {
        const basePrice = auctionData.currentPlayer.basePrice || 100000;
        const currentBid = auctionData.currentPlayer.currentBid || basePrice;
        setCurrentBid(currentBid);
        setCurrentBidder(auctionData.currentPlayer.currentBidder);
      }
      
      setAuctionHistory(auctionData.history || []);
      
      const balances = calculateTeamBalances(auctionData);
      setTeamBalances(balances);
      
      setIsAuctionActive(auctionData.status === 'active');
      
      return auctionData;
    } catch (err) {
      console.error('Error refreshing auction:', err);
      throw err;
    }
  }, [calculateTeamBalances]);

  // Start auction
  const startAuction = useCallback(async (auctionId) => {
    try {
      const updatedAuction = await auctionService.startAuction(auctionId);
      await refreshAuction(auctionId);
      setIsAuctionActive(true);
      return updatedAuction;
    } catch (err) {
      console.error('Error starting auction:', err);
      throw err;
    }
  }, [refreshAuction]);

  // Place bid
  const placeBid = useCallback(async (teamId, amount, forceAccept = false) => {
    try {
      if (!currentAuction || !currentPlayer) {
        throw new Error('Auction or player not available');
      }
      
      // Validate bid
      if (!forceAccept) {
        // Check if bid is higher than current bid
        if (amount <= currentBid) {
          throw new Error('Bid must be higher than current bid');
        }
        
        // Check if team has enough budget
        const teamBalance = teamBalances[teamId];
        if (teamBalance && amount > teamBalance.remaining) {
          throw new Error('Bid exceeds team budget');
        }
      }
      
      // Place bid
      const updatedAuction = await auctionService.placeBid(
        currentAuction.id,
        currentPlayer.id,
        teamId,
        amount
      );
      
      
      // Update state
      setCurrentBid(amount);
      setCurrentBidder(teamId);
      setTimer(15); // Reset timer when new bid is placed
      
      // Add to history
     // Updated placeBid function (partial update)

// Inside the placeBid function, update the bidEvent creation:
const playerName = currentPlayer?.name || 
currentPlayer?.fullName || 
currentPlayer?.firstName ||
"Unknown Player";

// Add to history with more complete information
const bidEvent = {
id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
type: 'bid',
playerId: currentPlayer.id,
playerName: playerName,
player: { ...currentPlayer, name: playerName }, // Include full player object
teamId,
amount,
timestamp: Date.now()
};

setAuctionHistory(prev => [bidEvent, ...prev]);
      
      setAuctionHistory(prev => [bidEvent, ...prev]);
      
      // Refresh auction
      await refreshAuction(currentAuction.id);
      
      return updatedAuction;
    } catch (err) {
      console.error('Error placing bid:', err);
      throw err;
    }
  }, [currentAuction, currentPlayer, currentBid, teamBalances, refreshAuction]);

  // Complete bid
  const completeBid = useCallback(async () => {
    try {
      if (!currentAuction) {
        throw new Error('Auction not available');
      }
      
      // Ensure we have a proper player name, with fallbacks
      const playerName = currentPlayer?.name || 
                         currentPlayer?.fullName || 
                         currentPlayer?.firstName ||
                         "Unknown Player";
      
      // Complete player auction
      const updatedAuction = await auctionService.completePlayerAuction(currentAuction.id);
      
      // Create a more complete history event object
      const historyEvent = {
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: currentBidder ? 'sold' : 'unsold',
        playerId: currentPlayer?.id,
        playerName: playerName, // Use our robust player name
        player: { ...currentPlayer, name: playerName }, // Include full player object for reference
        teamId: currentBidder,
        amount: currentBid,
        timestamp: Date.now()
      };
      
      // Check for duplicates before adding to history
      setAuctionHistory(prev => {
        // Look for any recent duplicate events (same player + type combination)
        const isDuplicate = prev.some(item => 
          item.type === historyEvent.type && 
          item.playerId === historyEvent.playerId &&
          Date.now() - item.timestamp < 10000 // Within last 10 seconds
        );
        
        // Only add if not a duplicate
        return isDuplicate ? prev : [historyEvent, ...prev];
      });
      
      // If this was a successful bid, update the team balances
      if (currentBidder && currentBid > 0) {
        // You might have code here to update team balances
        console.log(`Player ${playerName} sold to team ${currentBidder} for ₹${currentBid}`);
      } else {
        console.log(`Player ${playerName} went unsold`);
      }
      
      // Reset bidding state
      setCurrentBidder(null);
      
      // Refresh to get next player
      await refreshAuction(currentAuction.id);
      
      return updatedAuction;
    } catch (err) {
      console.error('Error completing bid:', err);
      throw err;
    }
  }, [currentAuction, currentPlayer, currentBid, currentBidder, refreshAuction]);

  // Skip player
 // Updated skipPlayer function

const skipPlayer = useCallback(async () => {
  try {
    if (!currentAuction) {
      throw new Error('Auction not available');
    }
    
    // Ensure we have a proper player name, with fallbacks (same as completeBid)
    const playerName = currentPlayer?.name || 
                      currentPlayer?.fullName || 
                      currentPlayer?.firstName ||
                      "Unknown Player";
    
    // Skip player
    const updatedAuction = await auctionService.skipPlayer(currentAuction.id);
    
    // Add to history with more complete information
    const skipEvent = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'skipped',
      playerId: currentPlayer?.id,
      playerName: playerName, // Use robust player name
      player: { ...currentPlayer, name: playerName }, // Include full player object
      timestamp: Date.now()
    };
    
    // Check for duplicates before adding to history (same as completeBid)
    setAuctionHistory(prev => {
      // Look for any recent duplicate events (same player + type combination)
      const isDuplicate = prev.some(item => 
        item.type === skipEvent.type && 
        item.playerId === skipEvent.playerId &&
        Date.now() - item.timestamp < 10000 // Within last 10 seconds
      );
      
      // Only add if not a duplicate
      return isDuplicate ? prev : [skipEvent, ...prev];
    });
    
    console.log(`Player ${playerName} was skipped`);
    
    // Reset bidding state
    setCurrentBidder(null);
    
    // Refresh to get next player
    await refreshAuction(currentAuction.id);
    
    return updatedAuction;
  } catch (err) {
    console.error('Error skipping player:', err);
    throw err;
  }
}, [currentAuction, currentPlayer, refreshAuction]);

  // Add this to the initialization logic in your AuctionContext provider
const initializeTeamBalances = (teams) => {
  if (!teams || !Array.isArray(teams)) return {};
  
  const balances = {};
  
  teams.forEach(team => {
    if (team && team.id) {
      // Convert from crores to actual amount if needed
      const teamBudgetInCrores = team.budget || 0;
      const teamBudget = teamBudgetInCrores > 100 ? teamBudgetInCrores : teamBudgetInCrores * 10000000;
      
      balances[team.id] = {
        total: teamBudget,
        spent: 0,
        remaining: teamBudget,
        players: []
      };
    }
  });
  
  return balances;
};

  const value = {
    currentAuction,
    currentPlayer,
    currentBid,
    currentBidder,
    timer,
    isTimerRunning,
    auctionHistory,
    teamBalances,
    isAuctionActive,
    isInitialized,
    loading,
    error,
    initializeAuctionState,
    refreshAuction,
    startAuction,
    placeBid,
    completeBid,
    skipPlayer,
    initializeTeamBalances
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuction() {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
}