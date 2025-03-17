// src/data/playerData.js

/**
 * Mock player data with various roles and stats
 * In a real application, this would likely come from an API
 */
export const playerData = [
    // Batsmen
    {
      id: 'p001',
      name: 'Rohit Sharma',
      role: 'Batsman',
      battingHand: 'Right',
      battingStats: {
        matches: 45,
        innings: 43,
        runs: 1850,
        average: 43.02,
        strikeRate: 145.7,
        fifties: 12,
        hundreds: 4,
        fours: 172,
        sixes: 89
      },
      basePrice: 200 // in lakhs
    },
    {
      id: 'p002',
      name: 'Virat Kohli',
      role: 'Batsman',
      battingHand: 'Right',
      battingStats: {
        matches: 48,
        innings: 47,
        runs: 2100,
        average: 45.65,
        strikeRate: 139.5,
        fifties: 15,
        hundreds: 5,
        fours: 215,
        sixes: 64
      },
      basePrice: 220 // in lakhs
    },
    {
      id: 'p003',
      name: 'David Warner',
      role: 'Batsman',
      battingHand: 'Left',
      battingStats: {
        matches: 42,
        innings: 41,
        runs: 1950,
        average: 47.56,
        strikeRate: 142.3,
        fifties: 14,
        hundreds: 3,
        fours: 185,
        sixes: 70
      },
      basePrice: 180 // in lakhs
    },
    {
      id: 'p004',
      name: 'Kane Williamson',
      role: 'Batsman',
      battingHand: 'Right',
      battingStats: {
        matches: 40,
        innings: 38,
        runs: 1680,
        average: 44.21,
        strikeRate: 132.7,
        fifties: 12,
        hundreds: 2,
        fours: 168,
        sixes: 38
      },
      basePrice: 170 // in lakhs
    },
    {
      id: 'p005',
      name: 'KL Rahul',
      role: 'Batsman',
      battingHand: 'Right',
      battingStats: {
        matches: 38,
        innings: 37,
        runs: 1750,
        average: 47.30,
        strikeRate: 140.5,
        fifties: 13,
        hundreds: 3,
        fours: 165,
        sixes: 60
      },
      basePrice: 160 // in lakhs
    },
    
    // Bowlers
    {
      id: 'p006',
      name: 'Jasprit Bumrah',
      role: 'Bowler',
      bowlingArm: 'Right',
      bowlingStyle: 'Fast',
      bowlingStats: {
        matches: 45,
        innings: 45,
        wickets: 95,
        economy: 6.8,
        average: 22.5,
        bestBowling: '5/10',
        fourWickets: 3,
        fiveWickets: 1
      },
      basePrice: 190 // in lakhs
    },
    {
      id: 'p007',
      name: 'Rashid Khan',
      role: 'Bowler',
      bowlingArm: 'Right',
      bowlingStyle: 'Leg Spin',
      bowlingStats: {
        matches: 44,
        innings: 44,
        wickets: 88,
        economy: 6.3,
        average: 20.8,
        bestBowling: '4/12',
        fourWickets: 4,
        fiveWickets: 0
      },
      basePrice: 200 // in lakhs
    },
    {
      id: 'p008',
      name: 'Trent Boult',
      role: 'Bowler',
      bowlingArm: 'Left',
      bowlingStyle: 'Fast',
      bowlingStats: {
        matches: 40,
        innings: 40,
        wickets: 82,
        economy: 7.2,
        average: 24.1,
        bestBowling: '4/18',
        fourWickets: 2,
        fiveWickets: 0
      },
      basePrice: 170 // in lakhs
    },
    {
      id: 'p009',
      name: 'Yuzvendra Chahal',
      role: 'Bowler',
      bowlingArm: 'Right',
      bowlingStyle: 'Leg Spin',
      bowlingStats: {
        matches: 42,
        innings: 42,
        wickets: 80,
        economy: 7.5,
        average: 25.3,
        bestBowling: '4/17',
        fourWickets: 3,
        fiveWickets: 0
      },
      basePrice: 150 // in lakhs
    },
    {
      id: 'p010',
      name: 'Kagiso Rabada',
      role: 'Bowler',
      bowlingArm: 'Right',
      bowlingStyle: 'Fast',
      bowlingStats: {
        matches: 38,
        innings: 38,
        wickets: 78,
        economy: 7.8,
        average: 23.6,
        bestBowling: '4/21',
        fourWickets: 2,
        fiveWickets: 0
      },
      basePrice: 180 // in lakhs
    },
    
    // All-Rounders
    {
      id: 'p011',
      name: 'Hardik Pandya',
      role: 'All-Rounder',
      battingHand: 'Right',
      bowlingArm: 'Right',
      bowlingStyle: 'Medium Fast',
      battingStats: {
        matches: 40,
        innings: 35,
        runs: 950,
        average: 28.8,
        strikeRate: 150.2,
        fifties: 4,
        hundreds: 0,
        fours: 62,
        sixes: 60
      },
      bowlingStats: {
        matches: 40,
        innings: 38,
        wickets: 45,
        economy: 8.2,
        average: 30.5,
        bestBowling: '3/20',
        fourWickets: 0,
        fiveWickets: 0
      },
      basePrice: 210 // in lakhs
    },
    {
      id: 'p012',
      name: 'Andre Russell',
      role: 'All-Rounder',
      battingHand: 'Right',
      bowlingArm: 'Right',
      bowlingStyle: 'Medium Fast',
      battingStats: {
        matches: 42,
        innings: 38,
        runs: 1100,
        average: 31.4,
        strikeRate: 178.5,
        fifties: 6,
        hundreds: 0,
        fours: 75,
        sixes: 95
      },
      bowlingStats: {
        matches: 42,
        innings: 40,
        wickets: 55,
        economy: 8.8,
        average: 28.2,
        bestBowling: '3/15',
        fourWickets: 0,
        fiveWickets: 0
      },
      basePrice: 220 // in lakhs
    },
    {
      id: 'p013',
      name: 'Ravindra Jadeja',
      role: 'All-Rounder',
      battingHand: 'Left',
      bowlingArm: 'Left',
      bowlingStyle: 'Slow Left-Arm',
      battingStats: {
        matches: 45,
        innings: 35,
        runs: 850,
        average: 26.5,
        strikeRate: 140.2,
        fifties: 3,
        hundreds: 0,
        fours: 65,
        sixes: 40
      },
      bowlingStats: {
        matches: 45,
        innings: 45,
        wickets: 70,
        economy: 7.1,
        average: 25.8,
        bestBowling: '4/22',
        fourWickets: 2,
        fiveWickets: 0
      },
      basePrice: 190 // in lakhs
    },
    {
      id: 'p014',
      name: 'Ben Stokes',
      role: 'All-Rounder',
      battingHand: 'Left',
      bowlingArm: 'Right',
      bowlingStyle: 'Medium Fast',
      battingStats: {
        matches: 38,
        innings: 36,
        runs: 950,
        average: 29.7,
        strikeRate: 142.5,
        fifties: 5,
        hundreds: 1,
        fours: 78,
        sixes: 48
      },
      bowlingStats: {
        matches: 38,
        innings: 36,
        wickets: 42,
        economy: 8.0,
        average: 29.5,
        bestBowling: '3/18',
        fourWickets: 0,
        fiveWickets: 0
      },
      basePrice: 200 // in lakhs
    },
    {
      id: 'p015',
      name: 'Sunil Narine',
      role: 'All-Rounder',
      battingHand: 'Left',
      bowlingArm: 'Right',
      bowlingStyle: 'Off Spin',
      battingStats: {
        matches: 44,
        innings: 40,
        runs: 720,
        average: 18.5,
        strikeRate: 165.2,
        fifties: 2,
        hundreds: 0,
        fours: 48,
        sixes: 60
      },
      bowlingStats: {
        matches: 44,
        innings: 44,
        wickets: 75,
        economy: 6.7,
        average: 24.2,
        bestBowling: '4/16',
        fourWickets: 3,
        fiveWickets: 0
      },
      basePrice: 175 // in lakhs
    },
    
    // Wicket Keepers
    {
      id: 'p016',
      name: 'MS Dhoni',
      role: 'Wicket Keeper',
      battingHand: 'Right',
      battingStats: {
        matches: 45,
        innings: 40,
        runs: 1050,
        average: 35.0,
        strikeRate: 143.8,
        fifties: 5,
        hundreds: 0,
        fours: 85,
        sixes: 68
      },
      keepingStats: {
        matches: 45,
        dismissals: 72,
        stumpings: 25,
        catches: 47
      },
      basePrice: 160 // in lakhs
    },
    {
      id: 'p017',
      name: 'Jos Buttler',
      role: 'Wicket Keeper',
      battingHand: 'Right',
      battingStats: {
        matches: 40,
        innings: 40,
        runs: 1650,
        average: 42.3,
        strikeRate: 149.6,
        fifties: 10,
        hundreds: 3,
        fours: 148,
        sixes: 72
      },
      keepingStats: {
        matches: 40,
        dismissals: 58,
        stumpings: 18,
        catches: 40
      },
      basePrice: 185 // in lakhs
    },
    {
      id: 'p018',
      name: 'Quinton de Kock',
      role: 'Wicket Keeper',
      battingHand: 'Left',
      battingStats: {
        matches: 38,
        innings: 38,
        runs: 1520,
        average: 40.0,
        strikeRate: 138.2,
        fifties: 11,
        hundreds: 2,
        fours: 160,
        sixes: 50
      },
      keepingStats: {
        matches: 38,
        dismissals: 54,
        stumpings: 15,
        catches: 39
      },
      basePrice: 170 // in lakhs
    },
    {
      id: 'p019',
      name: 'Rishabh Pant',
      role: 'Wicket Keeper',
      battingHand: 'Left',
      battingStats: {
        matches: 35,
        innings: 35,
        runs: 1320,
        average: 37.7,
        strikeRate: 156.3,
        fifties: 8,
        hundreds: 1,
        fours: 120,
        sixes: 75
      },
      keepingStats: {
        matches: 35,
        dismissals: 45,
        stumpings: 14,
        catches: 31
      },
      basePrice: 160 // in lakhs
    },
    {
      id: 'p020',
      name: 'Ishan Kishan',
      role: 'Wicket Keeper',
      battingHand: 'Left',
      battingStats: {
        matches: 32,
        innings: 32,
        runs: 1180,
        average: 36.9,
        strikeRate: 145.7,
        fifties: 7,
        hundreds: 1,
        fours: 105,
        sixes: 65
      },
      keepingStats: {
        matches: 32,
        dismissals: 38,
        stumpings: 12,
        catches: 26
      },
      basePrice: 150 // in lakhs
    }
  ];
  
  /**
   * Get a random subset of players
   * @param {number} count - Number of players to select
   * @param {Object} options - Options for filtering players
   * @returns {Array} Array of selected players
   */
  export const getRandomPlayers = (count, options = {}) => {
    const { roles = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket Keeper'] } = options;
    
    // Filter players by roles
    const filteredPlayers = playerData.filter(player => roles.includes(player.role));
    
    // Shuffle array
    const shuffled = [...filteredPlayers].sort(() => 0.5 - Math.random());
    
    // Get first n elements
    return shuffled.slice(0, count);
  };
  
  /**
   * Generate a player pool based on tournament setup
   * @param {Object} tournamentSetup - Tournament configuration
   * @returns {Array} Player pool with adjusted base prices
   */
  export const generatePlayerPool = (tournamentSetup) => {
    const { teams, budgetPerTeam, playersPerTeam, roleDistribution } = tournamentSetup;
    
    // Calculate total players needed
    const totalPlayers = teams.length * playersPerTeam;
    
    // Determine role counts based on distribution
    const roleCounts = {
      Batsman: Math.floor(totalPlayers * roleDistribution.batsmen),
      Bowler: Math.floor(totalPlayers * roleDistribution.bowlers),
      'All-Rounder': Math.floor(totalPlayers * roleDistribution.allRounders),
      'Wicket Keeper': Math.floor(totalPlayers * roleDistribution.wicketKeepers)
    };
    
    // Adjust for rounding errors
    const totalAllocated = Object.values(roleCounts).reduce((sum, count) => sum + count, 0);
    if (totalAllocated < totalPlayers) {
      roleCounts.Batsman += totalPlayers - totalAllocated;
    }
    
    // Get players by role
    const players = {};
    for (const [role, count] of Object.entries(roleCounts)) {
      players[role] = getRandomPlayers(count, { roles: [role] });
    }
    
    // Combine all players and adjust base prices
    // Base price should be ~5% of team budget as mentioned in requirements
    const basePrice = Math.round(budgetPerTeam * 0.05);
    
    // Combine all players
    let playerPool = [
      ...players.Batsman,
      ...players.Bowler,
      ...players['All-Rounder'],
      ...players['Wicket Keeper']
    ];
    
    // Adjust base prices
    playerPool = playerPool.map(player => {
      // Adjust base price based on player stats and role
      // For simplicity, we're using a random factor with player's existing base price as reference
      const adjustmentFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
      const adjustedBasePrice = Math.round(basePrice * adjustmentFactor);
      
      return {
        ...player,
        basePrice: adjustedBasePrice
      };
    });
    
    return playerPool;
  };