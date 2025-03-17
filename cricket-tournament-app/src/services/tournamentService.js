import { generateUniqueId, getRandomElement } from '../utils/helpers';

// Sample first names for player generation
const firstNames = [
  "Virat", "Rohit", "MS", "Ravindra", "Jasprit", "KL", "Hardik", "Rishabh", "Shikhar", "Ajinkya",
  "Cheteshwar", "Suresh", "Ravichandran", "Yuzvendra", "Mohammed", "Bhuvneshwar", "Ishant", "Kuldeep",
  "Shardul", "Washington", "Mayank", "Prithvi", "Shreyas", "Rahul", "Krunal", "Deepak", "Navdeep",
  "Umesh", "Dinesh", "Manish", "Kedar", "Ambati", "Varun", "Sanju", "Ishan", "Suryakumar", "Axar",
  "Jayant", "Prasidh", "Avesh", "Arshdeep", "Ravi", "Harshal", "Venkatesh", "Ruturaj", "Devdutt",
  "Nitish", "Mohammed", "Shubman", "Hanuma", "Abhimanyu"
];

// Sample last names for player generation
const lastNames = [
  "Kohli", "Sharma", "Dhoni", "Jadeja", "Bumrah", "Rahul", "Pandya", "Pant", "Dhawan", "Rahane",
  "Pujara", "Raina", "Ashwin", "Chahal", "Shami", "Kumar", "Sharma", "Yadav", "Thakur", "Sundar",
  "Agarwal", "Shaw", "Iyer", "Chahar", "Pandya", "Chahar", "Saini", "Yadav", "Karthik", "Pandey",
  "Jadhav", "Rayudu", "Chakravarthy", "Samson", "Kishan", "Yadav", "Patel", "Yadav", "Krishna",
  "Khan", "Singh", "Bishnoi", "Patel", "Iyer", "Gaikwad", "Padikkal", "Rana", "Siraj", "Gill",
  "Vihari", "Easwaran"
];

// Player roles
const playerRoles = ["batsman", "bowler", "allRounder", "wicketKeeper"];

// Player skill levels for batting and bowling
const skillLevels = ["beginner", "intermediate", "advanced", "expert", "world-class"];

// Batting styles
const battingStyles = ["Right-handed", "Left-handed"];

// Bowling styles
const bowlingStyles = [
  "Right-arm fast", "Right-arm medium", "Right-arm off-break", "Right-arm leg-break",
  "Left-arm fast", "Left-arm medium", "Left-arm orthodox", "Left-arm chinaman"
];

// Sample venues for matches
const venues = [
  "Eden Gardens", "Wankhede Stadium", "M. Chinnaswamy Stadium", "Feroz Shah Kotla",
  "MA Chidambaram Stadium", "Punjab Cricket Association Stadium", "Rajiv Gandhi International Stadium",
  "Narendra Modi Stadium", "Holkar Cricket Stadium", "Sawai Mansingh Stadium", "DY Patil Stadium",
  "JSCA International Stadium", "Brabourne Stadium", "Green Park Stadium", "MCA Stadium"
];

// Generate a random player
const generatePlayer = (role, basePrice) => {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const name = `${firstName} ${lastName}`;
  
  // Adjust skill level based on base price
  const skillIndex = Math.min(
    Math.floor(basePrice / 1.5),
    skillLevels.length - 1
  );
  
  const battingSkill = role === "bowler" 
    ? skillLevels[Math.max(0, skillIndex - 2)] 
    : skillLevels[skillIndex];
  
  const bowlingSkill = role === "batsman" || role === "wicketKeeper" 
    ? skillLevels[Math.max(0, skillIndex - 2)] 
    : skillLevels[skillIndex];
  
  // Generate player stats based on role and skill
  const battingAverage = generateBattingAverage(role, battingSkill);
  const battingStrikeRate = generateBattingStrikeRate(role, battingSkill);
  const bowlingAverage = generateBowlingAverage(role, bowlingSkill);
  const economyRate = generateEconomyRate(role, bowlingSkill);
  
  return {
    id: generateUniqueId(),
    name,
    role,
    basePrice,
    team: null, // Will be assigned during auction
    soldPrice: 0, // Will be set when sold
    battingStyle: getRandomElement(battingStyles),
    bowlingStyle: role === "batsman" || role === "wicketKeeper" 
      ? null 
      : getRandomElement(bowlingStyles),
    stats: {
      matches: generateRandomValue(10, 150),
      runs: generateRandomValue(100, 5000),
      battingAverage,
      highestScore: generateRandomValue(30, 150),
      battingStrikeRate,
      fifties: generateRandomValue(0, 20),
      hundreds: generateRandomValue(0, 10),
      wickets: role === "batsman" || role === "wicketKeeper" ? 0 : generateRandomValue(10, 200),
      bowlingAverage,
      economyRate,
      bestBowling: role === "batsman" || role === "wicketKeeper" ? "0/0" : generateBestBowling()
    }
  };
};

