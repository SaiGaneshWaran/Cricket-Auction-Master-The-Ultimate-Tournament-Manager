import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as dataService from '../services/dataService';

import { generatePlayerPool } from '../services/tournamentService';
import { 
  saveTournamentToStorage, 
  getTournamentFromStorage,
  getAllTournamentsFromStorage 
} from '../utils/storage.js';

// Create context
const TournamentContext = createContext();

export const useTournament = () => useContext(TournamentContext);

export const TournamentProvider = ({ children }) => {
  const [tournaments, setTournaments] = useState({});
  const [currentTournament, setCurrentTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  

  // Load tournaments from localStorage on initial render
  useEffect(() => {
    try {
      const storedTournaments = getAllTournamentsFromStorage();
      setTournaments(storedTournaments);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate a unique 6-digit code
  const generateUniqueCode = () => {
    const min = 100000; // 6 digits
    const max = 999999;
    let code;
    
    // Keep generating until we find a unique one
    do {
      code = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (
      Object.values(tournaments).some(
        t => t.captainCode === code.toString() || t.viewerCode === code.toString()
      )
    );
    
    return code.toString();
  };

  // Create a new tournament
  const createTournament = (tournamentData) => {
    try {
      const tournamentId = uuidv4();
      const captainCode = generateUniqueCode();
      const viewerCode = generateUniqueCode();
      
      // Generate player pool
      const players = generatePlayerPool(tournamentData.playerPool, tournamentData.teamBudget);
      
      const newTournament = {
        ...tournamentData,
        id: tournamentId,
        captainCode,
        viewerCode,
        players,
        createdAt: new Date().toISOString(),
        status: 'pre-auction', // pre-auction, auction, post-auction, matches, completed
        currentPhase: 'setup',
        connectedUsers: [],
        auction: {
          currentPlayer: null,
          currentBid: 0,
          currentBidder: null,
          timer: 15,
          history: []
        },
        matches: []
      };
      
      // Update state
      setTournaments(prev => ({
        ...prev,
        [tournamentId]: newTournament
      }));
      
      
      return dataService.createTournament(tournamentData);
      
      
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw new Error('Failed to create tournament. Please try again.');
    }
  };

  // Join a tournament
  const joinTournament = async (code, isViewer = false) => {
    const result = await dataService.validateTournamentCode(
      code, 
      isViewer ? 'viewer' : 'captain'
    );
    
    if (!result.valid) {
      throw new Error('Invalid tournament code');
    }
    
    const tournamentData = await dataService.getTournamentById(result.tournamentId);
    if (!tournamentData) {
      throw new Error('Tournament not found');
    }
    
    setCurrentTournament(tournamentData);
    return { tournamentId: result.tournamentId, tournamentData };
  };

  // Get a tournament by ID
  const getTournament = (tournamentId) => {
    try {
      // Try to get from state first
      if (tournaments[tournamentId]) {
        return tournaments[tournamentId];
      }
      
      // If not in state, try to get from localStorage
      const tournament = getTournamentFromStorage(tournamentId);
      
      if (!tournament) {
        throw new Error('Tournament not found.');
      }
      
      // Update state
      setTournaments(prev => ({
        ...prev,
        [tournamentId]: tournament
      }));
      
      return tournament;
    } catch (error) {
      console.error('Error getting tournament:', error);
      throw new Error('Failed to load tournament. Please try again.');
    }
  };

  // Update a tournament
  const updateTournament = (tournamentId, updates) => {
    try {
      const tournament = getTournament(tournamentId);
      
      if (!tournament) {
        throw new Error('Tournament not found.');
      }
      
      const updatedTournament = {
        ...tournament,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Update state
      setTournaments(prev => ({
        ...prev,
        [tournamentId]: updatedTournament
      }));
      
      // Save to localStorage
      saveTournamentToStorage(tournamentId, updatedTournament);
      
      return updatedTournament;
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw new Error('Failed to update tournament. Please try again.');
    }
  };

  // Start the auction
  const startAuction = (tournamentId) => {
    try {
      const tournament = getTournament(tournamentId);
      
      if (tournament.status !== 'pre-auction') {
        throw new Error('Tournament is not in pre-auction status.');
      }
      
      // Shuffle players to randomize auction order
      const shuffledPlayers = [...tournament.players].sort(() => Math.random() - 0.5);
      
      const updatedTournament = {
        ...tournament,
        status: 'auction',
        currentPhase: 'auction',
        players: shuffledPlayers,
        auction: {
          ...tournament.auction,
          currentPlayer: shuffledPlayers[0],
          currentBid: shuffledPlayers[0].basePrice,
          timer: 15,
          startedAt: new Date().toISOString()
        }
      };
      
      // Update tournament
      updateTournament(tournamentId, updatedTournament);
      
      return updatedTournament;
    } catch (error) {
      console.error('Error starting auction:', error);
      throw new Error('Failed to start auction. Please try again.');
    }
  };

  // End the auction
  const endAuction = (tournamentId) => {
    try {
      const tournament = getTournament(tournamentId);
      
      if (tournament.status !== 'auction') {
        throw new Error('Tournament is not in auction status.');
      }
      
      const updatedTournament = {
        ...tournament,
        status: 'post-auction',
        currentPhase: 'analysis',
        auction: {
          ...tournament.auction,
          endedAt: new Date().toISOString()
        }
      };
      
      // Update tournament
      updateTournament(tournamentId, updatedTournament);
      
      return updatedTournament;
    } catch (error) {
      console.error('Error ending auction:', error);
      throw new Error('Failed to end auction. Please try again.');
    }
  };

  const contextValue = {
    tournaments,
    currentTournament,
    loading,
    createTournament,
    joinTournament,
    getTournament,
    updateTournament,
    startAuction,
    endAuction
  };

  return (
    <TournamentContext.Provider value={{ 
      currentTournament,
      createTournament,
      joinTournament,
      getTournament,
      updateTournament,
      startAuction,
      endAuction
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

