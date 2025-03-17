// src/services/matchService.js
import { v4 as uuidv4 } from 'uuid';
import { getFromStorage, saveToStorage } from '../utils/storage.js';
import { generateCommentary } from './commentaryGenerator';

const STORAGE_KEY = 'cricket_match_data';

/**
 * Create a new match
 * @param {Object} params - Match parameters
 * @param {string} params.tournamentId - Tournament ID
 * @param {string} params.team1Id - Team 1 ID
 * @param {string} params.team2Id - Team 2 ID
 * @param {number} params.overs - Number of overs (default: 20)
 * @param {string} params.venue - Match venue
 * @returns {Object} The created match
 */
export const createMatch = ({ tournamentId, team1Id, team2Id, overs = 20, venue = 'Home Ground' }) => {
  const matchId = uuidv4();
  
  const match = {
    id: matchId,
    tournamentId,
    team1Id,
    team2Id,
    overs,
    venue,
    date: new Date().toISOString(),
    status: 'scheduled', // scheduled, live, completed
    toss: null, // { winner: teamId, decision: 'bat/field' }
    innings: [
      {
        battingTeam: null,
        bowlingTeam: null,
        runs: 0,
        wickets: 0,
        overs: 0.0,
        target: null,
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
        totalExtras: 0,
        runRate: 0,
        requiredRunRate: null,
        projectedScore: null,
        batsmen: [], // [{playerId, runs, balls, fours, sixes, strikeRate, onStrike}]
        bowlers: [], // [{playerId, overs, maidens, runs, wickets, economy}]
        fallOfWickets: [], // [{runs, wickets, overs, playerId}]
        partnerships: [], // [{runs, balls, batsman1Id, batsman2Id}]
        overHistory: [], // [{over: 1, runs: []}]
        powerplayScore: 0
      },
      {
        battingTeam: null,
        bowlingTeam: null,
        runs: 0,
        wickets: 0,
        overs: 0.0,
        target: null,
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
        totalExtras: 0,
        runRate: 0,
        requiredRunRate: null,
        projectedScore: null,
        batsmen: [],
        bowlers: [],
        fallOfWickets: [],
        partnerships: [],
        overHistory: [],
        powerplayScore: 0
      }
    ],
    result: null,
    commentary: [], // [{text, timestamp, type: 'wicket/boundary/regular'}]
    currentInningsIndex: 0,
    currentOver: 0.0,
    currentBall: 0,
    lastUpdateTime: Date.now()
  };

  saveToStorage(`${STORAGE_KEY}_${matchId}`, match);
  return match;
};

/**
 * Start a match
 * @param {string} matchId - Match ID
 * @param {Object} toss - Toss result {winner: teamId, decision: 'bat/field'}
 * @param {Array} team1Players - Team 1 playing XI
 * @param {Array} team2Players - Team 2 playing XI
 * @returns {Object} Updated match data
 */