// Helper function to generate a random value in a range
const generateRandomValue = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate batting average based on role and skill
const generateBattingAverage = (role, skill) => {
  let baseAverage;
  
  switch (role) {
    case "batsman":
      baseAverage = 40;
      break;
    case "allRounder":
      baseAverage = 30;
      break;
    case "wicketKeeper":
      baseAverage = 35;
      break;
    case "bowler":
      baseAverage = 15;
      break;
    default:
      baseAverage = 25;
  }
  
  // Adjust based on skill
  const skillMultiplier = {
    "beginner": 0.7,
    "intermediate": 0.85,
    "advanced": 1,
    "expert": 1.15,
    "world-class": 1.3
  };
  
  const average = baseAverage * skillMultiplier[skill];
  
  // Add some randomness
  return +(average + (Math.random() * 10 - 5)).toFixed(2);
};

// Generate batting strike rate based on role and skill
const generateBattingStrikeRate = (role, skill) => {
  let baseStrikeRate;
  
  switch (role) {
    case "batsman":
      baseStrikeRate = 130;
      break;
    case "allRounder":
      baseStrikeRate = 120;
      break;
    case "wicketKeeper":
      baseStrikeRate = 125;
      break;
    case "bowler":
      baseStrikeRate = 100;
      break;
    default:
      baseStrikeRate = 115;
  }
  
  // Adjust based on skill
  const skillMultiplier = {
    "beginner": 0.7,
    "intermediate": 0.85,
    "advanced": 1,
    "expert": 1.15,
    "world-class": 1.3
  };
  
  const strikeRate = baseStrikeRate * skillMultiplier[skill];
  
  // Add some randomness
  return +(strikeRate + (Math.random() * 20 - 10)).toFixed(2);
};

// Generate bowling average based on role and skill
const generateBowlingAverage = (role, skill) => {
  let baseAverage;
  
  switch (role) {
    case "bowler":
      baseAverage = 25;
      break;
    case "allRounder":
      baseAverage = 30;
      break;
    case "batsman":
    case "wicketKeeper":
      baseAverage = 45;
      break;
    default:
      baseAverage = 35;
  }
  
  // Adjust based on skill
  const skillMultiplier = {
    "beginner": 1.3,
    "intermediate": 1.15,
    "advanced": 1,
    "expert": 0.85,
    "world-class": 0.7
  };
  
  const average = baseAverage * skillMultiplier[skill];
  
  // Add some randomness
  return +(average + (Math.random() * 10 - 5)).toFixed(2);
};

// Generate economy rate based on role and skill
const generateEconomyRate = (role, skill) => {
  let baseEconomyRate;
  
  switch (role) {
    case "bowler":
      baseEconomyRate = 7.5;
      break;
    case "allRounder":
      baseEconomyRate = 8;
      break;
    case "batsman":
    case "wicketKeeper":
      baseEconomyRate = 9.5;
      break;
    default:
      baseEconomyRate = 8.5;
  }
  
  // Adjust based on skill
  const skillMultiplier = {
    "beginner": 1.3,
    "intermediate": 1.15,
    "advanced": 1,
    "expert": 0.85,
    "world-class": 0.7
  };
  
  const economyRate = baseEconomyRate * skillMultiplier[skill];
  
  // Add some randomness
  return +(economyRate + (Math.random() * 2 - 1)).toFixed(2);
};

