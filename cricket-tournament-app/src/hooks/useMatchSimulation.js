import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateMatchId, calculateNetRunRate } from '../utils/matchHelper';

export function useMatchSimulation() {
  const [tournamentData] = useLocalStorage('tournamentData', null);
  const [matchesData, setMatchesData] = useLocalStorage('matchesData', {
    matches: [],
    ongoing: null,
    completed: [],
    pointsTable: []
  });
  
  const [currentMatch, setCurrentMatch] = useState(null);
  const [innings, setInnings] = useState(1);
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overs, setOvers] = useState(0);
  const [balls, setBalls] = useState(0);
  const [target, setTarget] = useState(null);
  const [matchStatus, setMatchStatus] = useState('setup'); // 'setup', 'active', 'completed'
  const [highlightText, setHighlightText] = useState([]);
  const [playerPerformances, setPlayerPerformances] = useState({
    batting: {},
    bowling: {}
  });

  // Initialize points table if not already
  useEffect(() => {
    if (tournamentData && (!matchesData.pointsTable || matchesData.pointsTable.length === 0)) {
      const initialPointsTable = tournamentData.teams.map(team => ({
        teamId: team.id,
        teamName: team.name,
        matches: 0,
        won: 0,
        lost: 0,
        tied: 0,
        points: 0,
        nrr: 0,
        forRuns: 0,
        forOvers: 0,
        againstRuns: 0,
        againstOvers: 0
      }));
      
      setMatchesData(prev => ({
        ...prev,
        pointsTable: initialPointsTable
      }));
    }
  }, [tournamentData, matchesData.pointsTable, setMatchesData]);

  // Create a new match
  const createMatch = useCallback((teamA, teamB, matchType = 'league') => {
    if (!teamA || !teamB) return null;
    
    const newMatch = {
      id: generateMatchId(),
      team1: {
        id: teamA.id,
        name: teamA.name,
        score: 0,
        wickets: 0,
        overs: 0,
        balls: 0
      },
      team2: {
        id: teamB.id,
        name: teamB.name,
        score: 0,
        wickets: 0,
        overs: 0,
        balls: 0
      },
      type: matchType,
      status: 'scheduled',
      date: new Date().toISOString(),
      winner: null,
      highlight: []
    };
    
    setMatchesData(prev => ({
      ...prev,
      matches: [...prev.matches, newMatch]
    }));
    
    return newMatch;
  }, [setMatchesData]);

  // Start a match
  const startMatch = useCallback((match) => {
    setCurrentMatch(match);
    setInnings(1);
    setRuns(0);
    setWickets(0);
    setOvers(0);
    setBalls(0);
    setTarget(null);
    setMatchStatus('active');
    setHighlightText([]);
    setPlayerPerformances({
      batting: {},
      bowling: {}
    });
    
    // Set match as ongoing
    setMatchesData(prev => ({
      ...prev,
      ongoing: match.id
    }));
    
    addHighlight(`🏏 Match between ${match.team1.name} and ${match.team2.name} has begun!`);
    
    return match;
  }, [setMatchesData]);

  // Update match score
  const updateScore = useCallback((runsAdded, isWicket = false) => {
    if (matchStatus !== 'active' || !currentMatch) return;
    
    // Update runs and wickets
    setRuns(prev => prev + runsAdded);
    if (isWicket) {
      setWickets(prev => prev + 1);
    }
    
    // Update balls and overs
    setBalls(prev => {
      const newBalls = prev + 1;
      if (newBalls === 6) {
        setOvers(prevOvers => prevOvers + 1);
        return 0;
      }
      return newBalls;
    });
    
    // Generate highlight text
    let highlightMsg = '';
    if (runsAdded === 4) {
      highlightMsg = '🔥 A beautiful FOUR!';
    } else if (runsAdded === 6) {
      highlightMsg = '💥 It\'s a massive SIX!';
    } else if (isWicket) {
      highlightMsg = '🎯 WICKET! The bowler strikes!';
    }
    
    if (highlightMsg) {
      addHighlight(highlightMsg);
    }
    
    // Check for innings or match completion
    checkInningsStatus();
  }, [matchStatus, currentMatch]);

  // Add a highlight message
  const addHighlight = (text) => {
    const timestamp = new Date().toLocaleTimeString();
    setHighlightText(prev => [...prev, { text, timestamp }]);
  };

  // Check innings status
  const checkInningsStatus = useCallback(() => {
    if (!currentMatch) return;
    
    const maxOvers = 20; // T20 format by default
    const maxWickets = 10;
    
    // Check if innings is complete
    const isInningsComplete = 
      (overs >= maxOvers && balls === 0) || 
      wickets >= maxWickets ||
      (innings === 2 && target && runs > target);
    
    if (isInningsComplete) {
      if (innings === 1) {
        // Update match state after first innings
        const updatedMatch = {
          ...currentMatch,
          team1: {
            ...currentMatch.team1,
            score: runs,
            wickets: wickets,
            overs: overs + (balls / 10) // Convert to decimal overs
          }
        };
        
        setCurrentMatch(updatedMatch);
        setTarget(runs);
        setInnings(2);
        setRuns(0);
        setWickets(0);
        setOvers(0);
        setBalls(0);
        
        addHighlight(`🏏 ${currentMatch.team1.name} finished their innings with ${runs}/${wickets} in ${overs}.${balls} overs`);
        addHighlight(`🎯 ${currentMatch.team2.name} needs ${runs + 1} runs to win`);
      } else {
        // End of match
        let winnerTeam = null;
        let resultText = '';
        
        const team2Score = runs;
        const team2Wickets = wickets;
        const team2Overs = overs + (balls / 10); // Convert to decimal overs
        
        if (team2Score > currentMatch.team1.score) {
          winnerTeam = currentMatch.team2.id;
          resultText = `${currentMatch.team2.name} won by ${10 - team2Wickets} wickets`;
        } else if (team2Score < currentMatch.team1.score) {
          winnerTeam = currentMatch.team1.id;
          resultText = `${currentMatch.team1.name} won by ${currentMatch.team1.score - team2Score} runs`;
        } else {
          resultText = 'Match tied';
        }
        
        // Update match data
        const completedMatch = {
          ...currentMatch,
          team2: {
            ...currentMatch.team2,
            score: team2Score,
            wickets: team2Wickets,
            overs: team2Overs
          },
          status: 'completed',
          winner: winnerTeam,
          highlights: highlightText
        };
        
        // Update matches data
        setMatchesData(prev => {
          // Update points table
          const updatedPointsTable = updatePointsTable(
            prev.pointsTable,
            completedMatch
          );
          
          return {
            ...prev,
            ongoing: null,
            completed: [...prev.completed, completedMatch],
            matches: prev.matches.filter(m => m.id !== completedMatch.id),
            pointsTable: updatedPointsTable
          };
        });
        
        setMatchStatus('completed');
        addHighlight(`🏆 Match Result: ${resultText}`);
      }
    }
  }, [currentMatch, innings, overs, balls, wickets, runs, target, highlightText, setMatchesData]);

  // Update points table
  const updatePointsTable = useCallback((pointsTable, match) => {
    return pointsTable.map(team => {
      // Skip if team not part of the match
      if (team.teamId !== match.team1.id && team.teamId !== match.team2.id) {
        return team;
      }
      
      // Update team stats
      const isTeam1 = team.teamId === match.team1.id;
      const teamScore = isTeam1 ? match.team1.score : match.team2.score;
      const teamOvers = isTeam1 ? match.team1.overs : match.team2.overs; 
      const opponentScore = isTeam1 ? match.team2.score : match.team1.score;
      const opponentOvers = isTeam1 ? match.team2.overs : match.team1.overs;
      
      const isWinner = match.winner === team.teamId;
      const isTied = match.winner === null;
      
      // Calculate new stats
      const newMatches = team.matches + 1;
      const newWon = isWinner ? team.won + 1 : team.won;
      const newLost = !isWinner && !isTied ? team.lost + 1 : team.lost;
      const newTied = isTied ? team.tied + 1 : team.tied;
      const newPoints = isWinner ? team.points + 2 : (isTied ? team.points + 1 : team.points);
      
      // Update runs and overs for NRR calculation
      const newForRuns = team.forRuns + teamScore;
      const newForOvers = team.forOvers + teamOvers;
      const newAgainstRuns = team.againstRuns + opponentScore;
      const newAgainstOvers = team.againstOvers + opponentOvers;
      
      // Calculate NRR
      const newNRR = calculateNetRunRate(newForRuns, newForOvers, newAgainstRuns, newAgainstOvers);
      
      return {
        ...team,
        matches: newMatches,
        won: newWon,
        lost: newLost,
        tied: newTied,
        points: newPoints,
        nrr: newNRR,
        forRuns: newForRuns,
        forOvers: newForOvers,
        againstRuns: newAgainstRuns,
        againstOvers: newAgainstOvers
      };
    });
  }, []);

  // Export match highlights
  const exportMatchHighlights = () => {
    if (!currentMatch || highlightText.length === 0) return;
    
    const matchInfo = `${currentMatch.team1.name} vs ${currentMatch.team2.name} - ${new Date().toLocaleDateString()}`;
    
    const highlightsText = highlightText.map(hl => 
      `[${hl.timestamp}] ${hl.text}`
    ).join('\n');
    
    const fullText = `Match Highlights: ${matchInfo}\n\n${highlightsText}`;
    
    // Create downloadable blob
    const dataBlob = new Blob([fullText], { type: 'text/plain' });
    
    // Create download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = `match_highlights_${currentMatch.id}.txt`;
    link.href = url;
    link.click();
  };

  // Get tournament stats
  const getTournamentStats = useCallback(() => {
    if (!matchesData || !matchesData.completed) return null;
    
    // Most runs (Orange Cap)
    const battingStats = {};
    // Most wickets (Purple Cap)
    const bowlingStats = {};
    
    // Aggregate player stats from completed matches
    matchesData.completed.forEach(match => {
      // Process player stats if available
      if (match.playerStats) {
        // Batting stats
        if (match.playerStats.batting) {
          Object.entries(match.playerStats.batting).forEach(([playerId, stats]) => {
            if (!battingStats[playerId]) {
              battingStats[playerId] = {
                playerId,
                playerName: stats.name,
                teamId: stats.teamId,
                teamName: stats.teamName,
                runs: 0,
                matches: 0
              };
            }
            
            battingStats[playerId].runs += stats.runs;
            battingStats[playerId].matches += 1;
          });
        }
        
        // Bowling stats
        if (match.playerStats.bowling) {
          Object.entries(match.playerStats.bowling).forEach(([playerId, stats]) => {
            if (!bowlingStats[playerId]) {
              bowlingStats[playerId] = {
                playerId,
                playerName: stats.name,
                teamId: stats.teamId,
                teamName: stats.teamName,
                wickets: 0,
                matches: 0
              };
            }
            
            bowlingStats[playerId].wickets += stats.wickets;
            bowlingStats[playerId].matches += 1;
          });
        }
      }
    });
    
    // Convert to arrays and sort
    const orangeCap = Object.values(battingStats)
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 5);
      
    const purpleCap = Object.values(bowlingStats)
      .sort((a, b) => b.wickets - a.wickets)
      .slice(0, 5);
    
    // Best team (based on points table)
    const bestTeam = [...matchesData.pointsTable]
      .sort((a, b) => {
        // Sort by points, then NRR
        if (a.points !== b.points) {
          return b.points - a.points;
        }
        return b.nrr - a.nrr;
      })[0];
    
    return {
      orangeCap,
      purpleCap,
      bestTeam
    };
  }, [matchesData]);

  return {
    matchesData,
    setMatchesData,
    currentMatch,
    innings,
    runs,
    wickets,
    overs,
    balls,
    target,
    matchStatus,
    highlightText,
    playerPerformances,
    createMatch,
    startMatch,
    updateScore,
    addHighlight,
    exportMatchHighlights,
    getTournamentStats};
}