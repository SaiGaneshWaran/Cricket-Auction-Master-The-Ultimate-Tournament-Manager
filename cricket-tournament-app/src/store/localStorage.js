// localStorage.js - Utility functions for managing local storage data

// Save data to localStorage
export const saveToLocalStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

// Get data from localStorage
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error(`Error retrieving from localStorage (${key}):`, error);
    return defaultValue;
  }
};

// Remove data from localStorage
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

// Clear all app data from localStorage
export const clearAppData = () => {
  try {
    const appKeys = [
      'tournamentData',
      'auctionData',
      'matchesData',
      'leaderboardData'
    ];
    
    appKeys.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error clearing app data from localStorage:', error);
    return false;
  }
};

// Export all data to a JSON file
export const exportAllData = () => {
  try {
    const appKeys = [
      'tournamentData',
      'auctionData',
      'matchesData',
      'leaderboardData'
    ];
    
    const exportData = {};
    appKeys.forEach(key => {
      const data = getFromLocalStorage(key);
      if (data) {
        exportData[key] = data;
      }
    });
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.download = `cricket_tournament_data_${new Date().toISOString().slice(0, 10)}.json`;
    link.href = url;
    link.click();
    
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    return false;
  }
};

// Import data from a JSON file
export const importData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    // Validate data structure
    const requiredKeys = ['tournamentData'];
    const missingKeys = requiredKeys.filter(key => !data[key]);
    
    if (missingKeys.length > 0) {
      throw new Error(`Missing required data: ${missingKeys.join(', ')}`);
    }
    
    // Import each key to localStorage
    Object.entries(data).forEach(([key, value]) => {
      saveToLocalStorage(key, value);
    });
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};