// Generate best bowling figures
const generateBestBowling = () => {
  const wickets = Math.floor(Math.random() * 6) + 1;
  const runs = Math.floor(Math.random() * 30) + 10;
  return `${wickets}/${runs}`;
};

// Generate match date
const generateMatchDate = (matchIndex) => {
  // Start today and add days based on match index
  const date = new Date();
  date.setDate(date.getDate() + matchIndex);
  
  // Add a random hour between 10 AM and 7 PM
  date.setHours(10 + Math.floor(Math.random() * 10), 0, 0);
  
  return date.toISOString();
};

// Generate venue
const generateVenue = () => {
  return getRandomElement(venues);
};

/**
 * Generate a pool of players for the tournament
 * @param {Object} poolConfig - Configuration for player pool
 * @param {number} teamBudget - Team budget (for calculating base prices)
 * @returns {Array} Array of player objects
 */
export const generatePlayerPool = (poolConfig, teamBudget) => {
  // Calculate base price (approximately 5% of team budget)
  const basePrice = +(teamBudget * 0.05).toFixed(2);
  
  const players = [];
  
  // Generate batsmen
  for (let i = 0; i < poolConfig.batsmen; i++) {
    // Vary base price a bit based on index
    const playerBasePrice = +(basePrice * (0.8 + (Math.random() * 0.4))).toFixed(2);
    players.push(generatePlayer("batsman", playerBasePrice));
  }
  
  // Generate bowlers
  for (let i = 0; i < poolConfig.bowlers; i++) {
    const playerBasePrice = +(basePrice * (0.8 + (Math.random() * 0.4))).toFixed(2);
    players.push(generatePlayer("bowler", playerBasePrice));
  }
  
  // Generate all-rounders
  for (let i = 0; i < poolConfig.allRounders; i++) {
    const playerBasePrice = +(basePrice * (0.9 + (Math.random() * 0.6))).toFixed(2);
    players.push(generatePlayer("allRounder", playerBasePrice));
  }
  
  // Generate wicket-keepers
  for (let i = 0; i < poolConfig.wicketKeepers; i++) {
    const playerBasePrice = +(basePrice * (0.85 + (Math.random() * 0.5))).toFixed(2);
    players.push(generatePlayer("wicketKeeper", playerBasePrice));
  }
  
  return players;
};

/**
 * Generate a tournament schedule
 * @param {Array} teams - Array of team objects
 * @param {string} format - Tournament format ('league', 'knockout', 'groups')
 * @returns {Array} Array of match objects
 */
