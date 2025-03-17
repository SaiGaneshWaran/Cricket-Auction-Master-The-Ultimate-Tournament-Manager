// src/utils/formatters.js

/**
 * Format a currency value in IPL-style crores and lakhs
 * @param {number} value - Value in lakhs
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  // 1 crore = 100 lakhs
  if (value >= 100) {
    const crores = Math.floor(value / 100);
    const lakhs = value % 100;
    
    if (lakhs === 0) {
      return `₹${crores} Cr`;
    }
    
    return `₹${crores}.${lakhs.toString().padStart(2, '0')} Cr`;
  }
  
  return `₹${value} L`;
};

/**
 * Format overs as a string (e.g., "4.3" for 4 overs and 3 balls)
 * @param {number} overs - Overs value (e.g., 4.3 for 4 overs and 3 balls)
 * @returns {string} Formatted overs string
 */
export const formatOvers = (overs) => {
  if (typeof overs !== 'number') return '0.0';
  
  const fullOvers = Math.floor(overs);
  const balls = Math.round((overs - fullOvers) * 10);
  
  return `${fullOvers}.${balls}`;
};

/**
 * Format a date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'TBD';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format a percentage
 * @param {number} value - Value to format
 * @param {number} precision - Decimal precision
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, precision = 1) => {
  if (typeof value !== 'number') return '0%';
  
  return `${value.toFixed(precision)}%`;
};

/**
 * Format run rate
 * @param {number} runRate - Run rate value
 * @returns {string} Formatted run rate
 */
export const formatRunRate = (runRate) => {
  if (typeof runRate !== 'number') return '0.00';
  
  return runRate.toFixed(2);
};

/**
 * Format player name (abbreviated if needed)
 * @param {string} name - Full name
 * @param {number} maxLength - Maximum length
 * @returns {string} Formatted name
 */
export const formatPlayerName = (name, maxLength = 15) => {
  if (!name) return '';
  
  if (name.length <= maxLength) return name;
  
  // Split by spaces
  const parts = name.split(' ');
  
  if (parts.length === 1) {
    // Single name, just truncate
    return `${name.substring(0, maxLength - 2)}..`;
  }
  
  // First name initial + last name
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
};

/**
 * Format team budget remaining
 * @param {number} remaining - Remaining budget in lakhs
 * @param {number} total - Total budget in lakhs
 * @returns {string} Formatted budget with percentage
 */
export const formatBudgetRemaining = (remaining, total) => {
  const percentage = ((remaining / total) * 100).toFixed(0);
  return `${formatCurrency(remaining)} (${percentage}%)`;
};

/**
 * Format strike rate
 * @param {number} runs - Runs scored
 * @param {number} balls - Balls faced
 * @returns {string} Formatted strike rate
 */
export const formatStrikeRate = (runs, balls) => {
  if (!balls) return '0.00';
  
  const strikeRate = (runs / balls) * 100;
  return strikeRate.toFixed(2);
};

/**
 * Format bowling economy
 * @param {number} runs - Runs conceded
 * @param {number} overs - Overs bowled
 * @returns {string} Formatted economy rate
 */
export const formatEconomy = (runs, overs) => {
  if (!overs) return '0.00';
  
  // Convert overs to balls (e.g., 4.3 overs = 4*6 + 3 = 27 balls)
  const fullOvers = Math.floor(overs);
  const extraBalls = Math.round((overs - fullOvers) * 10);
  const totalBalls = (fullOvers * 6) + extraBalls;
  
  if (totalBalls === 0) return '0.00';
  
  const economy = (runs / totalBalls) * 6;
  return economy.toFixed(2);
};

/**
 * Format match result for display
 * @param {Object} result - Match result object
 * @param {Array} teams - Teams array
 * @returns {string} Formatted result string
 */
export const formatMatchResult = (result, teams) => {
  if (!result || !result.winner) return 'Match Tied';
  
  const winningTeam = teams.find(team => team.id === result.winner);
  
  if (!winningTeam) return 'Result Pending';
  
  return `${winningTeam.name} won by ${result.margin}`;
};

/**
 * Format required runs
 * @param {number} target - Target score
 * @param {number} current - Current score
 * @returns {string} Formatted required runs
 */
export const formatRequiredRuns = (target, current) => {
  if (!target || !current) return 'N/A';
  
  const required = target - current;
  
  if (required <= 0) return 'Target Achieved';
  
  return `${required} runs required`;
};

/**
 * Format auction timer
 * @param {number} secondsLeft - Seconds remaining
 * @returns {string} Formatted time string
 */
export const formatAuctionTimer = (secondsLeft) => {
  if (secondsLeft <= 0) return '00:00';
  
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};