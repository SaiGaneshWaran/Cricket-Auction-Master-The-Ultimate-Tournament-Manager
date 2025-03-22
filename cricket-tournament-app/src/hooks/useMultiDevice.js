// src/hooks/useMultiDevice.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { getFromStorage, saveToStorage } from '../utils/storage';

/**
 * Custom hook for syncing state across multiple devices/tabs
 * @param {string} storageKey - Key for localStorage
 * @param {string} clientId - Unique ID for this client/device
 * @param {any} initialValue - Initial value
 * @param {number} syncInterval - Sync interval in milliseconds (default: 1000ms)
 * @returns {[any, Function]} - [syncedValue, updateValue]
 */
const useMultiDevice = (storageKey, clientId, initialValue = null, syncInterval = 1000) => {
  const [syncedValue, setSyncedValue] = useState(initialValue);
  const lastSyncTime = useRef(0);
  const lastUpdateTime = useRef(0);
  
  // Load initial value from storage if available
  useEffect(() => {
    const storedValue = getFromStorage(storageKey);
    if (storedValue) {
      setSyncedValue(storedValue);
      lastSyncTime.current = storedValue.lastSyncTime || Date.now();
    } else if (initialValue) {
      // Save initial value with sync metadata
      const valueWithMeta = {
        ...initialValue,
        lastSyncTime: Date.now(),
        lastUpdatedBy: clientId
      };
      saveToStorage(storageKey, valueWithMeta);
      setSyncedValue(valueWithMeta);
    }
  }, [storageKey, initialValue, clientId]);

  // Sync with localStorage periodically
  useEffect(() => {
    const syncWithStorage = () => {
      try {
        const storedValue = getFromStorage(storageKey);
        
        // If no stored value or it's older than our last update, do nothing
        if (!storedValue || !storedValue.lastSyncTime) return;
        
        // If stored value is newer than our last sync, update local state
        if (storedValue.lastSyncTime > lastSyncTime.current && 
            (!storedValue.lastUpdatedBy || storedValue.lastUpdatedBy !== clientId)) {
          setSyncedValue(storedValue);
          lastSyncTime.current = storedValue.lastSyncTime;
        }
      } catch (error) {
        console.error('Error syncing with storage:', error);
      }
    };

    // Set up periodic sync
    const intervalId = setInterval(syncWithStorage, syncInterval);
    
    // Set up storage event listener for immediate sync when another tab changes data
    const handleStorageChange = (event) => {
      if (event.key === storageKey) {
        syncWithStorage();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storageKey, syncInterval, clientId]);

  // Function to update the value
  const updateValue = useCallback((newValue) => {
    try {
      // Ensure we have a valid object
      if (!newValue) return;
      
      // Add sync metadata
      const valueWithMeta = {
        ...newValue,
        lastSyncTime: Date.now(),
        lastUpdatedBy: clientId
      };
      
      // Update localStorage
      saveToStorage(storageKey, valueWithMeta);
      
      // Update local state
      setSyncedValue(valueWithMeta);
      lastSyncTime.current = valueWithMeta.lastSyncTime;
      lastUpdateTime.current = valueWithMeta.lastSyncTime;
      
      return valueWithMeta;
    } catch (error) {
      console.error('Error updating synced value:', error);
      return null;
    }
  }, [storageKey, clientId]);

  return [syncedValue, updateValue];
};

export default useMultiDevice;