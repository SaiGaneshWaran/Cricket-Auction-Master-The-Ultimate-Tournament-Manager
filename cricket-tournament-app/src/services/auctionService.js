import { v4 as uuidv4 } from 'uuid';

// Storage keys
const STORAGE_KEY = 'cricket_auctions';
const TOURNAMENTS_KEY = 'cricket_tournaments';

// Helper function to get from storage
const getFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

// Helper function to save to storage
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
};

// Initialize an auction from tournament data
export const initializeAuction = (tournamentData) => {
  try {
    console.log('Initializing auction for tournament:', tournamentData.id);
    
    // Check if an auction already exists for this tournament
    const existingAuction = getAuctionByTournamentId(tournamentData.id);
    
    if (existingAuction) {
      console.log('Using existing auction:', existingAuction.id);
      return existingAuction;
    }
    
    console.log('Creating new auction for tournament:', tournamentData.id);
    
    // Create a new auction
    const auctionId = uuidv4();
    const playerPool = Array.isArray(tournamentData.players) ? 
      tournamentData.players.map(player => ({
        ...player,
        currentBid: player.basePrice || 100000,  // Default to 1 Lakh if no base price
        currentBidder: null,
        status: 'pending'
      })) : [];
    
    // Sort player pool by role and base price
    playerPool.sort((a, b) => {
      // First sort by role importance
      const roleOrder = { 'batsman': 0, 'wicketKeeper': 1, 'allRounder': 2, 'bowler': 3 };
      const roleDiff = (roleOrder[a.role] || 0) - (roleOrder[b.role] || 0);
      
      if (roleDiff !== 0) return roleDiff;
      
      // Then by base price (highest first)
      return (b.basePrice || 0) - (a.basePrice || 0);
    });
    
    // Create auction object
    const auction = {
      id: auctionId,
      tournamentId: tournamentData.id,
      status: 'initialized', // initialized, active, completed
      teams: Array.isArray(tournamentData.teams) ? 
        tournamentData.teams.map(team => ({
          id: team.id,
          name: team.name,
          color: team.color || '#1976d2',
          budget: team.budget || 10000000, // Default 1 crore if not specified
          players: []
        })) : [],
      playerPool,
      currentPlayer: playerPool.length > 0 ? playerPool[0] : null,
      currentIndex: 0,
      timerDuration: 15, // seconds
      timerStart: null,
      history: [],
      createdAt: Date.now(),
      lastSyncTime: Date.now()
    };
    
    console.log('Auction created:', auction.id);
    console.log('Player pool size:', auction.playerPool.length);
    console.log('Teams:', auction.teams.map(t => t.name).join(', '));
    
    // Save the auction
    saveAuction(auction);
    
    return auction;
  } catch (error) {
    console.error('Error initializing auction:', error);
    throw new Error('Failed to initialize auction: ' + error.message);
  }
};

// Helper function to save auction
const saveAuction = (auction) => {
  try {
    const auctions = getFromStorage(STORAGE_KEY, {});
    auctions[auction.id] = auction;
    saveToStorage(STORAGE_KEY, auctions);
    return true;
  } catch (error) {
    console.error('Error saving auction:', error);
    throw new Error('Failed to save auction');
  }
};

// Get auction by tournament ID
export const getAuctionByTournamentId = (tournamentId) => {
  try {
    const auctions = getFromStorage(STORAGE_KEY, {});
    return Object.values(auctions).find(auction => 
      auction && auction.tournamentId === tournamentId
    ) || null;
  } catch (error) {
    console.error('Error getting auction by tournament ID:', error);
    return null;
  }
};

// Get auction by ID
export const getAuctionById = (auctionId) => {
  try {
    const auctions = getFromStorage(STORAGE_KEY, {});
    return auctions[auctionId] || null;
  } catch (error) {
    console.error('Error getting auction by ID:', error);
    return null;
  }
};

// Start the auction
export const startAuction = async (auctionId) => {
  try {
    console.log('Starting auction:', auctionId);
    const auction = getAuctionById(auctionId);
    if (!auction) {
      throw new Error('Auction not found: ' + auctionId);
    }
    
    // Update status and timer
    const updatedAuction = {
      ...auction,
      status: 'active',
      timerStart: Date.now(),
      lastSyncTime: Date.now()
    };
    
    // Save updated auction
    saveAuction(updatedAuction);
    console.log('Auction started successfully:', auctionId);
    
    return updatedAuction;
  } catch (error) {
    console.error('Error starting auction:', error);
    throw error;
  }
};

