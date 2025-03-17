// Constants
const TOURNAMENT_PREFIX = 'cricket_tournament_';
const TOURNAMENTS_INDEX = 'cricket_tournaments_index';

/**
 * Save a tournament to localStorage
 * @param {string} tournamentId - The tournament ID
 * @param {Object} tournamentData - The tournament data to save
 */
export const saveTournamentToStorage = (tournamentId, tournamentData) => {
  try {
    // Check if we're in a browser environment
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available');
      return;
    }
    
    // Save tournament data
    localStorage.setItem(
      `${TOURNAMENT_PREFIX}${tournamentId}`, 
      JSON.stringify(tournamentData)
    );
    
    // Update tournaments index
    const index = getTournamentsIndex();
    if (!index.includes(tournamentId)) {
      index.push(tournamentId);
      localStorage.setItem(TOURNAMENTS_INDEX, JSON.stringify(index));
    }
  } catch (error) {
    console.error('Error saving tournament to storage:', error);
    throw new Error('Failed to save tournament data locally');
  }
};

/**
 * Get a tournament from localStorage
 * @param {string} tournamentId - The tournament ID
 * @returns {Object} The tournament data
 */
export const getTournamentFromStorage = (tournamentId) => {
  try {
    // Check if we're in a browser environment
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available');
      return null;
    }
    
    const data = localStorage.getItem(`${TOURNAMENT_PREFIX}${tournamentId}`);
    
    if (!data) {
      return null;
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting tournament from storage:', error);
    throw new Error('Failed to retrieve tournament data');
  }
};

/**
 * Get all tournaments from localStorage
 * @returns {Object} Map of tournament IDs to tournament data
 */
export const getAllTournamentsFromStorage = () => {
  try {
    // Check if we're in a browser environment
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available');
      return {};
    }
    
    const index = getTournamentsIndex();
    const tournaments = {};
    
    index.forEach(id => {
      const tournament = getTournamentFromStorage(id);
      if (tournament) {
        tournaments[id] = tournament;
      }
    });
    
    return tournaments;
  } catch (error) {
    console.error('Error getting all tournaments from storage:', error);
    throw new Error('Failed to retrieve tournament data');
  }
};

/**
 * Delete a tournament from localStorage
 * @param {string} tournamentId - The tournament ID
 */
export const deleteTournamentFromStorage = (tournamentId) => {
  try {
    // Check if we're in a browser environment
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available');
      return;
    }
    
    // Remove tournament data
    localStorage.removeItem(`${TOURNAMENT_PREFIX}${tournamentId}`);
    
    // Update tournaments index
    const index = getTournamentsIndex();
    const newIndex = index.filter(id => id !== tournamentId);
    localStorage.setItem(TOURNAMENTS_INDEX, JSON.stringify(newIndex));
  } catch (error) {
    console.error('Error deleting tournament from storage:', error);
    throw new Error('Failed to delete tournament data');
  }
};

/**
 * Get the index of tournaments from localStorage
 * @returns {Array} Array of tournament IDs
 */
export const getTournamentsIndex = () => {
  try {
    // Check if we're in a browser environment
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available');
      return [];
    }
    
    const index = localStorage.getItem(TOURNAMENTS_INDEX);
    
    if (!index) {
      return [];
    }
    
    return JSON.parse(index);
  } catch (error) {
    console.error('Error getting tournaments index from storage:', error);
    throw new Error('Failed to retrieve tournaments index');
  }
};

/**
 * Clear all tournament data from localStorage
 */
export const clearAllTournamentsFromStorage = () => {
  try {
    // Check if we're in a browser environment
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available');
      return;
    }
    
    const index = getTournamentsIndex();
    
    // Remove all tournament data
    index.forEach(id => {
      localStorage.removeItem(`${TOURNAMENT_PREFIX}${id}`);
    });
    
    // Clear index
    localStorage.removeItem(TOURNAMENTS_INDEX);
  } catch (error) {
    console.error('Error clearing all tournaments from storage:', error);
    throw new Error('Failed to clear tournament data');
  }
};

/**
 * Get the total storage usage for all tournament data
 * @returns {Object} Storage usage information
 */
export const getTournamentStorageUsage = () => {
  try {
    // Check if we're in a browser environment
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage is not available');
      return { total: 0, tournaments: {} };
    }
    
    const index = getTournamentsIndex();
    const usage = {
      total: 0,
      tournaments: {}
    };
    
    // Calculate storage for each tournament
    index.forEach(id => {
      const key = `${TOURNAMENT_PREFIX}${id}`;
      const data = localStorage.getItem(key);
      
      if (data) {
        const size = new Blob([data]).size;
        usage.tournaments[id] = size;
        usage.total += size;
      }
    });
    
    return usage;
  } catch (error) {
    console.error('Error calculating tournament storage usage:', error);
    throw new Error('Failed to calculate storage usage');
  }
};

/**
 * Check if localStorage is available and has sufficient space
 * @param {number} requiredSpace - Required space in bytes
 * @returns {boolean} True if storage is available and has sufficient space
 */
export const hasStorageAvailable = (requiredSpace = 5242880) => { // Default 5MB
  try {
    // Check if we're in a browser environment
    if (typeof localStorage === 'undefined') {
      return false;
    }
    
    // Test if we can use localStorage
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    const testResult = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    if (testResult !== testKey) {
      return false;
    }
    
    // Check if we have enough space
    const estimateAvailable = 5242880; // Estimate 5MB
    
    // A more accurate way would be to try storing data incrementally 
    // until we hit the limit, but that's complex and not always reliable
    
    return estimateAvailable >= requiredSpace;
  } catch (error) {
    console.error('Error checking storage availability:', error);
    return false;
  }
};

// Add these general storage functions to your existing storage.js
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};