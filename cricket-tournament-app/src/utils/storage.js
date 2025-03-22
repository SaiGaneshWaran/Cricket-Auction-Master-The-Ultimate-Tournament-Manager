// src/utils/storage.js

// Define constants
const TOURNAMENT_KEY = 'cricket_tournaments';
const DEV_SHARED_KEY = 'cross_origin_tournaments';

/**
 * Save data to localStorage with optional expiration
 * @param {string} key - The storage key
 * @param {any} data - The data to save
 * @param {number} expirationInMinutes - Optional expiration time in minutes
 * @returns {boolean} Success status
 */
export const saveToStorage = (key, data, expirationInMinutes = null) => {
  try {
    // Add expiration timestamp if provided
    const storageObject = {
      data,
      timestamp: Date.now(),
      expiration: expirationInMinutes ? Date.now() + expirationInMinutes * 60 * 1000 : null
    };
    
    // Stringify and save
    localStorage.setItem(key, JSON.stringify(storageObject));
    
    // For tournament data in development mode, also save to sessionStorage for cross-domain access
    if (process.env.NODE_ENV === 'development' && key === TOURNAMENT_KEY) {
      try {
        sessionStorage.setItem(DEV_SHARED_KEY, JSON.stringify({
          data,
          timestamp: Date.now(),
          sharedFromOrigin: window.location.origin
        }));
        console.log('Saved tournament data to shared storage for cross-origin access');
      } catch (err) {
        console.warn('Failed to save to session storage for cross-origin access', err);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Get data from localStorage
 * @param {string} key - The storage key
 * @param {any} defaultValue - Default value if not found or expired
 * @returns {any} The stored data or defaultValue
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    // Get from localStorage
    const storedItem = localStorage.getItem(key);
    let resultData = defaultValue;
    
    if (storedItem) {
      // Parse the stored object
      const storageObject = JSON.parse(storedItem);
      
      // Check expiration if set
      if (storageObject.expiration && storageObject.expiration < Date.now()) {
        localStorage.removeItem(key);
      } else {
        resultData = storageObject.data;
      }
    }
    
    // For tournament data in development, also check sessionStorage for cross-origin data
    if (process.env.NODE_ENV === 'development' && key === TOURNAMENT_KEY) {
      try {
        const sharedItem = sessionStorage.getItem(DEV_SHARED_KEY);
        if (sharedItem) {
          const sharedObject = JSON.parse(sharedItem);
          
          // If shared data exists and is from a different origin, merge with local data
          if (sharedObject.sharedFromOrigin && sharedObject.sharedFromOrigin !== window.location.origin) {
            // Get data from shared storage
            const sharedData = sharedObject.data || {};
            
            // If result is an object (tournaments), merge with local
            if (resultData && typeof resultData === 'object' && !Array.isArray(resultData)) {
              resultData = { ...resultData, ...sharedData };
              console.log('Merged tournaments from shared storage');
            } 
            // If no local data, use shared data
            else if (resultData === defaultValue) {
              resultData = sharedData;
              console.log('Using tournaments from shared storage');
            }
          }
        }
      } catch (err) {
        console.warn('Failed to read from shared storage', err);
      }
    }
    
    return resultData;
  } catch (error) {
    console.error(`Error retrieving from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - The storage key
 * @returns {boolean} Success status
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Clear all data from localStorage
 * @returns {boolean} Success status
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Get all storage keys that match a prefix
 * @param {string} prefix - The key prefix to match
 * @returns {Array} Array of matching keys
 */
export const getStorageKeys = (prefix = '') => {
  const keys = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(prefix)) {
        keys.push(key);
      }
    }
  } catch (error) {
    console.error(`Error getting localStorage keys with prefix (${prefix}):`, error);
  }
  
  return keys;
};

/**
 * Check if a key exists in localStorage
 * @param {string} key - The storage key
 * @returns {boolean} True if key exists
 */
export const hasStorageKey = (key) => {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking localStorage key (${key}):`, error);
    return false;
  }
};

/**
 * Get single tournament by ID - Fixed to use correct key
 * @param {string} tournamentId - The tournament ID
 * @returns {object|null} Tournament object or null if not found
 */
export const getSingleTournament = (tournamentId) => {
  try {
    // Use the proper tournament key and our getFromStorage function
    const tournaments = getFromStorage(TOURNAMENT_KEY, {});
    return tournaments[tournamentId] || null;
  } catch (error) {
    console.error('Error getting tournament from storage:', error);
    return null;
  }
};

/**
 * Export tournament data for sharing between devices/ports
 * @param {string} tournamentId - The tournament ID to export
 * @returns {string} Shareable code containing tournament data
 */
export const exportTournamentCode = (tournamentId) => {
  try {
    const tournaments = getFromStorage(TOURNAMENT_KEY, {});
    const tournament = tournaments[tournamentId];
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Create a shareable data packet with only essential information
    const exportData = {
      id: tournament.id,
      captainCode: tournament.captainCode,
      viewerCode: tournament.viewerCode,
      name: tournament.name,
      fullData: tournament
    };
    
    // Encode to base64 for easier sharing
    return btoa(JSON.stringify(exportData));
  } catch (error) {
    console.error('Error exporting tournament:', error);
    throw new Error('Failed to export tournament');
  }
};

/**
 * Import tournament data from a shared code
 * @param {string} code - The exported tournament code
 * @returns {object} The imported tournament's ID and name
 */
export const importTournamentCode = (code) => {
  try {
    // Decode from base64
    const importData = JSON.parse(atob(code));
    
    // Validate import data
    if (!importData.id || !importData.fullData) {
      throw new Error('Invalid tournament import data');
    }
    
    // Get current tournaments
    const tournaments = getFromStorage(TOURNAMENT_KEY, {});
    
    // Add the imported tournament
    tournaments[importData.id] = importData.fullData;
    
    // Save back to storage
    saveToStorage(TOURNAMENT_KEY, tournaments);
    
    // Also save to shared storage for other tabs/ports
    if (process.env.NODE_ENV === 'development') {
      try {
        sessionStorage.setItem(DEV_SHARED_KEY, JSON.stringify({
          data: tournaments,
          timestamp: Date.now(),
          sharedFromOrigin: window.location.origin
        }));
      } catch (err) {
        console.warn('Failed to save to session storage', err);
      }
    }
    
    return {
      id: importData.id,
      name: importData.name || 'Imported Tournament'
    };
  } catch (error) {
    console.error('Error importing tournament:', error);
    throw new Error('Invalid tournament code');
  }
};

export default {
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  clearStorage,
  getStorageKeys,
  hasStorageKey,
  getSingleTournament,
  exportTournamentCode,
  importTournamentCode,
  TOURNAMENT_KEY
};