export const startMatch = (matchId, toss, team1Players, team2Players) => {
  const match = getFromStorage(`${STORAGE_KEY}_${matchId}`);
  
  if (!match) {
    throw new Error('Match not found');
  }

  if (match.status !== 'scheduled') {
    throw new Error('Match already started or completed');
  }

  // Determine batting and bowling teams based on toss
  const firstBattingTeam = toss.decision === 'bat' ? toss.winner : (toss.winner === match.team1Id ? match.team2Id : match.team1Id);
  const firstBowlingTeam = firstBattingTeam === match.team1Id ? match.team2Id : match.team1Id;

  const team1PlayingXI = team1Players.map(player => ({
    ...player,
    battingStats: { runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0 },
    bowlingStats: { overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0 }
  }));

  const team2PlayingXI = team2Players.map(player => ({
    ...player,
    battingStats: { runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0 },
    bowlingStats: { overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0 }
  }));

  // Initialize opening batsmen and bowler
  const battingTeamPlayers = firstBattingTeam === match.team1Id ? team1PlayingXI : team2PlayingXI;
  const bowlingTeamPlayers = firstBattingTeam === match.team1Id ? team2PlayingXI : team1PlayingXI;

  const openingBatsman1 = battingTeamPlayers.find(p => p.role === 'Batsman' || p.role === 'All-Rounder');
  const openingBatsman2 = battingTeamPlayers.filter(p => (p.role === 'Batsman' || p.role === 'All-Rounder') && p.id !== openingBatsman1.id)[0];
  const openingBowler = bowlingTeamPlayers.find(p => p.role === 'Bowler' || p.role === 'All-Rounder');

  const updatedMatch = {
    ...match,
    status: 'live',
    toss,
    team1PlayingXI,
    team2PlayingXI,
    innings: [
      {
        ...match.innings[0],
        battingTeam: firstBattingTeam,
        bowlingTeam: firstBowlingTeam,
        batsmen: [
          { ...openingBatsman1, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, onStrike: true },
          { ...openingBatsman2, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, onStrike: false }
        ],
        bowlers: [
          { ...openingBowler, overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0, currentlyBowling: true }
        ],
        overHistory: [{ over: 1, runs: [] }]
      },
      {
        ...match.innings[1],
        battingTeam: firstBowlingTeam,
        bowlingTeam: firstBattingTeam
      }
    ],
    commentary: [
      { 
        text: `Match begins! ${firstBattingTeam === match.team1Id ? 'Team 1' : 'Team 2'} chose to bat first.`, 
        timestamp: Date.now(), 
        type: 'regular' 
      },
      { 
        text: `Opening batsmen are ${openingBatsman1.name} and ${openingBatsman2.name}.`, 
        timestamp: Date.now(), 
        type: 'regular' 
      }
    ],
    lastUpdateTime: Date.now()
  };

  saveToStorage(`${STORAGE_KEY}_${matchId}`, updatedMatch);
  return updatedMatch;
};

/**
 * Simulate the next ball in a match
 * @param {string} matchId - Match ID
 * @returns {Object} Updated match data with ball result
 */
export const simulateNextBall = (matchId) => {
  const match = getFromStorage(`${STORAGE_KEY}_${matchId}`);
  
  if (!match) {
    throw new Error('Match not found');
  }

  if (match.status !== 'live') {
    throw new Error('Match not in progress');
  }

  const currentInnings = match.innings[match.currentInningsIndex];
  const currentOver = Math.floor(currentInnings.overs);
  const currentBall = (currentInnings.overs * 10) % 10;

  // Check if innings is complete
  if (
    (currentInnings.wickets >= 10) || 
    (currentInnings.overs >= match.overs) ||
    (match.currentInningsIndex === 1 && currentInnings.runs > currentInnings.target)
  ) {
    if (match.currentInningsIndex === 0) {
      // Set target for second innings
      const updatedMatch = {
        ...match,
        currentInningsIndex: 1,
        currentOver: 0.0,
        currentBall: 0,
        innings: [
          currentInnings,
          {
            ...match.innings[1],
            target: currentInnings.runs + 1,
            requiredRunRate: (currentInnings.runs + 1) / match.overs
          }
        ],
        commentary: [
          ...match.commentary,
          { 
            text: `First innings complete! ${currentInnings.battingTeam === match.team1Id ? 'Team 1' : 'Team 2'} scored ${currentInnings.runs}/${currentInnings.wickets} in ${currentInnings.overs} overs.`, 
            timestamp: Date.now(), 
            type: 'regular' 
          },
          { 
            text: `Target for ${currentInnings.bowlingTeam === match.team1Id ? 'Team 1' : 'Team 2'} is ${currentInnings.runs + 1} runs.`, 
            timestamp: Date.now(), 
            type: 'regular' 
          }
        ],
        lastUpdateTime: Date.now()
      };

      saveToStorage(`${STORAGE_KEY}_${matchId}`, updatedMatch);
      return updatedMatch;
    } else {
      // Match complete
      let result;
      if (currentInnings.runs > currentInnings.target - 1) {
        result = {
          winner: currentInnings.battingTeam,
          margin: `${10 - currentInnings.wickets} wickets`,
          method: 'chased'
        };
      } else if (currentInnings.runs < currentInnings.target - 1) {
        result = {
          winner: currentInnings.bowlingTeam,
          margin: `${currentInnings.target - 1 - currentInnings.runs} runs`,
          method: 'defended'
        };
      } else {
        result = {
          winner: null,
          method: 'tie'
        };
      }

      const updatedMatch = {
        ...match,
        status: 'completed',
        result,
        commentary: [
          ...match.commentary,
          { 
            text: result.winner ? 
              `Match complete! ${result.winner === match.team1Id ? 'Team 1' : 'Team 2'} wins by ${result.margin}!` : 
              `Match tied! What a thriller!`, 
            timestamp: Date.now(), 
            type: 'regular' 
          }
        ],
        lastUpdateTime: Date.now()
      };

      saveToStorage(`${STORAGE_KEY}_${matchId}`, updatedMatch);
      return updatedMatch;
    }
  }

  // Simulate ball outcome
  const ballOutcome = simulateBallOutcome(currentInnings);
  const {  isWide, isNoBall, isBoundary,  isWicket, commentary } = ballOutcome;

  // Update match state
  const updatedInnings = updateInningsState(currentInnings, ballOutcome, match);
  const isOverComplete = !isWide && !isNoBall && (currentBall + 1) >= 6;

  const updatedMatch = {
    ...match,
    innings: [
      ...match.innings.slice(0, match.currentInningsIndex),
      updatedInnings,
      ...match.innings.slice(match.currentInningsIndex + 1)
    ],
    currentOver: isOverComplete ? currentOver + 1 : currentOver,
    currentBall: isOverComplete ? 0 : currentBall + 1,
    commentary: [
      ...match.commentary,
      { 
        text: commentary, 
        timestamp: Date.now(), 
        type: isBoundary ? 'boundary' : (isWicket ? 'wicket' : 'regular') 
      }
    ],
    lastUpdateTime: Date.now()
  };

  saveToStorage(`${STORAGE_KEY}_${matchId}`, updatedMatch);
  return updatedMatch;
};

