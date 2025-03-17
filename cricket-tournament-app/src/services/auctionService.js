// src/services/auctionService.js
import { v4 as uuidv4 } from 'uuid';
import { getFromStorage, saveToStorage } from '../utils/storage.js';

const STORAGE_KEY = 'cricket_auction_data';

/**
 * Initialize a new auction for a tournament
 * @param {Object} tournamentData - The tournament data
 * @returns {Object} The initialized auction data
 */
export const initializeAuction = (tournamentData) => {
  const auctionId = uuidv4();
  const playerPool = tournamentData.playerPool.map(player => ({
    ...player,
    status: 'unsold',
    currentBid: player.basePrice,
    currentBidder: null,
    bidHistory: []
  }));

  const auctionData = {
    id: auctionId,
    tournamentId: tournamentData.id,
    status: 'waiting', // waiting, active, completed
    playerPool,
    currentPlayerIndex: -1,
    currentPlayer: null,
    teams: tournamentData.teams.map(team => ({
      ...team,
      budget: team.budget,
      playersAcquired: [],
      connected: false
    })),
    history: [],
    timerDuration: 15, // seconds
    timerStart: null,
    captainCode: generateSixDigitCode(),
    viewerCode: generateSixDigitCode()
  };

  saveToStorage(`${STORAGE_KEY}_${auctionId}`, auctionData);
  return auctionData;
};

/**
 * Start the auction
 * @param {string} auctionId - The auction ID
 * @returns {Object} The updated auction data
 */
export const startAuction = (auctionId) => {
  const auctionData = getFromStorage(`${STORAGE_KEY}_${auctionId}`);
  
  if (!auctionData) {
    throw new Error('Auction not found');
  }

  if (auctionData.status !== 'waiting') {
    throw new Error('Auction already started or completed');
  }

  const updatedAuction = {
    ...auctionData,
    status: 'active',
    currentPlayerIndex: 0,
    currentPlayer: auctionData.playerPool[0],
    timerStart: Date.now()
  };

  saveToStorage(`${STORAGE_KEY}_${auctionId}`, updatedAuction);
  return updatedAuction;
};

/**
 * Join an auction as a team captain
 * @param {string} captainCode - The captain access code
 * @param {string} teamId - The team ID
 * @returns {Object} The auction data
 */
export const joinAuctionAsCaptain = (captainCode, teamId) => {
  // Find the auction with the matching captain code
  const allAuctions = getAllAuctions();
  const auction = allAuctions.find(a => a.captainCode === captainCode);
  
  if (!auction) {
    throw new Error('Invalid captain code');
  }

  const team = auction.teams.find(t => t.id === teamId);
  
  if (!team) {
    throw new Error('Team not found');
  }

  if (team.connected) {
    throw new Error('Team already connected');
  }

  // Update team connection status
  const updatedTeams = auction.teams.map(t => 
    t.id === teamId ? { ...t, connected: true } : t
  );

  const updatedAuction = {
    ...auction,
    teams: updatedTeams
  };

  saveToStorage(`${STORAGE_KEY}_${auction.id}`, updatedAuction);
  return updatedAuction;
};

/**
 * Join an auction as a viewer
 * @param {string} viewerCode - The viewer access code
 * @returns {Object} The auction data
 */
export const joinAuctionAsViewer = (viewerCode) => {
  // Find the auction with the matching viewer code
  const allAuctions = getAllAuctions();
  const auction = allAuctions.find(a => a.viewerCode === viewerCode);
  
  if (!auction) {
    throw new Error('Invalid viewer code');
  }

  return auction;
};

/**
 * Place a bid in the auction
 * @param {string} auctionId - The auction ID
 * @param {string} playerId - The player ID
 * @param {string} teamId - The team ID
 * @param {number} bidAmount - The bid amount
 * @returns {Object} The updated auction data
 */
export const placeBid = (auctionId, playerId, teamId, bidAmount) => {
  const auctionData = getFromStorage(`${STORAGE_KEY}_${auctionId}`);
  
  if (!auctionData) {
    throw new Error('Auction not found');
  }

  if (auctionData.status !== 'active') {
    throw new Error('Auction not active');
  }

  if (auctionData.currentPlayer.id !== playerId) {
    throw new Error('Not the current player');
  }

  const team = auctionData.teams.find(t => t.id === teamId);
  
  if (!team) {
    throw new Error('Team not found');
  }

  if (!team.connected) {
    throw new Error('Team not connected');
  }

  if (team.budget < bidAmount) {
    throw new Error('Insufficient budget');
  }

  // Check if bid is higher than current bid
  if (bidAmount <= auctionData.currentPlayer.currentBid) {
    throw new Error('Bid must be higher than current bid');
  }

  // Update current player
  const updatedPlayerPool = auctionData.playerPool.map(player => 
    player.id === playerId 
      ? { 
          ...player, 
          currentBid: bidAmount, 
          currentBidder: teamId,
          bidHistory: [...player.bidHistory, { teamId, amount: bidAmount, timestamp: Date.now() }]
        } 
      : player
  );

  const updatedAuction = {
    ...auctionData,
    playerPool: updatedPlayerPool,
    currentPlayer: {
      ...auctionData.currentPlayer,
      currentBid: bidAmount,
      currentBidder: teamId,
      bidHistory: [...auctionData.currentPlayer.bidHistory, { teamId, amount: bidAmount, timestamp: Date.now() }]
    },
    timerStart: Date.now() // Reset timer
  };

  saveToStorage(`${STORAGE_KEY}_${auctionId}`, updatedAuction);
  return updatedAuction;
};