export const generateTournamentSchedule = (teams, format = 'league') => {
  const matches = [];
  
  if (format === 'league') {
    // Round-robin format: each team plays against every other team once
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        // Create a match between teams[i] and teams[j]
        const match = {
          id: generateUniqueId(),
          team1: {
            id: teams[i].id,
            name: teams[i].name,
            color: teams[i].color
          },
          team2: {
            id: teams[j].id,
            name: teams[j].name,
            color: teams[j].color
          },
          date: generateMatchDate(matches.length),
          venue: generateVenue(),
          status: 'scheduled'
        };
        
        matches.push(match);
      }
    }
  } else if (format === 'knockout') {
    // Implement knockout format logic
    // Generate matches for the first round
    
    // Example for 8 teams (quarterfinals):
    for (let i = 0; i < teams.length / 2; i++) {
      const match = {
        id: generateUniqueId(),
        team1: {
          id: teams[i].id,
          name: teams[i].name,
          color: teams[i].color
        },
        team2: {
          id: teams[teams.length - 1 - i].id,
          name: teams[teams.length - 1 - i].name,
          color: teams[teams.length - 1 - i].color
        },
        date: generateMatchDate(i),
        venue: generateVenue(),
        status: 'scheduled',
        round: 'quarterfinal',
        matchNumber: i + 1
      };
      
      matches.push(match);
    }
    
    // Placeholder matches for semifinals and final
    // These will be updated once quarterfinals are complete
    
    // Semifinals
    matches.push({
      id: generateUniqueId(),
      team1: { id: null, name: "TBD", color: "#cccccc" },
      team2: { id: null, name: "TBD", color: "#cccccc" },
      date: generateMatchDate(matches.length),
      venue: generateVenue(),
      status: 'scheduled',
      round: 'semifinal',
      matchNumber: 1,
      dependsOn: [1, 2] // Match numbers from quarterfinals
    });
    
    matches.push({
      id: generateUniqueId(),
      team1: { id: null, name: "TBD", color: "#cccccc" },
      team2: { id: null, name: "TBD", color: "#cccccc" },
      date: generateMatchDate(matches.length),
      venue: generateVenue(),
      status: 'scheduled',
      round: 'semifinal',
      matchNumber: 2,
      dependsOn: [3, 4] // Match numbers from quarterfinals
    });
    
    // Final
    matches.push({
      id: generateUniqueId(),
      team1: { id: null, name: "TBD", color: "#cccccc" },
      team2: { id: null, name: "TBD", color: "#cccccc" },
      date: generateMatchDate(matches.length + 1), // Add extra day for final
      venue: generateVenue(),
      status: 'scheduled',
      round: 'final',
      matchNumber: 1,
      dependsOn: [1, 2] // Match numbers from semifinals
    });
  } else if (format === 'groups') {
    // Implement groups format logic
    // Divide teams into groups
    const groupCount = Math.min(2, Math.floor(teams.length / 3)); // At least 3 teams per group
    const groups = Array(groupCount).fill().map(() => []);
    
    // Distribute teams to groups
    teams.forEach((team, index) => {
      const groupIndex = index % groupCount;
      groups[groupIndex].push(team);
    });
    
    // Generate matches within each group (round robin)
    let matchNumber = 1;
    groups.forEach((groupTeams, groupIndex) => {
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          const match = {
            id: generateUniqueId(),
            team1: {
              id: groupTeams[i].id,
              name: groupTeams[i].name,
              color: groupTeams[i].color
            },
            team2: {
              id: groupTeams[j].id,
              name: groupTeams[j].name,
              color: groupTeams[j].color
            },
            date: generateMatchDate(matches.length),
            venue: generateVenue(),
            status: 'scheduled',
            group: `Group ${String.fromCharCode(65 + groupIndex)}`, // Group A, B, etc.
            matchNumber: matchNumber++
          };
          
          matches.push(match);
        }
      }
    });
    
    // Add playoffs between groups
    // Top teams from each group advance
    
    // Final
    matches.push({
      id: generateUniqueId(),
      team1: { id: null, name: "Winner Group A", color: "#cccccc" },
      team2: { id: null, name: "Winner Group B", color: "#cccccc" },
      date: generateMatchDate(matches.length + 1), // Add extra day for final
      venue: generateVenue(),
      status: 'scheduled',
      round: 'final',
      matchNumber: matchNumber++
    });
  }
  
  return matches;
};

/**
 * Update tournament schedule after match results
 * @param {Array} matches - Array of match objects
 * @param {string} format - Tournament format ('league', 'knockout', 'groups')
 * @returns {Array} Updated array of match objects
 */
