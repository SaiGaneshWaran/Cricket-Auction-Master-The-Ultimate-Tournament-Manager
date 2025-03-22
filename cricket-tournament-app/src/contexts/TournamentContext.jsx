import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { generatePlayerPool } from '../utils/playerGenerator';
import { getFromStorage, saveToStorage, getSingleTournament as getStoredTournament } from '../utils/storage';

// Define storage key constants
const STORAGE_KEY = 'cricket_tournaments';

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
      const storedTournaments = getFromStorage(STORAGE_KEY, {});
      console.log('Loaded tournaments from storage:', storedTournaments);
      setTournaments(storedTournaments || {});
    } catch (error) {
      console.error('Error loading tournaments:', error);
      setTournaments({}); // Ensure tournaments is at least an empty object
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate a unique 6-digit code
  const generateUniqueCode = () => {
    const min = 100000; // 6 digits
    const max = 999999;
    let code;
    
    // Ensure tournaments is an object before using Object.values
    const tournamentsObj = tournaments || {};
    
    // Keep generating until we find a unique one
    do {
      code = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (
      Object.values(tournamentsObj).some(
        t => t?.captainCode === code.toString() || t?.viewerCode === code.toString()
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
      
      // Update state with new tournament
      const updatedTournaments = {
        ...tournaments,
        [tournamentId]: newTournament
      };
      
      // Save all tournaments to localStorage
      saveToStorage(STORAGE_KEY, updatedTournaments);
      
      // Update state
      setTournaments(updatedTournaments);
      
      // Set as current tournament
      setCurrentTournament(newTournament);
      
      console.log('Tournament created successfully:', newTournament);
      
      return { tournamentId, captainCode, viewerCode };
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw new Error('Failed to create tournament. Please try again.');
    }
  };

  // Get a tournament by ID
  const getTournament = (tournamentId) => {
    try {
      console.log('Getting tournament with ID:', tournamentId);
      
      // Try to get from state first
      if (tournaments && tournaments[tournamentId]) {
        console.log('Tournament found in state:', tournaments[tournamentId]);
        return tournaments[tournamentId];
      }
      
      // If not in state, try to get from storage directly
      const storedTournaments = getFromStorage(STORAGE_KEY, {});
      if (storedTournaments[tournamentId]) {
        const tournament = storedTournaments[tournamentId];
        
        // Update state
        setTournaments(prev => ({
          ...prev,
          [tournamentId]: tournament
        }));
        
        return tournament;
      }
      
      console.error(`Tournament with ID ${tournamentId} not found`);
      throw new Error('Tournament not found.');
    } catch (error) {
      console.error('Error getting tournament:', error);
      throw new Error('Failed to load tournament. Please try again.');
    }
  };

  

  // Join tournament (with code)
  // Update the joinTournament function to better track captains:
  const joinTournament = (code, isViewerMode) => {
    try {
      console.log(`Attempting to join with code: ${code}, as ${isViewerMode ? 'viewer' : 'captain'}`);
      const role = isViewerMode ? 'viewer' : 'captain';
      
      // Always convert code to string for comparison
      const codeString = String(code).trim();
      
      // Get tournaments directly from localStorage to ensure we have the latest
      const storageKey = 'cricket_tournaments';
      let storedItem = localStorage.getItem(storageKey);
      let allTournaments = {};
      
      if (storedItem) {
        try {
          const storageObj = JSON.parse(storedItem);
          allTournaments = storageObj.data || {};
        } catch (err) {
          console.error('Error parsing stored tournaments', err);
        }
      }
      
      console.log('Available tournaments:', Object.keys(allTournaments).length);
      
      // Find tournament with matching code
      const tournament = Object.values(allTournaments).find(t => {
        if (!t) return false;
        
        // Compare as strings to avoid type issues
        const captainMatch = !isViewerMode && String(t.captainCode) === codeString;
        const viewerMatch = isViewerMode && String(t.viewerCode) === codeString;
        
        return captainMatch || viewerMatch;
      });
      
      if (!tournament) {
        console.error('No tournament found with code:', codeString);
        throw new Error('Invalid tournament code.');
      }
      
      console.log('Tournament found:', tournament.id, tournament.name);
      
      // Update connected users
      let updatedTournament = { ...tournament };
      const userId = Math.random().toString(36).substring(2, 15);
      
      if (!isViewerMode) {
        // For captain, generate origin identifier (using port to differentiate)
        const portId = window.location.port || '3000';
        const originId = `${window.location.hostname}:${portId}`;
        
        // Initialize or get existing connected users
        const connectedUsers = updatedTournament.connectedUsers || [];
        
        // Check if this origin is already connected as a captain
        const existingCaptain = connectedUsers.find(u => 
          u.role === 'captain' && u.originId === originId
        );
        
        if (existingCaptain) {
          console.log('This origin already connected as a captain - updating');
          
          // Update existing captain's timestamp
          updatedTournament = {
            ...tournament,
            connectedUsers: connectedUsers.map(u => 
              u.originId === originId && u.role === 'captain'
                ? { ...u, lastActive: Date.now() }
                : u
            )
          };
        } else {
          // Add the new captain with origin information
          updatedTournament = {
            ...tournament,
            connectedUsers: [
              ...connectedUsers,
              {
                id: userId,
                role: 'captain',
                joinTime: Date.now(),
                lastActive: Date.now(),
                code: codeString,
                originId: originId,
                port: portId
              }
            ]
          };
        }
        
        // Count distinct captains by origin
        const distinctCaptains = new Set();
        updatedTournament.connectedUsers
          .filter(u => u.role === 'captain')
          .forEach(u => distinctCaptains.add(u.originId || u.id));
        
        console.log(`Captain status: ${distinctCaptains.size} of ${updatedTournament.numTeams} distinct captains connected`);
      } else {
        // For viewers, track them with origin info too
        const portId = window.location.port || '3000';
        const originId = `${window.location.hostname}:${portId}`;
        
        updatedTournament = {
          ...tournament,
          connectedUsers: [
            ...(tournament.connectedUsers || []),
            {
              id: userId,
              role: 'viewer',
              joinTime: Date.now(),
              originId: originId,
              port: portId
            }
          ]
        };
      }
      
      // Save updated tournament to localStorage with proper structure
      allTournaments[tournament.id] = updatedTournament;
      
      localStorage.setItem(storageKey, JSON.stringify({
        data: allTournaments,
        timestamp: Date.now()
      }));
      
      console.log('Tournament updated and saved to localStorage');
      
      // Update React state
      setTournaments(prev => ({
        ...prev,
        [updatedTournament.id]: updatedTournament
      }));
      
      setCurrentTournament(updatedTournament);
      
      // Count distinct captains for return
      const distinctCaptainCount = new Set(
        updatedTournament.connectedUsers
          .filter(u => u.role === 'captain')
          .map(u => u.originId || u.id)
      ).size;
      
      // Return the expected object structure
      return { 
        tournamentId: updatedTournament.id, 
        tournamentData: updatedTournament,
        captainCount: distinctCaptainCount,
        totalTeams: updatedTournament.numTeams
      };
    } catch (error) {
      console.error('Error joining tournament:', error);
      throw new Error('Failed to join tournament. Please check your code.');
    }
  };
  
  // Update the startAuction function:
  // Add this state at the top of your component/context
const [isTestMode, setIsTestMode] = useState(false);

const startAuction = async (tournamentId) => {
  try {
    console.log('Starting auction for tournament:', tournamentId);
    
    // Get latest tournament data directly from localStorage
    const storageKey = 'cricket_tournaments';
    
    let storedItem = localStorage.getItem(storageKey);
    let allTournaments = {};
    
    if (storedItem) {
      try {
        const storageObj = JSON.parse(storedItem);
        allTournaments = storageObj.data || {};
      } catch (err) {
        console.error('Error parsing stored tournaments', err);
      }
    }
    
    const tournament = allTournaments[tournamentId];
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Check if all captains have joined - SKIP IN TEST MODE
    if (!isTestMode) {
      // Count distinct captains by origin
      const connectedUsers = tournament.connectedUsers || [];
      const distinctCaptainOrigins = new Set();
      
      connectedUsers
        .filter(u => u.role === 'captain')
        .forEach(u => distinctCaptainOrigins.add(u.originId || u.id));
      
      const connectedCaptainsCount = distinctCaptainOrigins.size;
      const requiredCaptains = tournament.numTeams;
      
      console.log(`Connected distinct captains: ${connectedCaptainsCount} of ${requiredCaptains} required`);
      console.log('Captain origins:', Array.from(distinctCaptainOrigins));
      
      // Check if all captains have joined
      if (connectedCaptainsCount < requiredCaptains) {
        throw new Error(`Waiting for all captains to join. ${connectedCaptainsCount} of ${requiredCaptains} captains connected.`);
      }
    } else {
      console.log('TEST MODE: Bypassing captain validation');
    }
    
    // Update tournament status
    const updatedTournament = {
      ...tournament,
      status: 'auction',
      currentPhase: 'auction-setup',
      updatedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    allTournaments[tournamentId] = updatedTournament;
    localStorage.setItem(storageKey, JSON.stringify({
      data: allTournaments,
      timestamp: Date.now()
    }));
    
    // Update state
    setTournaments(prev => ({
      ...prev,
      [tournamentId]: updatedTournament
    }));
    
    if (currentTournament && currentTournament.id === tournamentId) {
      setCurrentTournament(updatedTournament);
    }
    
    console.log('Auction started successfully');
    return updatedTournament;
  } catch (error) {
    console.error('Error starting auction:', error);
    throw error;
  }
};
  // End auction
  const endAuction = async (tournamentId) => {
    try {
      // Get tournament
      const tournament = tournaments[tournamentId] || getTournament(tournamentId);
      
      if (!tournament) {
        throw new Error('Tournament not found');
      }
      
      // Update tournament status
      const updatedTournament = {
        ...tournament,
        status: 'post-auction',
        currentPhase: 'team-review',
        updatedAt: new Date().toISOString()
      };
      
      // Update state and storage
      const updatedTournaments = {
        ...tournaments,
        [tournamentId]: updatedTournament
      };
      
      saveToStorage(STORAGE_KEY, updatedTournaments);
      setTournaments(updatedTournaments);
      
      if (currentTournament && currentTournament.id === tournamentId) {
        setCurrentTournament(updatedTournament);
      }
      
      return updatedTournament;
    } catch (error) {
      console.error('Error ending auction:', error);
      throw new Error('Failed to end auction. Please try again.');
    }
  };

  // Update a tournament
  const updateTournament = (tournamentId, updates) => {
    try {
      // Get current tournaments
      let currentTournamentsObj = { ...tournaments };
      
      // Check if tournament exists
      if (!currentTournamentsObj[tournamentId]) {
        const storedTournaments = getFromStorage(STORAGE_KEY, {});
        if (!storedTournaments[tournamentId]) {
          throw new Error('Tournament not found.');
        }
        currentTournamentsObj[tournamentId] = storedTournaments[tournamentId];
      }
      
      const updatedTournament = {
        ...currentTournamentsObj[tournamentId],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Update tournaments object
      currentTournamentsObj[tournamentId] = updatedTournament;
      
      // Save to localStorage
      saveToStorage(STORAGE_KEY, currentTournamentsObj);
      
      // Update state
      setTournaments(currentTournamentsObj);
      
      // Update current tournament if it's the one being updated
      if (currentTournament && currentTournament.id === tournamentId) {
        setCurrentTournament(updatedTournament);
      }
      
      return updatedTournament;
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw new Error('Failed to update tournament. Please try again.');
    }
  };
  const importTournament = (exportString) => {
    try {
      // Decode from base64
      const exportData = JSON.parse(atob(exportString));
      
      // Validate required fields
      if (!exportData.id || !exportData.captainCode || !exportData.viewerCode) {
        throw new Error('Invalid tournament data format');
      }
      
      // Get existing tournaments
      const allTournaments = getFromStorage(STORAGE_KEY, {});
      
      // Check if we already have this tournament
      if (allTournaments[exportData.id]) {
        return exportData.id;
      }
      
      // Get the full tournament from the original source
      // In a real app, this would be an API call
      // For dev testing, prompt for the full data
      
      return exportData.id;
    } catch (error) {
      console.error('Error importing tournament:', error);
      throw new Error('Failed to import tournament');
    }
  };
  const exportTournament = (tournamentId) => {
    try {
      const tournament = tournaments[tournamentId] || getTournament(tournamentId);
      if (!tournament) {
        throw new Error('Tournament not found');
      }
      
      // Create a shareable format with essential info
      const exportData = {
        id: tournament.id,
        name: tournament.name,
        captainCode: tournament.captainCode,
        viewerCode: tournament.viewerCode,
        exportTime: Date.now()
      };
      
      // Encode to base64 for easier sharing
      const exportString = btoa(JSON.stringify(exportData));
      return exportString;
    } catch (error) {
      console.error('Error exporting tournament:', error);
      throw new Error('Failed to export tournament data');
    }
  };

  // Add this debug function to your TournamentContext:
const debugCaptainConnections = (tournamentId) => {
  try {
    // Get latest from storage
    const storageKey = 'cricket_tournaments';
    const storedItem = localStorage.getItem(storageKey);
    if (!storedItem) return;
    
    const storageObj = JSON.parse(storedItem);
    const allTournaments = storageObj.data || {};
    const tournament = allTournaments[tournamentId];
    
    if (!tournament) return;
    
    // Get connected users
    const connectedUsers = tournament.connectedUsers || [];
    const captains = connectedUsers.filter(u => u.role === 'captain');
    
    console.log('=== CONNECTED CAPTAINS ===');
    console.log(`Total entries: ${captains.length}`);
    
    // Group by origin
    const originMap = {};
    captains.forEach(c => {
      const origin = c.originId || c.id;
      if (!originMap[origin]) {
        originMap[origin] = [];
      }
      originMap[origin].push(c);
    });
    
    console.log(`Distinct captain origins: ${Object.keys(originMap).length}`);
    console.log('Origins:', Object.keys(originMap));
    
    return Object.keys(originMap).length;
  } catch (e) {
    console.error('Debug error:', e);
  }
};

  // Add isTestMode and setIsTestMode to the contextValue object
const contextValue = {
  tournaments,
  currentTournament,
  loading,
  createTournament,
  joinTournament,
  getTournament,
  updateTournament,
  startAuction,
  endAuction,
  exportTournament,
  importTournament,
  debugCaptainConnections,
  isTestMode, // Add this
  setIsTestMode // Add this
};

  return (
    <TournamentContext.Provider value={contextValue}>
      {children}
    </TournamentContext.Provider>
  );
};

export default TournamentContext;