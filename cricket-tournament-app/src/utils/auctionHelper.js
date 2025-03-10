import { getFromStorage, saveToStorage } from '../store/localStorage';

export const calculateMinimumBid = (currentBid, incrementPercentage = 5) => {
  return Math.ceil(currentBid * (1 + incrementPercentage / 100));
};

export const validateBid = (bid, team, currentBid) => {
  const minBid = calculateMinimumBid(currentBid);
  
  if (!bid || !team) {
    return {
      isValid: false,
      message: 'Invalid bid or team'
    };
  }

  if (bid < minBid) {
    return {
      isValid: false,
      message: `Bid must be at least ₹${minBid.toLocaleString()}`
    };
  }

  if (bid > team.budget) {
    return {
      isValid: false,
      message: 'Bid exceeds team budget'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

export const updateTeamAfterBid = (teamId, soldPrice) => {
  const teams = getFromStorage('teams', []);
  const updatedTeams = teams.map(team => {
    if (team.id === teamId) {
      return {
        ...team,
        budget: team.budget - soldPrice,
        players: [...team.players]
      };
    }
    return team;
  });
  
  return saveToStorage('teams', updatedTeams);
};

export const recordAuctionTransaction = (player, buyingTeam, soldPrice) => {
  const transactions = getFromStorage('auctionTransactions', []);
  const newTransaction = {
    id: `transaction-${Date.now()}`,
    playerId: player.id,
    playerName: player.name,
    teamId: buyingTeam.id,
    teamName: buyingTeam.name,
    price: soldPrice,
    timestamp: new Date().toISOString()
  };
  
  transactions.push(newTransaction);
  return saveToStorage('auctionTransactions', transactions);
};

export const getTeamBidHistory = (teamId) => {
  const transactions = getFromStorage('auctionTransactions', []);
  return transactions.filter(t => t.teamId === teamId);
};

export const getRemainingPurse = (teamId) => {
  const teams = getFromStorage('teams', []);
  const team = teams.find(t => t.id === teamId);
  return team ? team.budget : 0;
};

export const getPlayersBoughtByTeam = (teamId) => {
  const transactions = getFromStorage('auctionTransactions', []);
  return transactions
    .filter(t => t.teamId === teamId)
    .map(t => ({
      playerId: t.playerId,
      name: t.playerName,
      price: t.price
    }));
};

export const validateAuctionStatus = (teamId) => {
  const team = getFromStorage('teams', []).find(t => t.id === teamId);
  if (!team) return { canBid: false, message: 'Team not found' };

  const playersBought = getPlayersBoughtByTeam(teamId).length;
  const maxPlayers = team.maxPlayers || 25;

  if (playersBought >= maxPlayers) {
    return {
      canBid: false,
      message: 'Maximum squad size reached'
    };
  }

  if (team.budget < 100000) { // Minimum bid amount
    return {
      canBid: false,
      message: 'Insufficient budget'
    };
  }

  return {
    canBid: true,
    message: ''
  };
};

export const getAuctionSummary = () => {
  const transactions = getFromStorage('auctionTransactions', []);
  const teams = getFromStorage('teams', []);

  return teams.map(team => {
    const teamTransactions = transactions.filter(t => t.teamId === team.id);
    return {
      teamId: team.id,
      teamName: team.name,
      playersBought: teamTransactions.length,
      totalSpent: teamTransactions.reduce((sum, t) => sum + t.price, 0),
      remainingBudget: team.budget,
      transactions: teamTransactions
    };
  });
};