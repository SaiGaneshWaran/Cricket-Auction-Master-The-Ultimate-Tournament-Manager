// Utility functions for auction system

// Generate a random room code (6 characters alphanumeric)
export const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like 0, O, 1, I
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Calculate base price for a player
export const calculateBasePrice = (teamBudget) => {
  // Base price is 5% of team budget
  return Math.round(teamBudget * 0.05);
};

// Calculate bid increment (4% of current bid)
export const calculateBidIncrement = (currentBid) => {
  return Math.ceil(currentBid * 0.04);
};

// Get player role icon
export const getPlayerRoleIcon = (role) => {
  const roleIcons = {
    'Batsman': '🏏',
    'Bowler': '🎯',
    'All-Rounder': '⭐',
    'Wicket-Keeper': '🧤',
    'Captain': '👑',
  };
  
  return roleIcons[role] || '🏏';
};

// Format currency for display
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    notation: amount > 10000000 ? 'compact' : 'standard',
  }).format(amount);
};

// Generate player statistics for display
export const generatePlayerStats = () => {
  // For demonstration, generate random stats
  const stats = {
    batting: {
      average: (20 + Math.random() * 50).toFixed(2),
      strikeRate: (100 + Math.random() * 50).toFixed(2),
      highestScore: Math.floor(50 + Math.random() * 150),
    },
    bowling: {
      economy: (5 + Math.random() * 5).toFixed(2),
      average: (20 + Math.random() * 20).toFixed(2),
      bestFigures: `${Math.floor(1 + Math.random() * 6)}/${Math.floor(10 + Math.random() * 50)}`,
    }
  };
  
  return stats;
};

// Check if a team has completed their squad
export const hasCompletedSquad = (team) => {
  return team.slots.remaining === 0;
};

// Generate auction summary for display or export
export const generateAuctionSummary = (auctionData) => {
  if (!auctionData) return null;
  
  const summary = {
    tournamentName: auctionData.tournamentName,
    teams: auctionData.teams.map(team => ({
      name: team.name,
      budget: {
        initial: team.budget,
        remaining: team.remainingBudget,
        spent: team.budget - team.remainingBudget
      },
      players: team.players.map(player => ({
        name: player.name,
        role: player.role,
        purchasePrice: player.purchasePrice
      }))
    })),
    soldPlayers: auctionData.soldPlayers.length,
    timestamp: Date.now()
  };
  
  return summary;
};