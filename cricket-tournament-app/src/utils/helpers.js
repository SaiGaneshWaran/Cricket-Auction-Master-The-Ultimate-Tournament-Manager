/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
export const generateUniqueId = () => {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };
  
  /**
   * Format a currency amount in Crore ₹
   * @param {number} amount - The amount to format
   * @returns {string} Formatted amount
   */
  export const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0 Cr';
    return `${amount.toFixed(2)} Cr`;
  };
  
  /**
   * Format overs (e.g., 4.3 for 4 overs and 3 balls)
   * @param {number} overs - The number of complete overs
   * @param {number} balls - The number of balls in the current over
   * @returns {string} Formatted overs
   */
  export const formatOvers = (overs, balls = 0) => {
    return `${overs}.${balls}`;
  };
  
  /**
   * Format a date to a readable string
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Get a random element from an array
   * @param {Array} array - The array to pick from
   * @returns {*} A random element from the array
   */
  export const getRandomElement = (array) => {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  };
  
  /**
   * Truncate a string to a maximum length
   * @param {string} str - The string to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated string
   */
  export const truncateString = (str, maxLength = 30) => {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  };
  
  /**
   * Generate a random color
   * @returns {string} A random hex color
   */
  export const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  
  /**
   * Check if a color is dark
   * @param {string} color - Hex color
   * @returns {boolean} True if the color is dark
   */
  export const isColorDark = (color) => {
    // Remove the hash at the start if it exists
    color = color.replace(/^#/, '');
    
    // Parse the color
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    
    // Calculate brightness (perceived)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return true if dark
    return brightness < 128;
  };
  
  /**
   * Shuffle an array (Fisher-Yates algorithm)
   * @param {Array} array - The array to shuffle
   * @returns {Array} Shuffled array
   */
  export const shuffleArray = (array) => {
    const result = [...array];
    
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    
    return result;
  };
  
  /**
   * Debounce a function
   * @param {Function} func - The function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  export const debounce = (func, delay = 300) => {
    let timeout;
    
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };
  
  /**
   * Get a random item based on weights
   * @param {Array} items - Array of items
   * @param {Array} weights - Array of corresponding weights
   * @returns {*} Randomly selected item
   */
  export const weightedRandomChoice = (items, weights) => {
    if (!items || !weights || items.length !== weights.length || items.length === 0) {
      return null;
    }
    
    // Calculate total weight
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // Get a random number between 0 and totalWeight
    let random = Math.random() * totalWeight;
    
    // Find the item based on the random number
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random < 0) {
        return items[i];
      }
    }
    
    // Fallback in case of rounding errors
    return items[items.length - 1];
  };
  
  /**
   * Group an array of objects by a key
   * @param {Array} array - Array of objects
   * @param {string} key - Key to group by
   * @returns {Object} Grouped object
   */
  export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
      const group = item[key];
      result[group] = result[group] || [];
      result[group].push(item);
      return result;
    }, {});
  };
  
  /**
   * Deep clone an object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
  
  /**
   * Get initials from a name
   * @param {string} name - Full name
   * @returns {string} Initials
   */
  export const getInitials = (name) => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };