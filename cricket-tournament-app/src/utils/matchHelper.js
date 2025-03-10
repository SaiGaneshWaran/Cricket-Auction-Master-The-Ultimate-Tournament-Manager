import { getFromStorage, saveToStorage } from '../store/localStorage';

export const calculateRequiredRunRate = (target, runsScored, oversRemaining) => {
  if (oversRemaining <= 0) return 0;
  return ((target - runsScored) / oversRemaining).toFixed(2);
};

export const calculateCurrentRunRate = (runs, overs, balls) => {
  const totalOvers = overs + (balls / 6);
  return totalOvers > 0 ? (runs / totalOvers).toFixed(2) : '0.00';
};

export const calculateNetRunRate = (runsScored, oversPlayed, runsConceded, oversBowled) => {
  const rate1 = oversPlayed > 0 ? runsScored / oversPlayed : 0;
  const rate2 = oversBowled > 0 ? runsConceded / oversBowled : 0;
  return (rate1 - rate2).toFixed(3);
};

export const createNewMatch = (team1Id, team2Id, format = 'T20') => {
  const matchId = `match-${Date.now()}`;
  const match = {
    id: matchId,
    team1: team1Id,
    team2: team2Id,
    format,
    status: 'NOT_STARTED',
    toss: null,
    firstInnings: {
      team: null,
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0
    },
    secondInnings: {
      team: null,
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0
    },
    winner: null,
    createdAt: new Date().toISOString()
  };

  const matches = getFromStorage('matches', []);
  matches.push(match);
  saveToStorage('matches', matches);
  return match;
};

export const updateMatchScore = (matchId, innings, scoreUpdate) => {
  const matches = getFromStorage('matches', []);
  const matchIndex = matches.findIndex(m => m.id === matchId);
  
  if (matchIndex === -1) return false;

  const match = matches[matchIndex];
  const inningsKey = innings === 1 ? 'firstInnings' : 'secondInnings';
  
  matches[matchIndex] = {
    ...match,
    [inningsKey]: {
      ...match[inningsKey],
      ...scoreUpdate
    }
  };

  return saveToStorage('matches', matches);
};

export const determineMatchWinner = (match) => {
  const { firstInnings, secondInnings } = match;
  
  if (firstInnings.runs > secondInnings.runs) {
    return {
      winner: match.firstInnings.team,
      margin: `${firstInnings.runs - secondInnings.runs} runs`
    };
  } else if (secondInnings.runs > firstInnings.runs) {
    return {
      winner: match.secondInnings.team,
      margin: `${10 - secondInnings.wickets} wickets`
    };
  }
  
  return { winner: null, margin: 'Match Tied' };
};

export const generatePointsTable = () => {
  const matches = getFromStorage('matches', []).filter(m => m.status === 'COMPLETED');
  const teams = getFromStorage('teams', []);
  
  const pointsTable = teams.map(team => ({
    teamId: team.id,
    teamName: team.name,
    matches: 0,
    won: 0,
    lost: 0,
    tied: 0,
    points: 0,
    nrr: 0,
    runsScored: 0,
    runsConceded: 0,
    oversPlayed: 0,
    oversBowled: 0
  }));

  matches.forEach(match => {
    const { winner } = determineMatchWinner(match);
    pointsTable.forEach(team => {
      if (team.teamId === match.team1 || team.teamId === match.team2) {
        team.matches++;
        if (winner === team.teamId) {
          team.won++;
          team.points += 2;
        } else if (winner === null) {
          team.tied++;
          team.points += 1;
        } else {
          team.lost++;
        }
      }
    });
  });

  return pointsTable.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.nrr - a.nrr;
  });
};

export const getMatchSummary = (matchId) => {
  const match = getFromStorage('matches', []).find(m => m.id === matchId);
  if (!match) return null;

  const teams = getFromStorage('teams', []);
  const team1 = teams.find(t => t.id === match.team1);
  const team2 = teams.find(t => t.id === match.team2);

  return {
    ...match,
    team1Name: team1?.name || 'Unknown Team',
    team2Name: team2?.name || 'Unknown Team',
    result: determineMatchWinner(match)
  };
};