// Place a bid
export const placeBid = async (auctionId, playerId, teamId, bidAmount) => {
  try {
    const auction = getAuctionById(auctionId);
    if (!auction) {
      throw new Error('Auction not found');
    }
    
    // Find the current player
    const currentPlayer = auction.currentPlayer;
    if (!currentPlayer || currentPlayer.id !== playerId) {
      throw new Error('Invalid player for bidding');
    }
    
    // Update player with new bid
    const updatedAuction = {
      ...auction,
      currentPlayer: {
        ...currentPlayer,
        currentBid: bidAmount,
        currentBidder: teamId
      },
      lastSyncTime: Date.now()
    };
    
    // Add to history
    updatedAuction.history = [
      ...(auction.history || []),
      {
        type: 'bid',
        playerId,
        teamId,
        amount: bidAmount,
        timestamp: Date.now()
      }
    ];
    
    // Save updated auction
    saveAuction(updatedAuction);
    
    return updatedAuction;
  } catch (error) {
    console.error('Error placing bid:', error);
    throw error;
  }
};

// Complete player auction
export const completePlayerAuction = async (auctionId) => {
  try {
    const auction = getAuctionById(auctionId);
    if (!auction) {
      throw new Error('Auction not found');
    }
    
    const currentPlayer = auction.currentPlayer;
    if (!currentPlayer) {
      throw new Error('No current player');
    }
    
    // Update player status
    const wasSold = currentPlayer.currentBidder != null;
    
    // Update player pool with the current player's status
    const updatedPool = auction.playerPool.map(player => {
      if (player.id === currentPlayer.id) {
        return {
          ...player,
          status: wasSold ? 'sold' : 'unsold',
          soldTo: wasSold ? currentPlayer.currentBidder : null,
          finalPrice: wasSold ? currentPlayer.currentBid : 0
        };
      }
      return player;
    });
    
    // Update team players if sold
    const updatedTeams = [...auction.teams];
    if (wasSold) {
      const teamIndex = updatedTeams.findIndex(t => t.id === currentPlayer.currentBidder);
      if (teamIndex >= 0) {
        updatedTeams[teamIndex] = {
          ...updatedTeams[teamIndex],
          players: [
            ...(updatedTeams[teamIndex].players || []),
            {
              id: currentPlayer.id,
              name: currentPlayer.name,
              role: currentPlayer.role,
              price: currentPlayer.currentBid
            }
          ]
        };
      }
    }
    
    // Move to next player
    const nextIndex = auction.currentIndex + 1;
    const nextPlayer = nextIndex < updatedPool.length ? updatedPool[nextIndex] : null;
    
    // Update auction
    const updatedAuction = {
      ...auction,
      playerPool: updatedPool,
      teams: updatedTeams,
      currentIndex: nextIndex,
      currentPlayer: nextPlayer,
      status: nextPlayer ? 'active' : 'completed',
      lastSyncTime: Date.now(),
      history: [
        ...(auction.history || []),
        {
          type: wasSold ? 'sold' : 'unsold',
          playerId: currentPlayer.id,
          teamId: wasSold ? currentPlayer.currentBidder : null,
          amount: wasSold ? currentPlayer.currentBid : 0,
          timestamp: Date.now()
        }
      ]
    };
    
    // Save updated auction
    saveAuction(updatedAuction);
    
    return updatedAuction;
  } catch (error) {
    console.error('Error completing player auction:', error);
    throw error;
  }
};

// Skip player
export const skipPlayer = async (auctionId) => {
  try {
    const auction = getAuctionById(auctionId);
    if (!auction) {
      throw new Error('Auction not found');
    }
    
    const currentPlayer = auction.currentPlayer;
    if (!currentPlayer) {
      throw new Error('No current player');
    }
    
    // Update player pool
    const updatedPool = auction.playerPool.map(player => {
      if (player.id === currentPlayer.id) {
        return {
          ...player,
          status: 'skipped'
        };
      }
      return player;
    });
    
    // Move to next player
    const nextIndex = auction.currentIndex + 1;
    const nextPlayer = nextIndex < updatedPool.length ? updatedPool[nextIndex] : null;
    
    // Update auction
    const updatedAuction = {
      ...auction,
      playerPool: updatedPool,
      currentIndex: nextIndex,
      currentPlayer: nextPlayer,
      status: nextPlayer ? 'active' : 'completed',
      lastSyncTime: Date.now(),
      history: [
        ...(auction.history || []),
        {
          type: 'skipped',
          playerId: currentPlayer.id,
          timestamp: Date.now()
        }
      ]
    };
    
    // Save updated auction
    saveAuction(updatedAuction);
    
    return updatedAuction;
  } catch (error) {
    console.error('Error skipping player:', error);
    throw error;
  }
};

// Calculate team balances
export const getTeamBalances = (auction) => {
  const balances = {};
  
  if (!auction || !Array.isArray(auction.teams)) {
    return balances;
  }
  
  auction.teams.forEach(team => {
    const totalBudget = parseFloat(team.budget) || 10000000; // Default 1 crore
    const spent = Array.isArray(team.players) ? 
      team.players.reduce((sum, player) => sum + (parseFloat(player.price) || 0), 0) : 0;
    
    balances[team.id] = {
      total: totalBudget,
      spent: spent,
      remaining: totalBudget - spent
    };
  });
  
  return balances;
};

export default {
  initializeAuction,
  getAuctionByTournamentId,
  getAuctionById,
  startAuction,
  placeBid,
  completePlayerAuction,
  skipPlayer,
  getTeamBalances
};