/**
 * Simulate the outcome of a cricket ball
 * @param {Object} currentInnings - Current innings state
 * @returns {Object} Ball outcome
 */
const simulateBallOutcome = (currentInnings) => {
  // Get current batsman and bowler
  const striker = currentInnings.batsmen.find(b => b.onStrike);
  const bowler = currentInnings.bowlers.find(b => b.currentlyBowling);

  // Probabilities (can be adjusted based on player stats for more realism)
  const wicketProb = 0.06; // 6% chance of wicket
  const wideProb = 0.04;   // 4% chance of wide
  const noBallProb = 0.02; // 2% chance of no ball
  const dotProb = 0.35;    // 35% chance of dot ball
  const singleProb = 0.30; // 30% chance of single
  const doubleProb = 0.12; // 12% chance of double
  const tripleProb = 0.01; // 1% chance of triple
  const fourProb = 0.08;   // 8% chance of four
     // 2% chance of six

  // Roll for ball outcome
  const roll = Math.random();
  let outcome = {};

  // Handle extras first
  if (roll < wideProb) {
    outcome = { runs: 1, isWide: true, commentary: generateCommentary('wide', striker, bowler) };
  } else if (roll < wideProb + noBallProb) {
    outcome = { runs: 1, isNoBall: true, commentary: generateCommentary('noBall', striker, bowler) };
  } 
  // Then handle wickets
  else if (roll < wideProb + noBallProb + wicketProb) {
    outcome = { runs: 0, isWicket: true, commentary: generateCommentary('wicket', striker, bowler) };
  } 
  // Then handle runs
  else if (roll < wideProb + noBallProb + wicketProb + dotProb) {
    outcome = { runs: 0, commentary: generateCommentary('dot', striker, bowler) };
  } else if (roll < wideProb + noBallProb + wicketProb + dotProb + singleProb) {
    outcome = { runs: 1, commentary: generateCommentary('single', striker, bowler) };
  } else if (roll < wideProb + noBallProb + wicketProb + dotProb + singleProb + doubleProb) {
    outcome = { runs: 2, commentary: generateCommentary('double', striker, bowler) };
  } else if (roll < wideProb + noBallProb + wicketProb + dotProb + singleProb + doubleProb + tripleProb) {
    outcome = { runs: 3, commentary: generateCommentary('triple', striker, bowler) };
  } else if (roll < wideProb + noBallProb + wicketProb + dotProb + singleProb + doubleProb + tripleProb + fourProb) {
    outcome = { runs: 4, isBoundary: true, commentary: generateCommentary('four', striker, bowler) };
  } else {
    outcome = { runs: 6, isBoundary: true, isSix: true, commentary: generateCommentary('six', striker, bowler) };
  }

  return outcome;
};

