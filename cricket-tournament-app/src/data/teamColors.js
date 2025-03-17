// src/data/teamColors.js

/**
 * Predefined color schemes for teams
 * Each scheme has primary and secondary colors plus contrasting text colors
 */
export const teamColorSchemes = [
  {
    id: 'blue-gold',
    name: 'Royal Blue & Gold',
    primary: '#1E3A8A', // Royal Blue
    secondary: '#F59E0B', // Amber
    primaryText: '#FFFFFF', // White text on blue
    secondaryText: '#1F2937', // Dark text on amber
    accent: '#D97706', // Darker amber
  },
  {
    id: 'red-silver',
    name: 'Crimson & Silver',
    primary: '#DC2626', // Red
    secondary: '#D1D5DB', // Gray/Silver
    primaryText: '#FFFFFF', // White text on red
    secondaryText: '#1F2937', // Dark text on silver
    accent: '#B91C1C', // Darker red
  },
  {
    id: 'purple-gold',
    name: 'Royal Purple & Gold',
    primary: '#7E22CE', // Purple
    secondary: '#F59E0B', // Amber/Gold
    primaryText: '#FFFFFF', // White text on purple
    secondaryText: '#1F2937', // Dark text on gold
    accent: '#6B21A8', // Darker purple
  },
  {
    id: 'teal-orange',
    name: 'Teal & Orange',
    primary: '#0D9488', // Teal
    secondary: '#F97316', // Orange
    primaryText: '#FFFFFF', // White text on teal
    secondaryText: '#1F2937', // Dark text on orange
    accent: '#0F766E', // Darker teal
  },
  {
    id: 'green-gold',
    name: 'Emerald & Gold',
    primary: '#059669', // Green
    secondary: '#F59E0B', // Gold
    primaryText: '#FFFFFF', // White text on green
    secondaryText: '#1F2937', // Dark text on gold
    accent: '#047857', // Darker green
  },
  {
    id: 'blue-orange',
    name: 'Navy & Orange',
    primary: '#1E40AF', // Navy Blue
    secondary: '#F97316', // Orange
    primaryText: '#FFFFFF', // White text on navy
    secondaryText: '#1F2937', // Dark text on orange
    accent: '#1E3A8A', // Darker navy
  },
  {
    id: 'pink-blue',
    name: 'Pink & Sky Blue',
    primary: '#DB2777', // Pink
    secondary: '#0EA5E9', // Sky Blue
    primaryText: '#FFFFFF', // White text on pink
    secondaryText: '#1F2937', // Dark text on sky blue
    accent: '#BE185D', // Darker pink
  },
  {
    id: 'yellow-black',
    name: 'Yellow & Black',
    primary: '#EAB308', // Yellow
    secondary: '#1F2937', // Black/Dark Gray
    primaryText: '#1F2937', // Dark text on yellow
    secondaryText: '#FFFFFF', // White text on black
    accent: '#CA8A04', // Darker yellow
  },
  {
    id: 'indigo-pink',
    name: 'Indigo & Pink',
    primary: '#4F46E5', // Indigo
    secondary: '#EC4899', // Pink
    primaryText: '#FFFFFF', // White text on indigo
    secondaryText: '#1F2937', // Dark text on pink
    accent: '#4338CA', // Darker indigo
  },
  {
    id: 'orange-blue',
    name: 'Orange & Blue',
    primary: '#EA580C', // Orange
    secondary: '#2563EB', // Blue
    primaryText: '#FFFFFF', // White text on orange
    secondaryText: '#FFFFFF', // White text on blue
    accent: '#C2410C', // Darker orange
  }
];

/**
 * Team icon options
 * Represented as simple emoji for simplicity
 * In a real app, these would be SVG or image paths
 */
export const teamIcons = [
  { id: 'lions', name: 'Lions', emoji: '🦁' },
  { id: 'tigers', name: 'Tigers', emoji: '🐯' },
  { id: 'eagles', name: 'Eagles', emoji: '🦅' },
  { id: 'sharks', name: 'Sharks', emoji: '🦈' },
  { id: 'dragons', name: 'Dragons', emoji: '🐉' },
  { id: 'panthers', name: 'Panthers', emoji: '🐆' },
  { id: 'wolves', name: 'Wolves', emoji: '🐺' },
  { id: 'bulls', name: 'Bulls', emoji: '🐂' },
  { id: 'falcons', name: 'Falcons', emoji: '🦅' },
  { id: 'knights', name: 'Knights', emoji: '⚔️' },
  { id: 'kings', name: 'Kings', emoji: '👑' },
  { id: 'warriors', name: 'Warriors', emoji: '🛡️' },
  { id: 'phoenix', name: 'Phoenix', emoji: '🔥' },
  { id: 'thunder', name: 'Thunder', emoji: '⚡' },
  { id: 'stars', name: 'Stars', emoji: '⭐' }
];

/**
 * Generate a unique team name suggestion
 * @param {Array} existingNames - Already used team names
 * @returns {string} A unique team name suggestion
 */
export const generateTeamNameSuggestion = (existingNames = []) => {
  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 
    'Hyderabad', 'Punjab', 'Rajasthan', 'Lucknow', 'Gujarat'
  ];
  
  const mascots = [
    'Kings', 'Super Kings', 'Royals', 'Indians', 'Capitals',
    'Challengers', 'Knight Riders', 'Sunrisers', 'Giants', 'Titans'
  ];
  
  const usedNames = new Set(existingNames);
  let suggestion;
  
  // Try to find a unique city-mascot combination
  do {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const mascot = mascots[Math.floor(Math.random() * mascots.length)];
    suggestion = `${city} ${mascot}`;
  } while (usedNames.has(suggestion));
  
  return suggestion;
};

/**
 * Get a random color scheme
 * @param {Array} usedSchemes - Already used color scheme IDs
 * @returns {Object} A color scheme
 */
export const getRandomColorScheme = (usedSchemes = []) => {
  const availableSchemes = teamColorSchemes.filter(scheme => !usedSchemes.includes(scheme.id));
  
  if (availableSchemes.length === 0) {
    // If all schemes are used, return a random one anyway
    return teamColorSchemes[Math.floor(Math.random() * teamColorSchemes.length)];
  }
  
  return availableSchemes[Math.floor(Math.random() * availableSchemes.length)];
};

/**
 * Get a random team icon
 * @param {Array} usedIcons - Already used icon IDs
 * @returns {Object} A team icon
 */
export const getRandomTeamIcon = (usedIcons = []) => {
  const availableIcons = teamIcons.filter(icon => !usedIcons.includes(icon.id));
  
  if (availableIcons.length === 0) {
    // If all icons are used, return a random one anyway
    return teamIcons[Math.floor(Math.random() * teamIcons.length)];
  }
  
  return availableIcons[Math.floor(Math.random() * availableIcons.length)];
};