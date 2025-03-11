import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateRoomCode } from '../utils/auctionHelper';

export function useAuction() {
  const [auctionData, setAuctionData] = useLocalStorage('auctionData', null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [timer, setTimer] = useState(15);
  const [auctionStatus, setAuctionStatus] = useState('waiting'); // 'waiting', 'active', 'paused', 'completed'
  const [roomCode, setRoomCode] = useState('');
  const [currentBid, setCurrentBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Initialize auction
  const initializeAuction = useCallback((tournamentData) => {
    const newRoomCode = generateRoomCode();
    
    const initialAuctionData = {
      roomCode: newRoomCode,
      tournamentName: tournamentData.name,
      teams: tournamentData.teams.map(team => ({
        ...team,
        remainingBudget: team.budget,
        players: [],
        slots: {
          total: tournamentData.playersPerTeam,
          remaining: tournamentData.playersPerTeam
        }
      })),
      availablePlayers: tournamentData.players.filter(player => !player.team),
      soldPlayers: [],
      currentPlayerIndex: 0,
      isActive: true,
      startTime: Date.now(),
    };
    
    setAuctionData(initialAuctionData);
    setRoomCode(newRoomCode);
    setAuctionStatus('waiting');
    return newRoomCode;
  }, [setAuctionData]);

  // Start auction
  const startAuction = useCallback(() => {
    if (!auctionData) return;
    
    const firstPlayer = auctionData.availablePlayers[0];
    const basePrice = firstPlayer.basePrice || 100; // Default base price if not set
    
    setCurrentPlayer(firstPlayer);
    setCurrentBid(basePrice);
    setHighestBidder(null);
    setBidHistory([]);
    setTimer(15);
    setAuctionStatus('active');
  }, [auctionData]);

  // Place bid
  const placeBid = useCallback((teamId) => {
    if (auctionStatus !== 'active' || !currentPlayer) return false;
    
    // Find team
    const team = auctionData.teams.find(t => t.id === teamId);
    if (!team) return false;
    
    // Increase bid by 4%
    const bidIncrement = Math.ceil(currentBid * 0.04);
    const newBid = currentBid + bidIncrement;
    
    // Check if team has enough budget
    if (team.remainingBudget < newBid) return false;
    
    // Check if team has remaining slots
    if (team.slots.remaining <= 0) return false;
    
    // Update bid information
    setCurrentBid(newBid);
    setHighestBidder(team);
    setTimer(15); // Reset timer
    
    // Update bid history
    setBidHistory(prev => [
      ...prev,
      {
        teamId,
        teamName: team.name,
        amount: newBid,
        timestamp: Date.now()
      }
    ]);
    
    return true;
  }, [auctionData, auctionStatus, currentBid, currentPlayer]);

  // Complete player auction
  const completePlayerAuction = useCallback(() => {
    if (!auctionData || !currentPlayer || auctionStatus !== 'active') return;
    
    // If there's a highest bidder, assign player to that team
    if (highestBidder) {
      const updatedTeams = auctionData.teams.map(team => {
        if (team.id === highestBidder.id) {
          return {
            ...team,
            players: [...team.players, {
              ...currentPlayer,
              purchasePrice: currentBid
            }],
            remainingBudget: team.remainingBudget - currentBid,
            slots: {
              ...team.slots,
              remaining: team.slots.remaining - 1
            }
          };
        }
        return team;
      });
      
      // Update auction data
      const updatedAuctionData = {
        ...auctionData,
        teams: updatedTeams,
        soldPlayers: [...auctionData.soldPlayers, {
          ...currentPlayer,
          purchasePrice: currentBid,
          team: highestBidder.id
        }],
        availablePlayers: auctionData.availablePlayers.filter(p => p.id !== currentPlayer.id),
        currentPlayerIndex: auctionData.currentPlayerIndex + 1
      };
      
      setAuctionData(updatedAuctionData);
      
      // Check if a team has completed their squad
      const teamCompletedSquad = updatedTeams.find(team => team.slots.remaining === 0);
      if (teamCompletedSquad) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      // Move to next player or complete auction
      if (updatedAuctionData.availablePlayers.length > 0) {
        const nextPlayer = updatedAuctionData.availablePlayers[0];
        const basePrice = nextPlayer.basePrice || 100;
        
        setCurrentPlayer(nextPlayer);
        setCurrentBid(basePrice);
        setHighestBidder(null);
        setBidHistory([]);
        setTimer(15);
      } else {
        setAuctionStatus('completed');
      }
    } else {
      // If no one bid, keep player in pool and move to next
      const updatedAuctionData = {
        ...auctionData,
        availablePlayers: auctionData.availablePlayers.filter((_, index) => index !== 0)
          .concat([auctionData.availablePlayers[0]]), // Move player to end of list
        currentPlayerIndex: auctionData.currentPlayerIndex + 1
      };
      
      setAuctionData(updatedAuctionData);
      
      // Move to next player or complete auction
      if (updatedAuctionData.availablePlayers.length > 0) {
        const nextPlayer = updatedAuctionData.availablePlayers[0];
        const basePrice = nextPlayer.basePrice || 100;
        
        setCurrentPlayer(nextPlayer);
        setCurrentBid(basePrice);
        setHighestBidder(null);
        setBidHistory([]);
        setTimer(15);
      } else {
        setAuctionStatus('completed');
      }
    }
  }, [auctionData, currentPlayer, highestBidder, currentBid, auctionStatus, setAuctionData]);

  // Timer effect
  useEffect(() => {
    let interval;
    
    if (auctionStatus === 'active' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && auctionStatus === 'active') {
      completePlayerAuction();
    }
    
    return () => clearInterval(interval);
  }, [auctionStatus, timer, completePlayerAuction]);

  // Export auction summary
  const exportAuctionData = () => {
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
    
    // Create downloadable blob
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = `${auctionData.tournamentName.replace(/\s+/g, '_')}_auction_summary.json`;
    link.href = url;
    link.click();
    
    return summary;
  };

  return {
    auctionData,
    setAuctionData,
    currentPlayer,
    bidHistory,
    timer,
    auctionStatus,
    roomCode,
    currentBid,
    highestBidder,
    showConfetti,
    initializeAuction,
    startAuction,
    placeBid,
    completePlayerAuction,
    exportAuctionData
  };
}