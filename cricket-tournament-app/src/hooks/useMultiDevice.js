import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for syncing state between multiple devices/tabs
 * Uses a combination of localStorage and BroadcastChannel API
 * With localStorage fallback for older browsers
 * 
 * @param {string} channelName - Unique name for the sync channel
 * @param {string} clientId - Unique ID for the current client/device
 * @param {object} initialState - Initial state value
 * @returns {[object, function]} - [state, updateState]
 */
const useMultiDevice = (channelName, clientId, initialState = {}) => {
  // State for our local copy of the shared data
  const [state, setState] = useState(initialState);
  
  // Reference to our communication channel
  const [channel, setChannel] = useState(null);
  
  // Storage key for localStorage fallback
  const storageKey = `multi_device_${channelName}`;
  
  // Setup the channel when the component mounts
  useEffect(() => {
    let broadcastChannel = null;
    
    // Try to use BroadcastChannel API (modern browsers)
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        broadcastChannel = new BroadcastChannel(channelName);
        
        // Setup message listener
        broadcastChannel.onmessage = (event) => {
          // Don't process our own messages
          if (event.data.sender !== clientId) {
            processIncomingMessage(event.data);
          }
        };
        
        setChannel(broadcastChannel);
      }
    } catch (error) {
      console.warn('BroadcastChannel not supported, falling back to localStorage');
    }
    
    // Load initial state from localStorage
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // Only use stored data if it's newer than our initial state
        if (!initialState.timestamp || (parsedData.timestamp > initialState.timestamp)) {
          setState(parsedData.state);
        }
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
    
    // Setup storage event listener for localStorage fallback
    const handleStorageChange = (e) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.sender !== clientId) {
            processIncomingMessage(data);
          }
        } catch (error) {
          console.error('Error parsing storage event data:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup function
    return () => {
      // Close BroadcastChannel
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      
      // Remove storage event listener
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [channelName, clientId, initialState, storageKey]);
  
  // Process incoming messages from other clients
  const processIncomingMessage = useCallback((data) => {
    if (data.type === 'state_update') {
      setState(data.state);
    } else if (data.type === 'request_state') {
      // Another client is requesting the latest state
      sendMessage({
        type: 'state_response',
        state: state,
        timestamp: Date.now()
      });
    }
  }, [state]);
  
  // Send a message to other clients
  const sendMessage = useCallback((message) => {
    const messageWithMetadata = {
      ...message,
      sender: clientId,
      timestamp: Date.now()
    };
    
    // Try to use BroadcastChannel first
    if (channel) {
      channel.postMessage(messageWithMetadata);
    }
    
    // Always use localStorage as fallback
    localStorage.setItem(storageKey, JSON.stringify(messageWithMetadata));
    
    // Trigger storage event manually for same-tab communication
    window.dispatchEvent(new StorageEvent('storage', {
      key: storageKey,
      newValue: JSON.stringify(messageWithMetadata)
    }));
  }, [channel, clientId, storageKey]);
  
  // Function to update the shared state
  const updateState = useCallback((newState) => {
    // If newState is a function, call it with the current state
    const updatedState = typeof newState === 'function' 
      ? newState(state) 
      : newState;
    
    // Update local state
    setState(updatedState);
    
    // Broadcast the update
    sendMessage({
      type: 'state_update',
      state: updatedState
    });
  }, [state, sendMessage]);
  
  // Request latest state from other clients when we join
  useEffect(() => {
    if (channel) {
      sendMessage({
        type: 'request_state'
      });
    }
  }, [channel, sendMessage]);
  
  return [state, updateState];
};

export default useMultiDevice;