const STORAGE_KEYS = {
    TOURNAMENT_CONFIG: 'tournamentConfig',
    TEAMS: 'teams',
    PLAYERS: 'players',
    SOLD_PLAYERS: 'soldPlayers',
    MATCHES: 'matches',
    USER_SETTINGS: 'userSettings'
  };
  
  export const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving to localStorage: ${error.message}`);
      return false;
    }
  };
  
  export const getFromStorage = (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage: ${error.message}`);
      return defaultValue;
    }
  };
  
  export const removeFromStorage = (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage: ${error.message}`);
      return false;
    }
  };
  
  export const clearAllStorage = () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error(`Error clearing localStorage: ${error.message}`);
      return false;
    }
  };
  
  // Tournament specific functions
  export const saveTournamentConfig = (config) => {
    return saveToStorage(STORAGE_KEYS.TOURNAMENT_CONFIG, config);
  };
  
  export const getTournamentConfig = () => {
    return getFromStorage(STORAGE_KEYS.TOURNAMENT_CONFIG, {});
  };
  
  // Team specific functions
  export const saveTeams = (teams) => {
    return saveToStorage(STORAGE_KEYS.TEAMS, teams);
  };
  
  export const getTeams = () => {
    return getFromStorage(STORAGE_KEYS.TEAMS, []);
  };
  
  export const updateTeam = (teamId, updates) => {
    const teams = getTeams();
    const updatedTeams = teams.map(team => 
      team.id === teamId ? { ...team, ...updates } : team
    );
    return saveTeams(updatedTeams);
  };
  
  // Player specific functions
  export const saveSoldPlayer = (player) => {
    const soldPlayers = getFromStorage(STORAGE_KEYS.SOLD_PLAYERS, []);
    soldPlayers.push({
      ...player,
      soldTimestamp: new Date().toISOString()
    });
    return saveToStorage(STORAGE_KEYS.SOLD_PLAYERS, soldPlayers);
  };
  
  export const getSoldPlayers = () => {
    return getFromStorage(STORAGE_KEYS.SOLD_PLAYERS, []);
  };
  
  // Match specific functions
  export const saveMatch = (match) => {
    const matches = getFromStorage(STORAGE_KEYS.MATCHES, []);
    matches.push({
      ...match,
      timestamp: new Date().toISOString()
    });
    return saveToStorage(STORAGE_KEYS.MATCHES, matches);
  };
  
  export const getMatches = () => {
    return getFromStorage(STORAGE_KEYS.MATCHES, []);
  };
  
  export const updateMatch = (matchId, updates) => {
    const matches = getMatches();
    const updatedMatches = matches.map(match => 
      match.id === matchId ? { ...match, ...updates } : match
    );
    return saveToStorage(STORAGE_KEYS.MATCHES, updatedMatches);
  };
  
  export default {
    STORAGE_KEYS,
    saveToStorage,
    getFromStorage,
    removeFromStorage,
    clearAllStorage,
    saveTournamentConfig,
    getTournamentConfig,
    saveTeams,
    getTeams,
    updateTeam,
    saveSoldPlayer,
    getSoldPlayers,
    saveMatch,
    getMatches,
    updateMatch
  };