export const updateTournamentSchedule = (matches, format = 'league') => {
  if (format !== 'knockout' && format !== 'groups') {
    // No updates needed for league format
    return matches;
  }
  
  const updatedMatches = [...matches];
  
  // Find completed matches
  const completedMatches = updatedMatches.filter(match => 
    match.status === 'completed' && match.winnerId
  );
  
  // Update dependent matches
  updatedMatches.forEach(match => {
    if (match.dependsOn && (match.team1.id === null || match.team2.id === null)) {
      const dependentMatches = match.dependsOn.map(matchNumber => 
        completedMatches.find(m => m.matchNumber === matchNumber)
      ).filter(Boolean);
      
      // If all dependent matches are completed, update this match
      if (dependentMatches.length === match.dependsOn.length) {
        // For semifinals
        if (match.round === 'semifinal') {
          // First semifinal gets winners from first two quarterfinals
          if (match.matchNumber === 1) {
            const winner1 = completedMatches.find(m => m.matchNumber === 1);
            const winner2 = completedMatches.find(m => m.matchNumber === 2);
            
            if (winner1 && winner2) {
              match.team1 = {
                id: winner1.winnerId,
                name: winner1.winnerId === winner1.team1.id ? winner1.team1.name : winner1.team2.name,
                color: winner1.winnerId === winner1.team1.id ? winner1.team1.color : winner1.team2.color
              };
              
              match.team2 = {
                id: winner2.winnerId,
                name: winner2.winnerId === winner2.team1.id ? winner2.team1.name : winner2.team2.name,
                color: winner2.winnerId === winner2.team1.id ? winner2.team1.color : winner2.team2.color
              };
            }
          }
          // Second semifinal gets winners from second two quarterfinals
          else if (match.matchNumber === 2) {
            const winner3 = completedMatches.find(m => m.matchNumber === 3);
            const winner4 = completedMatches.find(m => m.matchNumber === 4);
            
            if (winner3 && winner4) {
              match.team1 = {
                id: winner3.winnerId,
                name: winner3.winnerId === winner3.team1.id ? winner3.team1.name : winner3.team2.name,
                color: winner3.winnerId === winner3.team1.id ? winner3.team1.color : winner3.team2.color
              };
              
              match.team2 = {
                id: winner4.winnerId,
                name: winner4.winnerId === winner4.team1.id ? winner4.team1.name : winner4.team2.name,
                color: winner4.winnerId === winner4.team1.id ? winner4.team1.color : winner4.team2.color
              };
            }
          }
        }
        // For final
        else if (match.round === 'final') {
          const winner1 = completedMatches.find(m => m.round === 'semifinal' && m.matchNumber === 1);
          const winner2 = completedMatches.find(m => m.round === 'semifinal' && m.matchNumber === 2);
          
          if (winner1 && winner2) {
            match.team1 = {
              id: winner1.winnerId,
              name: winner1.winnerId === winner1.team1.id ? winner1.team1.name : winner1.team2.name,
              color: winner1.winnerId === winner1.team1.id ? winner1.team1.color : winner1.team2.color
            };
            
            match.team2 = {
              id: winner2.winnerId,
              name: winner2.winnerId === winner2.team1.id ? winner2.team1.name : winner2.team2.name,
              color: winner2.winnerId === winner2.team1.id ? winner2.team1.color : winner2.team2.color
            };
          }
        }
      }
    }
  });
  
  return updatedMatches;
};

/**
 * Generate player performance for a match
 * @param {Array} teamPlayers - Array of player objects for a team
 * @param {number} totalRuns - Total runs scored by the team
 * @param {number} wickets - Total wickets lost by the team
 * @returns {Object} Performance statistics for each player
 */
