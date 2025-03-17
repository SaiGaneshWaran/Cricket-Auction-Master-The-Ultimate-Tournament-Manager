import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTournament } from './TournamentContext';
import { generateCommentary } from '../services/commentaryGenerator';
import { calculateRunRate, calculateRequiredRunRate } from '../utils/statistics';
import { generateUniqueId, weightedRandomChoice } from '../utils/helpers';

// Create context
const MatchContext = createContext();

export const useMatch = () => useContext(MatchContext);

export const MatchProvider = ({ children }) => {
  const { updateTournament, getTournament } = useTournament();
  const [currentMatch, setCurrentMatch] = useState(null);
  const [isMatchLive, setIsMatchLive] = useState(false);
  const [matchSchedule, setMatchSchedule] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [pointsTable, setPointsTable] = useState({});
  const [performanceStats, setPerformanceStats] = useState({
    mostRuns: [],
    mostWickets: [],
    bestEconomy: [],
    highestStrikeRate: []
  });
  const [matchSimulationSpeed, setMatchSimulationSpeed] = useState(1); // 1 = normal, 2 = fast, 0.5 = slow
  const [isSimulationPaused, setIsSimulationPaused] = useState(false);
  const [autoSimulation, setAutoSimulation] = useState(false);

  // Initialize match state from tournament data
  const initializeMatchState = (tournamentData) => {
    try {
      const matches = tournamentData.matches || [];
      const completedOnes = matches.filter(m => m.status === 'completed');
      const scheduledOnes = matches.filter(m => m.status !== 'completed');
      
      setMatchSchedule(scheduledOnes);
      setCompletedMatches(completedOnes);
      
      // Generate points table
      generatePointsTable(tournamentData.teams, completedOnes);
      
      // Generate performance stats
      generatePerformanceStats(tournamentData.teams, tournamentData.players, completedOnes);
    } catch (error) {
      console.error('Error initializing match state:', error);
      toast.error('Failed to initialize match state');
    }
  };

  // Generate points table
  const generatePointsTable = (teams, matches) => {
    try {
      const table = {};
      
      // Initialize table with teams
      teams.forEach(team => {
        table[team.id] = {
          teamId: team.id,
          teamName: team.name,
          teamColor: team.color,
          played: 0,
          won: 0,
          lost: 0,
          tied: 0,
          noResult: 0,
          points: 0,
          netRunRate: 0,
          runsScored: 0,
          ballsFaced: 0,
          runsConceded: 0,
          ballsBowled: 0
        };
      });
      
      // Update table with matches
      matches.forEach(match => {
        if (match.status !== 'completed') return;
        
        const team1 = table[match.team1.id];
        const team2 = table[match.team2.id];
        
        // Update matches played
        team1.played += 1;
        team2.played += 1;
        
        // Update runs and balls
        team1.runsScored += match.team1.score;
        team1.ballsFaced += match.team1.overs * 6;
        team1.runsConceded += match.team2.score;
        team1.ballsBowled += match.team2.overs * 6;
        
        team2.runsScored += match.team2.score;
        team2.ballsFaced += match.team2.overs * 6;
        team2.runsConceded += match.team1.score;
        team2.ballsBowled += match.team1.overs * 6;
        
        // Update match result
        if (match.winnerId === match.team1.id) {
          team1.won += 1;
          team1.points += 2;
          team2.lost += 1;
        } else if (match.winnerId === match.team2.id) {
          team2.won += 1;
          team2.points += 2;
          team1.lost += 1;
        } else if (match.isTied) {
          team1.tied += 1;
          team2.tied += 1;
          team1.points += 1;
          team2.points += 1;
        } else {
          team1.noResult += 1;
          team2.noResult += 1;
          team1.points += 1;
          team2.points += 1;
        }
      });
      
      // Calculate net run rate
      Object.values(table).forEach(team => {
        if (team.ballsFaced > 0 && team.ballsBowled > 0) {
          const teamRunRate = team.runsScored / (team.ballsFaced / 6);
          const oppositionRunRate = team.runsConceded / (team.ballsBowled / 6);
          team.netRunRate = +(teamRunRate - oppositionRunRate).toFixed(3);
        }
      });
      
      setPointsTable(table);
      return table;
    } catch (error) {
      console.error('Error generating points table:', error);
      toast.error('Failed to generate points table');
      return {};
    }
  };

  // Generate performance stats
  const generatePerformanceStats = (teams, players, matches) => {
    try {
      // Initialize player stats
      const playerStats = {};
      players.forEach(player => {
        playerStats[player.id] = {
          playerId: player.id,
          playerName: player.name,
          teamId: player.team,
          teamName: teams.find(t => t.id === player.team)?.name || '',
          teamColor: teams.find(t => t.id === player.team)?.color || '',
          matches: 0,
          runs: 0,
          balls: 0,
          wickets: 0,
          overs: 0,
          runsConceded: 0,
          strikeRate: 0,
          economy: 0
        };
      });
      
      // Update stats from matches
      matches.forEach(match => {
        if (match.status !== 'completed') return;
        
        // Update batting stats
        match.battingScorecard.forEach(batsman => {
          const player = playerStats[batsman.playerId];
          if (player) {
            player.matches += 1;
            player.runs += batsman.runs;
            player.balls += batsman.balls;
            player.strikeRate = player.balls > 0 ? +(player.runs / player.balls * 100).toFixed(2) : 0;
          }
        });
        
        // Update bowling stats
        match.bowlingScorecard.forEach(bowler => {
          const player = playerStats[bowler.playerId];
          if (player) {
            player.matches += 1;
            player.wickets += bowler.wickets;
            player.overs += bowler.overs;
            player.runsConceded += bowler.runs;
            player.economy = player.overs > 0 ? +(player.runsConceded / player.overs).toFixed(2) : 0;
          }
        });
      });
      
      // Sort and pick top performers
      const mostRuns = Object.values(playerStats)
        .filter(p => p.runs > 0)
        .sort((a, b) => b.runs - a.runs)
        .slice(0, 10);
      
      const mostWickets = Object.values(playerStats)
        .filter(p => p.wickets > 0)
        .sort((a, b) => b.wickets - a.wickets)
        .slice(0, 10);
      
      const bestEconomy = Object.values(playerStats)
        .filter(p => p.overs >= 4)
        .sort((a, b) => a.economy - b.economy)
        .slice(0, 10);
      
      const highestStrikeRate = Object.values(playerStats)
        .filter(p => p.runs >= 50)
        .sort((a, b) => b.strikeRate - a.strikeRate)
        .slice(0, 10);
      
      setPerformanceStats({
        mostRuns,
        mostWickets,
        bestEconomy,
        highestStrikeRate
      });
      
      return {
        mostRuns,
        mostWickets,
        bestEconomy,
        highestStrikeRate
      };
    } catch (error) {
      console.error('Error generating performance stats:', error);
      toast.error('Failed to generate performance stats');
      return {
        mostRuns: [],
        mostWickets: [],
        bestEconomy: [],
        highestStrikeRate: []
      };
    }
  };

  // Create a new match
  const createMatch = (tournamentId, team1Id, team2Id, matchType = 'league', venue = 'Home Ground', date = new Date().toISOString()) => {
    try {
      const tournament = getTournament(tournamentId);
      const team1 = tournament.teams.find(t => t.id === team1Id);
      const team2 = tournament.teams.find(t => t.id === team2Id);
      
      if (!team1 || !team2) {
        throw new Error('Teams not found');
      }
      
      const matchId = generateUniqueId();
      const newMatch = {
        id: matchId,
        tournamentId,
        matchType,
        venue,
        date,
        team1: {
          id: team1.id,
          name: team1.name,
          color: team1.color,
          players: team1.players || [],
          score: 0,
          wickets: 0,
          overs: 0,
          extras: 0
        },
        team2: {
          id: team2.id,
          name: team2.name,
          color: team2.color,
          players: team2.players || [],
          score: 0,
          wickets: 0,
          overs: 0,
          extras: 0
        },
        tossWinner: null,
        tossDecision: null,
        status: 'scheduled',
        currentInnings: 1,
        battingTeam: null,
        bowlingTeam: null,
        currentOver: 0,
        currentBall: 0,
        currentBatsmen: [],
        currentBowler: null,
        battingScorecard: [],
        bowlingScorecard: [],
        commentary: [],
        overs: 20,
        lastUpdated: new Date().toISOString(),
        innings1: {
          overs: [],
          partnerships: []
        },
        innings2: {
          overs: [],
          partnerships: []
        },
        winnerId: null,
        isTied: false
      };
      
      // Update tournament matches
      const updatedMatches = [...(tournament.matches || []), newMatch];
      updateTournament(tournamentId, { matches: updatedMatches });
      
      // Update local state
      setMatchSchedule(prev => [...prev, newMatch]);
      
      return newMatch;
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error(error.message || 'Failed to create match');
      throw error;
    }
  };

  // Start a match
  const startMatch = (tournamentId, matchId) => {
    try {
      const tournament = getTournament(tournamentId);
      const match = tournament.matches.find(m => m.id === matchId);
      
      if (!match) {
        throw new Error('Match not found');
      }
      
      // Determine toss winner and decision
      const tossWinner = Math.random() > 0.5 ? match.team1.id : match.team2.id;
      const tossDecision = Math.random() > 0.5 ? 'bat' : 'bowl';
      
      // Set batting and bowling teams based on toss
      let battingTeamId, bowlingTeamId;
      if (tossDecision === 'bat') {
        battingTeamId = tossWinner;
        bowlingTeamId = tossWinner === match.team1.id ? match.team2.id : match.team1.id;
      } else {
        bowlingTeamId = tossWinner;
        battingTeamId = tossWinner === match.team1.id ? match.team2.id : match.team1.id;
      }
      
      // Update match
      const updatedMatch = {
        ...match,
        tossWinner,
        tossDecision,
        status: 'live',
        currentInnings: 1,
        battingTeam: battingTeamId,
        bowlingTeam: bowlingTeamId,
        currentOver: 0,
        currentBall: 0,
        currentBatsmen: [],
        currentBowler: null,
        commentary: [
          {
            id: generateUniqueId(),
            text: `${match.team1.name} vs ${match.team2.name} - Match is about to begin!`,
            type: 'info',
            timestamp: new Date().toISOString()
          },
          {
            id: generateUniqueId(),
            text: `${tossWinner === match.team1.id ? match.team1.name : match.team2.name} won the toss and elected to ${tossDecision} first`,
            type: 'toss',
            timestamp: new Date().toISOString()
          }
        ],
        lastUpdated: new Date().toISOString()
      };
      
      // Update tournament
      const updatedMatches = tournament.matches.map(m => 
        m.id === matchId ? updatedMatch : m
      );
      
      updateTournament(tournamentId, { matches: updatedMatches });
      
      // Update local state
      setCurrentMatch(updatedMatch);
      setIsMatchLive(true);
      setMatchSchedule(prev => prev.filter(m => m.id !== matchId));
      
      return updatedMatch;
    } catch (error) {
      console.error('Error starting match:', error);
      toast.error(error.message || 'Failed to start match');
      throw error;
    }
  };

  // Simulate a ball
  const simulateBall = () => {
    try {
      if (!currentMatch || !isMatchLive) {
        throw new Error('No live match to simulate');
      }
      
      // Deep copy the match to avoid mutation
      const match = JSON.parse(JSON.stringify(currentMatch));
      
      // Determine current innings
      const innings = match.currentInnings === 1 ? 'innings1' : 'innings2';
      
      // Simulate a ball outcome
      const outcomes = ['0', '1', '2', '3', '4', '6', 'W', 'WD', 'NB', 'LB', 'B'];
      const weights = [30, 25, 10, 3, 15, 5, 7, 2, 1, 1, 1];
      const outcome = weightedRandomChoice(outcomes, weights);
      
      // Process outcome
      processOutcome(match, outcome, innings);
      
      // Update match
      setCurrentMatch(match);
      
      // Update tournament if match status changes
      if (match.status === 'completed') {
        finishMatch(match);
      }
      
      return match;
    } catch (error) {
      console.error('Error simulating ball:', error);
      toast.error(error.message || 'Failed to simulate ball');
      throw error;
    }
  };

  // Process a ball outcome
  const processOutcome = (match, outcome, innings) => {
    // Implement ball outcome processing logic
    // This will update match state based on the outcome (run, wicket, extra, etc.)
    
    // For example:
    if (outcome === 'W') {
      // Update wickets, commentary, etc.
      const battingTeam = match.battingTeam === match.team1.id ? 'team1' : 'team2';
      match[battingTeam].wickets += 1;
      
      // Add commentary
      match.commentary.push({
        id: generateUniqueId(),
        text: generateCommentary('wicket'),
        type: 'wicket',
        timestamp: new Date().toISOString()
      });
      
      // Check if innings is over
      if (match[battingTeam].wickets >= 10 || 
          (match.currentOver >= match.overs - 1 && match.currentBall >= 5)) {
        endInnings(match);
      }
    } else if (['0', '1', '2', '3', '4', '6'].includes(outcome)) {
      // Update runs, commentary, etc.
      const runs = parseInt(outcome);
      const battingTeam = match.battingTeam === match.team1.id ? 'team1' : 'team2';
      match[battingTeam].score += runs;
      
      // Add commentary
      match.commentary.push({
        id: generateUniqueId(),
        text: generateCommentary(runs === 4 ? 'boundary' : runs === 6 ? 'six' : 'run', runs),
        type: runs === 4 ? 'boundary' : runs === 6 ? 'six' : 'run',
        timestamp: new Date().toISOString()
      });
      
      // Check if target achieved in second innings
      if (match.currentInnings === 2) {
        const batting = match.battingTeam === match.team1.id ? 'team1' : 'team2';
        const bowling = match.bowlingTeam === match.team1.id ? 'team1' : 'team2';
        
        if (match[batting].score > match[bowling].score) {
          match.winnerId = match.battingTeam;
          match.status = 'completed';
          
          // Add commentary
          match.commentary.push({
            id: generateUniqueId(),
            text: `${match[batting].name} wins by ${10 - match[batting].wickets} wickets!`,
            type: 'result',
            timestamp: new Date().toISOString()
          });
        }
      }
    } else if (['WD', 'NB'].includes(outcome)) {
      // Update extras, commentary, etc.
      const battingTeam = match.battingTeam === match.team1.id ? 'team1' : 'team2';
      match[battingTeam].score += 1;
      match[battingTeam].extras += 1;
      
      // Add commentary
      match.commentary.push({
        id: generateUniqueId(),
        text: generateCommentary(outcome === 'WD' ? 'wide' : 'noBall'),
        type: 'extra',
        timestamp: new Date().toISOString()
      });
      
      // Don't increment ball count for extras
      return;
    } else if (['LB', 'B'].includes(outcome)) {
      // Update extras, commentary, etc.
      const battingTeam = match.battingTeam === match.team1.id ? 'team1' : 'team2';
      match[battingTeam].score += 1;
      match[battingTeam].extras += 1;
      
      // Add commentary
      match.commentary.push({
        id: generateUniqueId(),
        text: generateCommentary(outcome === 'LB' ? 'legBye' : 'bye'),
        type: 'extra',
        timestamp: new Date().toISOString()
      });
    }
    
    // Update ball and over count
    match.currentBall += 1;
    if (match.currentBall === 6) {
      match.currentBall = 0;
      match.currentOver += 1;
      
      // Update overs in team stats
      const battingTeam = match.battingTeam === match.team1.id ? 'team1' : 'team2';
      match[battingTeam].overs = match.currentOver + (match.currentBall / 6);
      
      // Add over commentary
      match.commentary.push({
        id: generateUniqueId(),
        text: `End of over ${match.currentOver}: ${match[battingTeam].score}/${match[battingTeam].wickets}`,
        type: 'overEnd',
        timestamp: new Date().toISOString()
      });
      
      // Check if innings is over
      if (match.currentOver >= match.overs) {
        endInnings(match);
      }
    }
    
    // Update last updated timestamp
    match.lastUpdated = new Date().toISOString();
  };

  // End the current innings
  const endInnings = (match) => {
    // If it's the first innings, switch to second innings
    if (match.currentInnings === 1) {
      match.currentInnings = 2;
      
      // Swap batting and bowling teams
      const tempBattingTeam = match.battingTeam;
      match.battingTeam = match.bowlingTeam;
      match.bowlingTeam = tempBattingTeam;
      
      // Reset over and ball count
      match.currentOver = 0;
      match.currentBall = 0;
      
      // Add commentary
      const firstInningsBattingTeam = match.bowlingTeam === match.team1.id ? 'team1' : 'team2';
      const target = match[firstInningsBattingTeam].score + 1;
      
      match.commentary.push({
        id: generateUniqueId(),
        text: `End of first innings. ${match[firstInningsBattingTeam].name} scored ${match[firstInningsBattingTeam].score}/${match[firstInningsBattingTeam].wickets}`,
        type: 'inningsEnd',
        timestamp: new Date().toISOString()
      });
      
      match.commentary.push({
        id: generateUniqueId(),
        text: `${match.battingTeam === match.team1.id ? match.team1.name : match.team2.name} needs ${target} runs to win from ${match.overs * 6} balls`,
        type: 'target',
        timestamp: new Date().toISOString()
      });
    } else {
      // End of match
      match.status = 'completed';
      
      // Determine winner
      const team1Score = match.team1.score;
      const team2Score = match.team2.score;
      
      if (team1Score > team2Score) {
        match.winnerId = match.team1.id;
        match.commentary.push({
          id: generateUniqueId(),
          text: `${match.team1.name} wins by ${team1Score - team2Score} runs!`,
          type: 'result',
          timestamp: new Date().toISOString()
        });
      } else if (team2Score > team1Score) {
        match.winnerId = match.team2.id;
        match.commentary.push({
          id: generateUniqueId(),
          text: `${match.team2.name} wins by ${team2Score - team1Score} runs!`,
          type: 'result',
          timestamp: new Date().toISOString()
        });
      } else {
        match.isTied = true;
        match.commentary.push({
          id: generateUniqueId(),
          text: `Match tied! Both teams scored ${team1Score} runs`,
          type: 'result',
          timestamp: new Date().toISOString()
        });
      }
      
      // Update match
      setIsMatchLive(false);
    }
    
    // Update last updated timestamp
    match.lastUpdated = new Date().toISOString();
  };

  // Finish a match and update tournament data
  const finishMatch = (match) => {
    try {
      // Get tournament
      const tournament = getTournament(match.tournamentId);
      
      // Update tournament matches
      const updatedMatches = tournament.matches.map(m => 
        m.id === match.id ? match : m
      );
      
      updateTournament(match.tournamentId, { matches: updatedMatches });
      
      // Update local state
      setCurrentMatch(null);
      setIsMatchLive(false);
      setCompletedMatches(prev => [...prev, match]);
      
      // Update points table and performance stats
      generatePointsTable(tournament.teams, [...completedMatches, match]);
      generatePerformanceStats(tournament.teams, tournament.players, [...completedMatches, match]);
      
      return match;
    } catch (error) {
      console.error('Error finishing match:', error);
      toast.error(error.message || 'Failed to finish match');
      throw error;
    }
  };

  // Toggle auto simulation
  const toggleAutoSimulation = () => {
    setAutoSimulation(prev => !prev);
  };

  // Set simulation speed
  const setSimulationSpeed = (speed) => {
    setMatchSimulationSpeed(speed);
  };

  // Toggle simulation pause
  const toggleSimulationPause = () => {
    setIsSimulationPaused(prev => !prev);
  };

  // Auto simulation effect
  useEffect(() => {
    let interval;
    
    if (autoSimulation && isMatchLive && !isSimulationPaused) {
      // Calculate interval based on simulation speed
      const intervalTime = 1000 / matchSimulationSpeed;
      
      interval = setInterval(() => {
        simulateBall();
      }, intervalTime);
    }
    
    return () => clearInterval(interval);
  }, [autoSimulation, isMatchLive, isSimulationPaused, matchSimulationSpeed]);

  const contextValue = {
    currentMatch,
    isMatchLive,
    matchSchedule,
    completedMatches,
    pointsTable,
    performanceStats,
    matchSimulationSpeed,
    isSimulationPaused,
    autoSimulation,
    initializeMatchState,
    generatePointsTable,
    generatePerformanceStats,
    createMatch,
    startMatch,
    simulateBall,
    toggleAutoSimulation,
    setSimulationSpeed,
    toggleSimulationPause
  };

  return (
    <MatchContext.Provider value={contextValue}>
      {children}
    </MatchContext.Provider>
  );
};

export default MatchProvider;