/**
 * Update innings state based on ball outcome
 * @param {Object} innings - Current innings
 * @param {Object} ballOutcome - Ball outcome
 * @returns {Object} Updated innings
 */
const updateInningsState = (innings, ballOutcome, match) => {
  const { runs, isWide, isNoBall, isWicket } = ballOutcome;
  
  // Clone innings to avoid mutation
  const updatedInnings = { ...innings };
  
  // Update runs
  updatedInnings.runs += runs;
  
  // Update extras
  if (isWide) {
    updatedInnings.extras.wides += 1;
    updatedInnings.totalExtras += 1;
  } else if (isNoBall) {
    updatedInnings.extras.noBalls += 1;
    updatedInnings.totalExtras += 1;
  }

  // Update overs (only if not a wide or no ball)
  if (!isWide && !isNoBall) {
    updatedInnings.overs = parseFloat((Math.floor(updatedInnings.overs) + (((updatedInnings.overs * 10) % 10 + 1) / 10)).toFixed(1));
  }

  // Update current over history
  const currentOverIndex = updatedInnings.overHistory.length - 1;
  updatedInnings.overHistory[currentOverIndex] = {
    ...updatedInnings.overHistory[currentOverIndex],
    runs: [...updatedInnings.overHistory[currentOverIndex].runs, { runs, isWide, isNoBall, isWicket }]
  };

  // If over complete, add new over to history
  if (!isWide && !isNoBall && (updatedInnings.overs * 10) % 10 === 0 && updatedInnings.overs > 0) {
    updatedInnings.overHistory.push({
      over: Math.floor(updatedInnings.overs) + 1,
      runs: []
    });
  }

  // Update batsmen
  updatedInnings.batsmen = updatedInnings.batsmen.map(batsman => {
    if (batsman.onStrike) {
      let updatedBatsman = {
        ...batsman,
        runs: batsman.runs + runs,
        balls: isWide ? batsman.balls : batsman.balls + 1,
        fours: runs === 4 ? batsman.fours + 1 : batsman.fours,
        sixes: runs === 6 ? batsman.sixes + 1 : batsman.sixes,
      };
      
      // Update strike rate
      updatedBatsman.strikeRate = updatedBatsman.balls > 0 
        ? parseFloat(((updatedBatsman.runs / updatedBatsman.balls) * 100).toFixed(2)) 
        : 0;
      
      // Change strike if runs are odd or over complete
      const isOddRun = runs % 2 === 1;
      const isOverComplete = !isWide && !isNoBall && (updatedInnings.overs * 10) % 10 === 0 && updatedInnings.overs > 0;
      updatedBatsman.onStrike = isOverComplete ? !updatedBatsman.onStrike : (isOddRun ? !updatedBatsman.onStrike : updatedBatsman.onStrike);
      
      return updatedBatsman;
    } else {
      // Non-striker
      // Change strike if runs are odd or over complete
      const isOddRun = runs % 2 === 1;
      const isOverComplete = !isWide && !isNoBall && (updatedInnings.overs * 10) % 10 === 0 && updatedInnings.overs > 0;
      return {
        ...batsman,
        onStrike: isOverComplete ? !batsman.onStrike : (isOddRun ? !batsman.onStrike : batsman.onStrike)
      };
    }
  });
  
  // Update bowlers
  const currentBowler = updatedInnings.bowlers.find(b => b.currentlyBowling);
  const currentBowlerIndex = updatedInnings.bowlers.findIndex(b => b.currentlyBowling);
  
  if (currentBowler) {
    // Update bowling stats
    const updatedBowler = {
      ...currentBowler,
      runs: currentBowler.runs + runs,
      overs: !isWide && !isNoBall 
        ? parseFloat((Math.floor(currentBowler.overs) + (((currentBowler.overs * 10) % 10 + 1) / 10)).toFixed(1)) 
        : currentBowler.overs,
      wickets: isWicket ? currentBowler.wickets + 1 : currentBowler.wickets
    };
    
    // Calculate economy rate
    const totalOvers = Math.floor(updatedBowler.overs) + ((updatedBowler.overs * 10) % 10) / 6;
    updatedBowler.economy = totalOvers > 0 
      ? parseFloat((updatedBowler.runs / totalOvers).toFixed(2)) 
      : 0;
    
    // Check if over is complete to change bowler
    const isOverComplete = !isWide && !isNoBall && (updatedInnings.overs * 10) % 10 === 0 && updatedInnings.overs > 0;
    
    if (isOverComplete) {
      updatedBowler.currentlyBowling = false;
      // For simplicity, we're rotating bowlers sequentially
      // In a real app, this would be more complex based on team strategy
      const nextBowlerIndex = (currentBowlerIndex + 1) % updatedInnings.bowlers.length;
      updatedInnings.bowlers = [
        ...updatedInnings.bowlers.slice(0, currentBowlerIndex),
        updatedBowler,
        ...updatedInnings.bowlers.slice(currentBowlerIndex + 1)
      ];
      
      // Mark the next bowler as currently bowling
      updatedInnings.bowlers[nextBowlerIndex] = {
        ...updatedInnings.bowlers[nextBowlerIndex],
        currentlyBowling: true
      };
    } else {
      // Update the current bowler
      updatedInnings.bowlers = [
        ...updatedInnings.bowlers.slice(0, currentBowlerIndex),
        updatedBowler,
        ...updatedInnings.bowlers.slice(currentBowlerIndex + 1)
      ];
    }
  }
  
  // Handle wickets
  if (isWicket) {
    updatedInnings.wickets += 1;
    
    // Record fall of wicket
    const currentBatsman = updatedInnings.batsmen.find(b => b.onStrike);
    updatedInnings.fallOfWickets.push({
      runs: updatedInnings.runs,
      wickets: updatedInnings.wickets,
      overs: updatedInnings.overs,
      playerId: currentBatsman.id
    });
    
    // If wickets < 10, bring in new batsman
    if (updatedInnings.wickets < 10) {
      // Find a batsman who hasn't batted yet
      // In a real app, we'd have a proper batting order
      const battingTeamId = updatedInnings.battingTeam;
      const battingTeamPlayers = battingTeamId === match.team1Id ? match.team1PlayingXI : match.team2PlayingXI;
      const playersWhoHaveBatted = updatedInnings.batsmen.map(b => b.id);
      const nextBatsman = battingTeamPlayers.find(p => 
        !playersWhoHaveBatted.includes(p.id) && 
        (p.role === 'Batsman' || p.role === 'All-Rounder' || p.role === 'Wicket Keeper')
      );
      
      if (nextBatsman) {
        // Remove the dismissed batsman and add new one
        updatedInnings.batsmen = updatedInnings.batsmen
          .filter(b => !b.onStrike)
          .concat([{
            ...nextBatsman,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            onStrike: true
          }]);
      }
    }
  }
  
  // Update run rates and projections
 // At the bottom of the file, add the missing closing brace:

  // Update run rates and projections
  if (updatedInnings.overs > 0) {
    const totalOvers = Math.floor(updatedInnings.overs) + ((updatedInnings.overs * 10) % 10) / 6;
    updatedInnings.runRate = parseFloat((updatedInnings.runs / totalOvers).toFixed(2));
    
    if (updatedInnings.target) {
      const remainingRuns = updatedInnings.target - updatedInnings.runs;
      const remainingOvers = match.overs - totalOvers;
      
      if (remainingOvers > 0) {
        updatedInnings.requiredRunRate = parseFloat((remainingRuns / remainingOvers).toFixed(2));
      } else {
        updatedInnings.requiredRunRate = remainingRuns > 0 ? 999.99 : 0;
      }
    } else {
      updatedInnings.projectedScore = parseInt(updatedInnings.runs * (match.overs / totalOvers));
    }
  }
  
  return updatedInnings;
}; // Add this closing brace to fix the error