export const generatePlayerPerformance = (teamPlayers, totalRuns, wickets) => {
  // Create the batting order
  const battingOrder = [...teamPlayers];
  
  // Sort batting order based on role
  battingOrder.sort((a, b) => {
    const roleOrder = { 'batsman': 0, 'wicketKeeper': 1, 'allRounder': 2, 'bowler': 3 };
    return roleOrder[a.role] - roleOrder[b.role];
  });
  
  // Add some randomness to the batting order
  for (let i = 0; i < 3; i++) {
    const idx1 = Math.floor(Math.random() * battingOrder.length);
    const idx2 = Math.floor(Math.random() * battingOrder.length);
    [battingOrder[idx1], battingOrder[idx2]] = [battingOrder[idx2], battingOrder[idx1]];
  }
  
  // Generate batting performance
  const battingPerformance = [];
  let runsLeft = totalRuns;
  
  // Distribute runs among batsmen
  for (let i = 0; i < Math.min(wickets + 1, battingOrder.length); i++) {
    const player = battingOrder[i];
    const isOut = i < wickets;
    
    // Calculate runs for this batsman
    let runs;
    if (i === 0) {
      // Opener gets more runs
      runs = Math.floor(runsLeft * (0.15 + Math.random() * 0.1));
    } else if (i === battingOrder.length - 1) {
      // Last batsman gets all remaining runs
      runs = runsLeft;
    } else {
      // Other batsmen get a portion of remaining runs
      const portion = Math.random();
      runs = Math.floor(runsLeft * portion * 0.5);
    }
    
    // Ensure we don't exceed remaining runs
    runs = Math.min(runs, runsLeft);
    runsLeft -= runs;
    
    // Calculate balls faced based on player role and runs scored
    let ballsFaced;
    if (player.role === 'batsman') {
      ballsFaced = Math.floor(runs / (player.stats.battingStrikeRate / 100));
    } else if (player.role === 'allRounder') {
      ballsFaced = Math.floor(runs / (player.stats.battingStrikeRate * 0.9 / 100));
    } else {
      ballsFaced = Math.floor(runs / (player.stats.battingStrikeRate * 0.8 / 100));
    }
    
    // Ensure ballsFaced is at least 1 if runs > 0
    ballsFaced = Math.max(1, ballsFaced);
    
    // Add to performance
    battingPerformance.push({
      playerId: player.id,
      playerName: player.name,
      runs,
      balls: ballsFaced,
      fours: Math.floor(runs * 0.25 * Math.random()),
      sixes: Math.floor(runs * 0.1 * Math.random()),
      notOut: !isOut,
      dismissalType: isOut ? generateDismissalType() : null,
      strikeRate: runs > 0 ? +(runs / ballsFaced * 100).toFixed(2) : 0
    });
    
    // If all runs are distributed, break
    if (runsLeft <= 0) break;
  }
  
  // Generate bowling performance
  const bowlingPerformance = [];
  const bowlers = teamPlayers.filter(p => p.role === 'bowler' || p.role === 'allRounder');
  
  // Distribute overs among bowlers
  const totalOvers = 20;
  let oversLeft = totalOvers;
  let wicketsLeft = 10 - wickets; // Wickets taken by this team
  
  for (let i = 0; i < bowlers.length; i++) {
    const player = bowlers[i];
    
    // Calculate overs for this bowler
    let overs;
    if (i === bowlers.length - 1) {
      // Last bowler gets all remaining overs
      overs = oversLeft;
    } else {
      // Other bowlers get a portion of overs
      overs = Math.min(4, Math.floor(oversLeft / (bowlers.length - i)));
    }
    
    // Ensure we don't exceed remaining overs
    overs = Math.min(overs, oversLeft);
    oversLeft -= overs;
    
    // Calculate wickets for this bowler
    let bowlerWickets;
    if (i === 0) {
      // Best bowler gets more wickets
      bowlerWickets = Math.floor(wicketsLeft * 0.4);
    } else if (i === 1) {
      // Second best bowler gets a good share
      bowlerWickets = Math.floor(wicketsLeft * 0.3);
    } else {
      // Other bowlers share remaining wickets
      const portion = Math.random();
      bowlerWickets = Math.floor(wicketsLeft * portion);
    }
    
    // Ensure we don't exceed remaining wickets
    bowlerWickets = Math.min(bowlerWickets, wicketsLeft);
    wicketsLeft -= bowlerWickets;
    
    // Calculate runs conceded based on economy rate
    const runsConceded = Math.floor(player.stats.economyRate * overs);
    
    // Add to performance
    bowlingPerformance.push({
      playerId: player.id,
      playerName: player.name,
      overs,
      maidens: Math.floor(overs * 0.2 * Math.random()),
      runs: runsConceded,
      wickets: bowlerWickets,
      economy: runsConceded / overs
    });
  }
  
  return {
    battingPerformance,
    bowlingPerformance
  };
};

// Generate dismissal type
const generateDismissalType = () => {
  const types = [
    "Bowled", "Caught", "LBW", "Run Out", "Stumped", "Caught & Bowled", 
    "Hit Wicket", "Obstructing the Field", "Timed Out", "Retired Hurt"
  ];
  const weights = [30, 40, 15, 8, 3, 2, 1, 0.5, 0.3, 0.2];
  
  // Weighted random selection
  let total = 0;
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  const random = Math.random() * weightSum;
  
  for (let i = 0; i < types.length; i++) {
    total += weights[i];
    if (random < total) {
      return types[i];
    }
  }
  
  return types[0]; // Default to bowled
};

export default {
  generatePlayerPool,
  generateTournamentSchedule,
  updateTournamentSchedule,
  generatePlayerPerformance
};