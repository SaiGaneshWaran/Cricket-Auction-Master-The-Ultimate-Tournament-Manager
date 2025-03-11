// Utility functions for match simulation and scoreboard

// Generate a unique match ID
export const generateMatchId = () => {
  return `match_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

// Calculate Net Run Rate (NRR)
export const calculateNetRunRate = (forRuns, forOvers, againstRuns, againstOvers) => {
  // Ensure we don't divide by zero
  if (forOvers === 0 || againstOvers === 0) return 0;
  
  const forRate = forRuns / forOvers;
  const againstRate = againstRuns / againstOvers;
  
  return parseFloat((forRate - againstRate).toFixed(3));
};

// Format overs (convert decimal overs to overs.balls format)
export const formatOvers = (overs) => {
  if (typeof overs !== 'number') return '0.0';
  
  const wholePart = Math.floor(overs);
  const decimalPart = Math.round((overs - wholePart) * 10);
  
  return `${wholePart}.${decimalPart}`;
};

// Calculate required run rate
export const calculateRequiredRunRate = (target, currentScore, oversRemaining) => {
  if (!target || oversRemaining <= 0) return 0;
  
  const runsRequired = target - currentScore;
  return parseFloat((runsRequired / oversRemaining).toFixed(2));
};

// Generate Commentary for ball events
export const generateCommentary = (ballEvent) => {
  const { runs, isWicket, batter, bowler } = ballEvent;
  
  const sixPhrases = [
    `🔥 ${batter} smashes a magnificent SIX!`,
    `💥 It's gone all the way! ${batter} with a huge SIX!`,
    `🚀 That's massive! ${batter} launches ${bowler} for a SIX!`,
    `💪 ${batter} shows tremendous power with that SIX!`,
    `🏏 What a shot! ${batter} sends it into the stands for SIX!`
  ];
  
  const fourPhrases = [
    `👏 Beautiful shot! ${batter} finds the boundary for FOUR!`,
    `🏏 Elegant timing by ${batter} for FOUR runs!`,
    `💫 ${batter} threads that perfectly through the field for FOUR!`,
    `🔥 Exquisite placement by ${batter} for FOUR more!`,
    `⚡ ${batter} punishes that loose delivery from ${bowler} with a FOUR!`
  ];
  
  const wicketPhrases = [
    `🎯 GOT HIM! ${bowler} dismisses ${batter}!`,
    `🔥 WICKET! ${bowler} strikes at a crucial moment!`,
    `🎪 ${batter} is walking back to the pavilion! Great bowling by ${bowler}!`,
    `🧤 And ${batter} is OUT! What a delivery from ${bowler}!`,
    `🏏 That's the end of ${batter}'s innings! ${bowler} gets the breakthrough!`
  ];
  
  const dotBallPhrases = [
    `🎯 Good delivery from ${bowler}, no run.`,
    `👍 ${batter} defends solidly.`,
    `🛡️ ${batter} respects that good ball from ${bowler}.`,
    `🏏 Dot ball, good line and length from ${bowler}.`,
    `🔒 ${bowler} keeping it tight, no run.`
  ];
  
  const singlePhrases = [
    `${batter} takes a quick single.`,
    `Good running between the wickets, one run.`,
    `${batter} pushes it for a single.`,
    `One run added to the total.`,
    `${batter} works it away for a single.`
  ];
  
  const doublePhrases = [
    `${batter} comes back for two runs.`,
    `Good running by ${batter}, takes two.`,
    `Quick between the wickets, two runs.`,
    `${batter} pushes it into the gap for two.`,
    `Two runs added to the score.`
  ];
  
  const triplePhrases = [
    `${batter} hustles for three runs!`,
    `Excellent running between the wickets, three taken!`,
    `${batter} finds the gap and they run three!`,
    `Three runs, great effort in the field!`,
    `Good running by the batters, three added to the total!`
  ];
  
  // Select appropriate phrase based on event
  if (isWicket) {
    return wicketPhrases[Math.floor(Math.random() * wicketPhrases.length)];
  } else if (runs === 6) {
    return sixPhrases[Math.floor(Math.random() * sixPhrases.length)];
  } else if (runs === 4) {
    return fourPhrases[Math.floor(Math.random() * fourPhrases.length)];
  } else if (runs === 0) {
    return dotBallPhrases[Math.floor(Math.random() * dotBallPhrases.length)];
  } else if (runs === 1) {
    return singlePhrases[Math.floor(Math.random() * singlePhrases.length)];
  } else if (runs === 2) {
    return doublePhrases[Math.floor(Math.random() * doublePhrases.length)];
  } else if (runs === 3) {
    return triplePhrases[Math.floor(Math.random() * triplePhrases.length)];
  }
  
  return `${runs} runs scored by ${batter}.`;
};