/**
 * Complete the current player auction
 * @param {string} auctionId - The auction ID
 * @returns {Object} The updated auction data
 */
export const completePlayerAuction = (auctionId) => {
  const auctionData = getFromStorage(`${STORAGE_KEY}_${auctionId}`);
  
  if (!auctionData) {
    throw new Error('Auction not found');
  }

  if (auctionData.status !== 'active') {
    throw new Error('Auction not active');
  }

  const currentPlayer = auctionData.currentPlayer;
  
  // If player was sold
  if (currentPlayer.currentBidder) {
    const teamIndex = auctionData.teams.findIndex(t => t.id === currentPlayer.currentBidder);
    
    if (teamIndex === -1) {
      throw new Error('Bidding team not found');
    }

    // Update team budget and add player to team
    const updatedTeams = [...auctionData.teams];
    updatedTeams[teamIndex] = {
      ...updatedTeams[teamIndex],
      budget: updatedTeams[teamIndex].budget - currentPlayer.currentBid,
      playersAcquired: [...updatedTeams[teamIndex].playersAcquired, {
        ...currentPlayer,
        purchasePrice: currentPlayer.currentBid
      }]
    };

    // Update player status
    const updatedPlayerPool = auctionData.playerPool.map(player => 
      player.id === currentPlayer.id 
        ? { ...player, status: 'sold', soldTo: currentPlayer.currentBidder, soldPrice: currentPlayer.currentBid } 
        : player
    );

    // Add to history
    const historyEntry = {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      basePrice: currentPlayer.basePrice,
      soldPrice: currentPlayer.currentBid,
      soldTo: currentPlayer.currentBidder,
      timestamp: Date.now()
    };

    // Check if all players are sold
    const nextPlayerIndex = auctionData.currentPlayerIndex + 1;
    const isAuctionComplete = nextPlayerIndex >= auctionData.playerPool.length;
    
    const updatedAuction = {
      ...auctionData,
      playerPool: updatedPlayerPool,
      teams: updatedTeams,
      history: [...auctionData.history, historyEntry],
      currentPlayerIndex: nextPlayerIndex,
      currentPlayer: isAuctionComplete ? null : auctionData.playerPool[nextPlayerIndex],
      status: isAuctionComplete ? 'completed' : 'active',
      timerStart: isAuctionComplete ? null : Date.now()
    };

    saveToStorage(`${STORAGE_KEY}_${auctionId}`, updatedAuction);
    return updatedAuction;
  } else {
    // Player unsold
    const updatedPlayerPool = auctionData.playerPool.map(player => 
      player.id === currentPlayer.id ? { ...player, status: 'unsold' } : player
    );

    // Add to history
    const historyEntry = {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      basePrice: currentPlayer.basePrice,
      status: 'unsold',
      timestamp: Date.now()
    };

    // Check if all players are processed
    const nextPlayerIndex = auctionData.currentPlayerIndex + 1;
    const isAuctionComplete = nextPlayerIndex >= auctionData.playerPool.length;
    
    const updatedAuction = {
      ...auctionData,
      playerPool: updatedPlayerPool,
      history: [...auctionData.history, historyEntry],
      currentPlayerIndex: nextPlayerIndex,
      currentPlayer: isAuctionComplete ? null : auctionData.playerPool[nextPlayerIndex],
      status: isAuctionComplete ? 'completed' : 'active',
      timerStart: isAuctionComplete ? null : Date.now()
    };

    saveToStorage(`${STORAGE_KEY}_${auctionId}`, updatedAuction);
    return updatedAuction;
  }
};

/**
 * Get auction data by ID
 * @param {string} auctionId - The auction ID
 * @returns {Object} The auction data
 */
export const getAuctionById = (auctionId) => {
  return getFromStorage(`${STORAGE_KEY}_${auctionId}`);
};

/**
 * Get all auctions
 * @returns {Array} All auctions
 */
export const getAllAuctions = () => {
  // Get all keys from localStorage that start with STORAGE_KEY
  const keys = Object.keys(localStorage).filter(key => key.startsWith(STORAGE_KEY));
  return keys.map(key => getFromStorage(key));
};

/**
 * Generate a random 6-digit code
 * @returns {string} A 6-digit code
 */
const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};