// Generate match result text
export const generateMatchResult = (match) => {
  if (!match || match.status !== 'completed') {
    return 'Match in progress';
  }
  
  const team1 = match.team1;
  const team2 = match.team2;
  
  if (match.winner === team1.id) {
    return `${team1.name} won by ${team1.score - team2.score} runs`;
  } else if (match.winner === team2.id) {
    return `${team2.name} won by ${10 - team2.wickets} wickets`;
  } else {
    return 'Match tied';
  }
};

// Generate randomized player performance statistics for a match
export const generatePlayerPerformance = (players, team1Id, team2Id) => {
  const performance = {
    batting: {},
    bowling: {}
  };
  
  // Get team players
  const team1Players = players.filter(p => p.team === team1Id);
  const team2Players = players.filter(p => p.team === team2Id);
  
  // Generate batting stats for team 1
  team1Players.slice(0, 8).forEach((player, index) => {
    const runs = Math.floor(Math.random() * (index === 0 || index === 1 ? 80 : 40));
    const balls = Math.max(1, Math.floor(runs * (1 + Math.random() * 0.5)));
    
    performance.batting[player.id] = {
      playerId: player.id,
      name: player.name,
      teamId: team1Id,
      runs,
      balls,
      fours: Math.floor(runs / 10),
      sixes: Math.floor(runs / 20),
      strikeRate: parseFloat(((runs / balls) * 100).toFixed(2))
    };
  });
  
  // Generate batting stats for team 2
  team2Players.slice(0, 8).forEach((player, index) => {
    const runs = Math.floor(Math.random() * (index === 0 || index === 1 ? 80 : 40));
    const balls = Math.max(1, Math.floor(runs * (1 + Math.random() * 0.5)));
    
    performance.batting[player.id] = {
      playerId: player.id,
      name: player.name,
      teamId: team2Id,
      runs,
      balls,
      fours: Math.floor(runs / 10),
      sixes: Math.floor(runs / 20),
      strikeRate: parseFloat(((runs / balls) * 100).toFixed(2))
    };
  });
  
  // Generate bowling stats for team 1
  team1Players.filter(p => p.role === 'Bowler' || p.role === 'All-Rounder').forEach((player) => {
    const overs = 2 + Math.floor(Math.random() * 2);
    const maidens = Math.floor(Math.random() * 2);
    const runs = Math.floor(overs * 6 * Math.random() * 2);
    const wickets = Math.floor(Math.random() * 3);
    
    performance.bowling[player.id] = {
      playerId: player.id,
      name: player.name,
      teamId: team1Id,
      overs,
      maidens,
      runs,
      wickets,
      economy: parseFloat((runs / overs).toFixed(2))
    };
  });
  
  // Generate bowling stats for team 2
  team2Players.filter(p => p.role === 'Bowler' || p.role === 'All-Rounder').forEach((player) => {
    const overs = 2 + Math.floor(Math.random() * 2);
    const maidens = Math.floor(Math.random() * 2);
    const runs = Math.floor(overs * 6 * Math.random() * 2);
    const wickets = Math.floor(Math.random() * 3);
    
    performance.bowling[player.id] = {
      playerId: player.id,
      name: player.name,
      teamId: team2Id,
      overs,
      maidens,
      runs,
      wickets,
      economy: parseFloat((runs / overs).toFixed(2))
    };
  });
  
  return performance;
};