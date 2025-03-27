// src/services/tournamentService.js
import { v4 as uuidv4 } from 'uuid';
import { getFromStorage, saveToStorage, removeFromStorage } from '../utils/storage.js';
import { 
  generatePlayerPool, 
  generateTournamentSchedule, 
  updateTournamentSchedule, 
  generatePlayerPerformance 
} from '../utils/playerGenerator.js';
import { generateAccessCode, generateTeamColor } from '../utils/helpers.js';
import { initializeAuction, getAuctionById } from './auctionService.js';

const STORAGE_KEY = 'cricket_tournament_data';

/**
 * Create a new tournament
 * @param {Object} tournamentData - Tournament data
 * @returns {Object} Created tournament
 */
export const createTournament = (tournamentData) => {
  try {
    const id = tournamentData.id || uuidv4();
    const now = new Date().toISOString();
    
    // Generate access codes
    const captainCode = generateAccessCode(6);
    const viewerCode = generateAccessCode(6);
    
    // Generate team budgets
    const teamBudget = tournamentData.teamBudget || 10000000; // 1 Crore default
    const teams = tournamentData.teams || [];
    
    // Ensure each team has required properties
    const enhancedTeams = teams.map(team => ({
      id: team.id || uuidv4(),
      name: team.name,
      shortName: team.shortName || team.name.substring(0, 3).toUpperCase(),
      color: team.color || generateTeamColor(),
      logo: team.logo || null,
      captainId: team.captainId || null,
      members: team.members || [],
      budget: team.budget || teamBudget,
      playersAcquired: team.playersAcquired || []
    }));
    
    // Generate player pool if needed
    let players = tournamentData.players || [];
    
    if (players.length === 0 && tournamentData.generatePlayers) {
      const poolConfig = {
        batsmen: tournamentData.batsmenCount || 20,
        bowlers: tournamentData.bowlersCount || 20,
        allRounders: tournamentData.allRoundersCount || 15,
        wicketKeepers: tournamentData.wicketKeepersCount || 10
      };
      
      players = generatePlayerPool(poolConfig, teamBudget);
    }
    
    // Generate schedule if needed
    let matches = tournamentData.matches || [];
    
    if (matches.length === 0 && enhancedTeams.length > 1) {
      matches = generateTournamentSchedule(
        enhancedTeams, 
        tournamentData.format || 'league'
      );
    }
    
    // Create tournament object
    const tournament = {
      id,
      name: tournamentData.name,
      description: tournamentData.description || '',
      format: tournamentData.format || 'league',
      status: tournamentData.status || 'draft',
      startDate: tournamentData.startDate || now,
      endDate: tournamentData.endDate || null,
      teamBudget,
      teams: enhancedTeams,
      players,
      matches,
      createdBy: tournamentData.createdBy || null,
      createdAt: now,
      updatedAt: now,
      captainCode,
      viewerCode,
      settings: {
        playerDisplaySettings: tournamentData.playerDisplaySettings || {
          showBasePrice: true,
          showStats: true,
          showTeam: true
        },
        auctionSettings: tournamentData.auctionSettings || {
          timerDuration: 15,
          minBidIncrement: 100000, // 1 Lakh default
          allowAutoBidding: false,
          allowTeamViewers: true
        },
        matchSettings: tournamentData.matchSettings || {
          overs: 20,
          playersPerTeam: 11,
          pointsPerWin: 2,
          pointsPerTie: 1,
          pointsPerLoss: 0
        }
      }
    };
    
    // Save to storage
    saveToStorage(`${STORAGE_KEY}_${id}`, tournament);
    
    // Add to tournament list
    const tournamentList = getFromStorage('tournament_list', []);
    const tournamentSummary = {
      id: tournament.id,
      name: tournament.name,
      status: tournament.status,
      format: tournament.format,
      teamCount: tournament.teams.length,
      playerCount: tournament.players.length,
      startDate: tournament.startDate,
      updatedAt: tournament.updatedAt
    };
    
    if (!tournamentList.some(t => t.id === id)) {
      tournamentList.push(tournamentSummary);
      saveToStorage('tournament_list', tournamentList);
    }
    
    return tournament;
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
};

/**
 * Get tournament by ID
 * @param {string} id - Tournament ID
 * @returns {Object} Tournament data
 */
export const getTournamentById = (id) => {
  try {
    return getFromStorage(`${STORAGE_KEY}_${id}`);
  } catch (error) {
    console.error('Error getting tournament:', error);
    return null;
  }
};

/**
 * Get all tournaments
 * @returns {Array} Array of tournament summaries
 */
export const getAllTournaments = () => {
  try {
    return getFromStorage('tournament_list', []);
  } catch (error) {
    console.error('Error getting tournament list:', error);
    return [];
  }
};

/**
 * Update tournament
 * @param {string} id - Tournament ID
 * @param {Object} updateData - Fields to update
 * @returns {Object} Updated tournament
 */
export const updateTournament = (id, updateData) => {
  try {
    const tournament = getTournamentById(id);
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Create updated tournament object
    const updatedTournament = {
      ...tournament,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    // Handle nested objects like settings
    if (updateData.settings) {
      updatedTournament.settings = {
        ...tournament.settings,
        ...updateData.settings
      };
    }
    
    // Save updated tournament
    saveToStorage(`${STORAGE_KEY}_${id}`, updatedTournament);
    
    // Update tournament list
    const tournamentList = getFromStorage('tournament_list', []);
    const updatedList = tournamentList.map(t => {
      if (t.id === id) {
        return {
          ...t,
          name: updatedTournament.name,
          status: updatedTournament.status,
          format: updatedTournament.format,
          teamCount: updatedTournament.teams.length,
          playerCount: updatedTournament.players.length,
          startDate: updatedTournament.startDate,
          updatedAt: updatedTournament.updatedAt
        };
      }
      return t;
    });
    
    saveToStorage('tournament_list', updatedList);
    
    return updatedTournament;
  } catch (error) {
    console.error('Error updating tournament:', error);
    throw error;
  }
};

/**
 * Delete tournament
 * @param {string} id - Tournament ID
 * @returns {boolean} Success status
 */
export const deleteTournament = (id) => {
  try {
    // Remove tournament data
    removeFromStorage(`${STORAGE_KEY}_${id}`);
    
    // Update tournament list
    const tournamentList = getFromStorage('tournament_list', []);
    const updatedList = tournamentList.filter(t => t.id !== id);
    saveToStorage('tournament_list', updatedList);
    
    return true;
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return false;
  }
};

/**
 * Add team to tournament
 * @param {string} tournamentId - Tournament ID
 * @param {Object} teamData - Team data
 * @returns {Object} Updated tournament
 */
export const addTeamToTournament = (tournamentId, teamData) => {
  try {
    const tournament = getTournamentById(tournamentId);
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    const teamId = teamData.id || uuidv4();
    
    // Create team object
    const team = {
      id: teamId,
      name: teamData.name,
      shortName: teamData.shortName || teamData.name.substring(0, 3).toUpperCase(),
      color: teamData.color || generateTeamColor(),
      logo: teamData.logo || null,
      captainId: teamData.captainId || null,
      members: teamData.members || [],
      budget: teamData.budget || tournament.teamBudget,
      playersAcquired: []
    };
    
    // Update tournament with new team
    const updatedTournament = {
      ...tournament,
      teams: [...tournament.teams, team],
      updatedAt: new Date().toISOString()
    };
    
    // Generate new schedule if in draft mode
    if (tournament.status === 'draft' && tournament.format !== 'custom') {
      updatedTournament.matches = generateTournamentSchedule(
        updatedTournament.teams, 
        updatedTournament.format
      );
    }
    
    // Save updated tournament
    saveToStorage(`${STORAGE_KEY}_${tournamentId}`, updatedTournament);
    
    // Update tournament list
    const tournamentList = getFromStorage('tournament_list', []);
    const updatedList = tournamentList.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          teamCount: updatedTournament.teams.length,
          updatedAt: updatedTournament.updatedAt
        };
      }
      return t;
    });
    
    saveToStorage('tournament_list', updatedList);
    
    return updatedTournament;
  } catch (error) {
    console.error('Error adding team to tournament:', error);
    throw error;
  }
};

/**
 * Remove team from tournament
 * @param {string} tournamentId - Tournament ID
 * @param {string} teamId - Team ID
 * @returns {Object} Updated tournament
 */
export const removeTeamFromTournament = (tournamentId, teamId) => {
  try {
    const tournament = getTournamentById(tournamentId);
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Update tournament without this team
    const updatedTournament = {
      ...tournament,
      teams: tournament.teams.filter(team => team.id !== teamId),
      updatedAt: new Date().toISOString()
    };
    
    // Update player teams
    updatedTournament.players = updatedTournament.players.map(player => {
      if (player.team === teamId) {
        return { ...player, team: null, soldPrice: 0 };
      }
      return player;
    });
    
    // Generate new schedule if in draft mode
    if (tournament.status === 'draft' && tournament.format !== 'custom') {
      updatedTournament.matches = generateTournamentSchedule(
        updatedTournament.teams, 
        updatedTournament.format
      );
    } else {
      // Remove team from matches
      updatedTournament.matches = updatedTournament.matches.map(match => {
        if (match.team1.id === teamId) {
          return { ...match, team1: { id: null, name: "TBD", color: "#cccccc" } };
        }
        if (match.team2.id === teamId) {
          return { ...match, team2: { id: null, name: "TBD", color: "#cccccc" } };
        }
        return match;
      });
    }
    
    // Save updated tournament
    saveToStorage(`${STORAGE_KEY}_${tournamentId}`, updatedTournament);
    
    // Update tournament list
    const tournamentList = getFromStorage('tournament_list', []);
    const updatedList = tournamentList.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          teamCount: updatedTournament.teams.length,
          updatedAt: updatedTournament.updatedAt
        };
      }
      return t;
    });
    
    saveToStorage('tournament_list', updatedList);
    
    return updatedTournament;
  } catch (error) {
    console.error('Error removing team from tournament:', error);
    throw error;
  }
};

/**
 * Start the tournament auction phase
 * @param {string} tournamentId - Tournament ID
 * @returns {Object} Updated tournament
 */
export const startTournamentAuction = (tournamentId) => {
  try {
    const tournament = getTournamentById(tournamentId);
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    if (tournament.status !== 'draft') {
      throw new Error('Tournament must be in draft status to start auction');
    }
    
    // Update tournament status
    const updatedTournament = {
      ...tournament,
      status: 'auction',
      updatedAt: new Date().toISOString()
    };
    
    // Save updated tournament
    saveToStorage(`${STORAGE_KEY}_${tournamentId}`, updatedTournament);
    
    // Update tournament list
    const tournamentList = getFromStorage('tournament_list', []);
    const updatedList = tournamentList.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          status: 'auction',
          updatedAt: updatedTournament.updatedAt
        };
      }
      return t;
    });
    
    saveToStorage('tournament_list', updatedList);
    
    // Initialize auction for this tournament
    initializeAuction(updatedTournament);
    
    return updatedTournament;
  } catch (error) {
    console.error('Error starting tournament auction:', error);
    throw error;
  }
};

/**
 * Complete the tournament auction phase and move to matches
 * @param {string} tournamentId - Tournament ID
 * @returns {Object} Updated tournament
 */
export const completeTournamentAuction = (tournamentId) => {
  try {
    const tournament = getTournamentById(tournamentId);
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    if (tournament.status !== 'auction') {
      throw new Error('Tournament must be in auction status to complete auction');
    }
    
    // Update tournament status
    const updatedTournament = {
      ...tournament,
      status: 'active',
      updatedAt: new Date().toISOString()
    };
    
    // Save updated tournament
    saveToStorage(`${STORAGE_KEY}_${tournamentId}`, updatedTournament);
    
    // Update tournament list
    const tournamentList = getFromStorage('tournament_list', []);
    const updatedList = tournamentList.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          status: 'active',
          updatedAt: updatedTournament.updatedAt
        };
      }
      return t;
    });
    
    saveToStorage('tournament_list', updatedList);
    
    return updatedTournament;
  } catch (error) {
    console.error('Error completing tournament auction:', error);
    throw error;
  }
};

/**
 * Update match result
 * @param {string} tournamentId - Tournament ID
 * @param {string} matchId - Match ID
 * @param {Object} resultData - Match result data
 * @returns {Object} Updated tournament
 */
export const updateMatchResult = (tournamentId, matchId, resultData) => {
  try {
    const tournament = getTournamentById(tournamentId);
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Find the match
    const matchIndex = tournament.matches.findIndex(match => match.id === matchId);
    
    if (matchIndex === -1) {
      throw new Error('Match not found');
    }
    
    const match = tournament.matches[matchIndex];
    
    // Validate teams
    if (!match.team1.id || !match.team2.id) {
      throw new Error('Both teams must be assigned before updating match result');
    }
    
    // Create full match result with player performances
    const team1Players = tournament.players.filter(p => p.team === match.team1.id);
    const team2Players = tournament.players.filter(p => p.team === match.team2.id);
    
    // Generate player performances if not provided
    let fullResult = { ...resultData };
    
    if (!resultData.team1Performance) {
      const team1Performance = generatePlayerPerformance(
        team1Players, 
        resultData.team1Score, 
        resultData.team1Wickets
      );
      fullResult.team1Performance = team1Performance;
    }
    
    if (!resultData.team2Performance) {
      const team2Performance = generatePlayerPerformance(
        team2Players, 
        resultData.team2Score, 
        resultData.team2Wickets
      );
      fullResult.team2Performance = team2Performance;
    }
    
    // Determine winner
    let winnerId;
    if (resultData.team1Score > resultData.team2Score) {
      winnerId = match.team1.id;
    } else if (resultData.team2Score > resultData.team1Score) {
      winnerId = match.team2.id;
    } else {
      winnerId = null; // Tie
    }
    
    // Update match
    const updatedMatch = {
      ...match,
      status: 'completed',
      result: {
        ...fullResult,
        winnerId,
        winMargin: Math.abs(resultData.team1Score - resultData.team2Score),
        winType: resultData.team1Wickets === 10 || resultData.team2Wickets === 10 ? 'runs' : 'wickets',
        completedAt: new Date().toISOString()
      }
    };
    
    // Update tournament with updated match
    const updatedMatches = [...tournament.matches];
    updatedMatches[matchIndex] = updatedMatch;
    
    // Update tournament
    const updatedTournament = {
      ...tournament,
      matches: updatedMatches,
      updatedAt: new Date().toISOString()
    };
    
    // If knockout format, update dependent matches
    if (tournament.format === 'knockout' || tournament.format === 'groups') {
      updatedTournament.matches = updateTournamentSchedule(
        updatedMatches,
        tournament.format
      );
    }
    
    // Save updated tournament
    saveToStorage(`${STORAGE_KEY}_${tournamentId}`, updatedTournament);
    
    return updatedTournament;
  } catch (error) {
    console.error('Error updating match result:', error);
    throw error;
  }
};

/**
 * Complete the tournament
 * @param {string} tournamentId - Tournament ID
 * @param {string} winnerTeamId - ID of the winning team
 * @returns {Object} Updated tournament
 */
export const completeTournament = (tournamentId, winnerTeamId) => {
  try {
    const tournament = getTournamentById(tournamentId);
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    if (tournament.status !== 'active') {
      throw new Error('Tournament must be active to complete');
    }
    
    // Validate winner
    if (!tournament.teams.some(team => team.id === winnerTeamId)) {
      throw new Error('Winner team not found in tournament');
    }
    
    // Update tournament status
    const updatedTournament = {
      ...tournament,
      status: 'completed',
      winner: {
        teamId: winnerTeamId,
        teamName: tournament.teams.find(t => t.id === winnerTeamId).name
      },
      endDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save updated tournament
    saveToStorage(`${STORAGE_KEY}_${tournamentId}`, updatedTournament);
    
    // Update tournament list
    const tournamentList = getFromStorage('tournament_list', []);
    const updatedList = tournamentList.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          status: 'completed',
          updatedAt: updatedTournament.updatedAt
        };
      }
      return t;
    });
    
    saveToStorage('tournament_list', updatedList);
    
    return updatedTournament;
  } catch (error) {
    console.error('Error completing tournament:', error);
    throw error;
  }
};

/**
 * Get team standings for the tournament
 * @param {string} tournamentId - Tournament ID
 * @returns {Array} Team standings
 */
export const getTournamentStandings = (tournamentId) => {
  try {
    const tournament = getTournamentById(tournamentId);
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Calculate points and stats for each team
    const standings = tournament.teams.map(team => {
      // Find all completed matches involving this team
      const matches = tournament.matches.filter(match => 
        (match.team1.id === team.id || match.team2.id === team.id) && 
        match.status === 'completed'
      );
      
      // Calculate wins, losses, ties
      let wins = 0;
      let losses = 0;
      let ties = 0;
      let runsScored = 0;
      let runsAgainst = 0;
      let matchesPlayed = matches.length;
      
      matches.forEach(match => {
        const isTeam1 = match.team1.id === team.id;
        const teamScore = isTeam1 ? match.result.team1Score : match.result.team2Score;
        const opponentScore = isTeam1 ? match.result.team2Score : match.result.team1Score;
        
        runsScored += teamScore;
        runsAgainst += opponentScore;
        
        if (match.result.winnerId === team.id) {
          wins++;
        } else if (match.result.winnerId === null) {
          ties++;
        } else {
          losses++;
        }
      });
      
      // Calculate points
      const pointsPerWin = tournament.settings?.matchSettings?.pointsPerWin || 2;
      const pointsPerTie = tournament.settings?.matchSettings?.pointsPerTie || 1;
      const pointsPerLoss = tournament.settings?.matchSettings?.pointsPerLoss || 0;
      
      const points = (wins * pointsPerWin) + (ties * pointsPerTie) + (losses * pointsPerLoss);
      
      // Calculate net run rate
      const netRunRate = matchesPlayed > 0 
        ? +((runsScored - runsAgainst) / matchesPlayed).toFixed(3) 
        : 0;
      
      return {
        teamId: team.id,
        teamName: team.name,
        teamColor: team.color,
        matches: matchesPlayed,
        wins,
        losses,
        ties,
        points,
        runsScored,
        runsAgainst,
        netRunRate
      };
    });
    
    // Sort by points, then by net run rate
    standings.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.netRunRate - a.netRunRate;
    });
    
    return standings;
  } catch (error) {
    console.error('Error getting tournament standings:', error);
    throw error;
  }
};

/**
 * Get player statistics for the tournament
 * @param {string} tournamentId - Tournament ID
 * @returns {Object} Player statistics
 */
export const getPlayerStatistics = (tournamentId) => {
  try {
    const tournament = getTournamentById(tournamentId);
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Get all completed matches
    const completedMatches = tournament.matches.filter(match => 
      match.status === 'completed'
    );
    
    // Initialize player stats
    const playerStats = {};
    
    // Process each match
    completedMatches.forEach(match => {
      // Process team 1 batting performance
      match.result.team1Performance.battingPerformance.forEach(performance => {
        if (!playerStats[performance.playerId]) {
          playerStats[performance.playerId] = {
            id: performance.playerId,
            name: performance.playerName,
            teamId: match.team1.id,
            teamName: match.team1.name,
            matches: 0,
            batting: {
              innings: 0,
              runs: 0,
              balls: 0,
              notOuts: 0,
              fours: 0,
              sixes: 0,
              highestScore: 0,
              average: 0,
              strikeRate: 0
            },
            bowling: {
              innings: 0,
              overs: 0,
              maidens: 0,
              runs: 0,
              wickets: 0,
              economy: 0,
              average: 0,
              bestBowling: {
                wickets: 0,
                runs: 0
              }
            }
          };
        }
        
        const player = playerStats[performance.playerId];
        
        // Update batting stats
        if (performance.balls > 0) {
          player.matches = player.matches || 0;
          player.matches++;
          
          player.batting.innings++;
          player.batting.runs += performance.runs;
          player.batting.balls += performance.balls;
          player.batting.fours += performance.fours;
          player.batting.sixes += performance.sixes;
          
          if (performance.notOut) {
            player.batting.notOuts++;
          }
          
          if (performance.runs > player.batting.highestScore) {
            player.batting.highestScore = performance.runs;
          }
          
          // Calculate average and strike rate
          player.batting.average = player.batting.innings - player.batting.notOuts > 0
            ? +(player.batting.runs / (player.batting.innings - player.batting.notOuts)).toFixed(2)
            : player.batting.runs;
            
          player.batting.strikeRate = player.batting.balls > 0
            ? +((player.batting.runs / player.batting.balls) * 100).toFixed(2)
            : 0;
        }
      });
      
      // Process team 2 batting performance
      match.result.team2Performance.battingPerformance.forEach(performance => {
        if (!playerStats[performance.playerId]) {
          playerStats[performance.playerId] = {
            id: performance.playerId,
            name: performance.playerName,
            teamId: match.team2.id,
            teamName: match.team2.name,
            matches: 0,
            batting: {
              innings: 0,
              runs: 0,
              balls: 0,
              notOuts: 0,
              fours: 0,
              sixes: 0,
              highestScore: 0,
              average: 0,
              strikeRate: 0
            },
            bowling: {
              innings: 0,
              overs: 0,
              maidens: 0,
              runs: 0,
              wickets: 0,
              economy: 0,
              average: 0,
              bestBowling: {
                wickets: 0,
                runs: 0
              }
            }
          };
        }
        
        const player = playerStats[performance.playerId];
        
        // Update batting stats
        if (performance.balls > 0) {
          player.matches = player.matches || 0;
          player.matches++;
          
          player.batting.innings++;
          player.batting.runs += performance.runs;
          player.batting.balls += performance.balls;
          player.batting.fours += performance.fours;
          player.batting.sixes += performance.sixes;
          
          if (performance.notOut) {
            player.batting.notOuts++;
          }
          
          if (performance.runs > player.batting.highestScore) {
            player.batting.highestScore = performance.runs;
          }
          
          // Calculate average and strike rate
          player.batting.average = player.batting.innings - player.batting.notOuts > 0
            ? +(player.batting.runs / (player.batting.innings - player.batting.notOuts)).toFixed(2)
            : player.batting.runs;
            
          player.batting.strikeRate = player.batting.balls > 0
            ? +((player.batting.runs / player.batting.balls) * 100).toFixed(2)
            : 0;
        }
      });
      
      // Process team 1 bowling performance
      match.result.team1Performance.bowlingPerformance.forEach(performance => {
        if (!playerStats[performance.playerId]) {
          playerStats[performance.playerId] = {
            id: performance.playerId,
            name: performance.playerName,
            teamId: match.team1.id,
            teamName: match.team1.name,
            matches: 1,
            batting: {
              innings: 0,
              runs: 0,
              balls: 0,
              notOuts: 0,
              fours: 0,
              sixes: 0,
              highestScore: 0,
              average: 0,
              strikeRate: 0
            },
            bowling: {
              innings: 0,
              overs: 0,
              maidens: 0,
              runs: 0,
              wickets: 0,
              economy: 0,
              average: 0,
              bestBowling: {
                wickets: 0,
                runs: 0
              }
            }
          };
        }
        
        const player = playerStats[performance.playerId];
        
        // Update bowling stats
        if (performance.overs > 0) {
          player.bowling.innings++;
          player.bowling.overs += performance.overs;
          player.bowling.maidens += performance.maidens;
          player.bowling.runs += performance.runs;
          player.bowling.wickets += performance.wickets;
          
          // Check if this is the best bowling performance
          if (
            performance.wickets > player.bowling.bestBowling.wickets || 
            (performance.wickets === player.bowling.bestBowling.wickets && 
             performance.runs < player.bowling.bestBowling.runs)
          ) {
            player.bowling.bestBowling = {
              wickets: performance.wickets,
              runs: performance.runs
            };
          }
          
          // Calculate economy rate
          player.bowling.economy = +(player.bowling.runs / player.bowling.overs).toFixed(2);
          
          // Calculate bowling average
          player.bowling.average = player.bowling.wickets > 0
            ? +(player.bowling.runs / player.bowling.wickets).toFixed(2)
            : null;
        }
      });
      
      // Process team 2 bowling performance
      match.result.team2Performance.bowlingPerformance.forEach(performance => {
        if (!playerStats[performance.playerId]) {
          playerStats[performance.playerId] = {
            id: performance.playerId,
            name: performance.playerName,
            teamId: match.team2.id,
            teamName: match.team2.name,
            matches: 1,
            batting: {
              innings: 0,
              runs: 0,
              balls: 0,
              notOuts: 0,
              fours: 0,
              sixes: 0,
              highestScore: 0,
              average: 0,
              strikeRate: 0
            },
            bowling: {
              innings: 0,
              overs: 0,
              maidens: 0,
              runs: 0,
              wickets: 0,
              economy: 0,
              average: 0,
              bestBowling: {
                wickets: 0,
                runs: 0
              }
            }
          };
        }
        
        const player = playerStats[performance.playerId];
        
        // Update bowling stats
        if (performance.overs > 0) {
          player.bowling.innings++;
          player.bowling.overs += performance.overs;
          player.bowling.maidens += performance.maidens;
          player.bowling.runs += performance.runs;
          player.bowling.wickets += performance.wickets;
          
          // Check if this is the best bowling performance
          if (
            performance.wickets > player.bowling.bestBowling.wickets || 
            (performance.wickets === player.bowling.bestBowling.wickets && 
             performance.runs < player.bowling.bestBowling.runs)
          ) {
            player.bowling.bestBowling = {
              wickets: performance.wickets,
              runs: performance.runs
            };
          }
          
          // Calculate economy rate
          player.bowling.economy = +(player.bowling.runs / player.bowling.overs).toFixed(2);
          
          // Calculate bowling average
          player.bowling.average = player.bowling.wickets > 0
            ? +(player.bowling.runs / player.bowling.wickets).toFixed(2)
            : null;
        }
      });
    });
    
    // Convert to array
    const playerStatsArray = Object.values(playerStats);
    
    // Add player role and other info from tournament players
    const enhancedPlayerStats = playerStatsArray.map(playerStat => {
      const player = tournament.players.find(p => p.id === playerStat.id);
      if (player) {
        return {
          ...playerStat,
          role: player.role,
          battingStyle: player.battingStyle,
          bowlingStyle: player.bowlingStyle
        };
      }
      return playerStat;
    });
    
    return enhancedPlayerStats;
  } catch (error) {
    console.error('Error getting player statistics:', error);
    throw error;
  }
};

/**
 * Get auction details for a tournament
 * @param {string} tournamentId - Tournament ID
 * @returns {Object} Auction details
 */
export const getTournamentAuction = (tournamentId) => {
  try {
    const tournament = getTournamentById(tournamentId);
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Get auction data associated with this tournament
    const auction = getAuctionById(tournamentId);
    
    if (!auction) {
      // If no auction exists, we need to check if it's in auction status
      if (tournament.status === 'auction') {
        // Initialize a new auction
        return initializeAuction(tournament);
      }
      
      return null;
    }
    
    return auction;
  } catch (error) {
    console.error('Error getting tournament auction:', error);
    return null;
  }
};

/**
 * Update player allocation after auction
 * @param {string} tournamentId - Tournament ID
 * @param {Object} auctionData - Auction data with player assignments
 * @returns {Object} Updated tournament
 */
export const updatePlayerAllocation = (tournamentId, auctionData) => {
  try {
    const tournament = getTournamentById(tournamentId);
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Update player teams based on auction results
    const updatedPlayers = tournament.players.map(player => {
      // Find this player in auction data
      const auctionPlayer = auctionData.playerPool.find(p => p.id === player.id);
      
      if (auctionPlayer && auctionPlayer.status === 'sold') {
        return {
          ...player,
          team: auctionPlayer.soldTo || auctionPlayer.team,
          soldPrice: auctionPlayer.soldPrice || auctionPlayer.currentBid || player.basePrice
        };
      }
      
      return player;
    });
    
    // Update team player acquisitions
    const updatedTeams = tournament.teams.map(team => {
      // Find all players for this team
      const teamPlayers = updatedPlayers.filter(p => p.team === team.id);
      
      // Calculate total spent
      const totalSpent = teamPlayers.reduce((sum, player) => sum + (player.soldPrice || 0), 0);
      
      return {
        ...team,
        playersAcquired: teamPlayers.map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          soldPrice: p.soldPrice || p.basePrice
        })),
        budget: team.budget,
        budgetSpent: totalSpent,
        budgetRemaining: team.budget - totalSpent
      };
    });
    
    // Update tournament
    const updatedTournament = {
      ...tournament,
      players: updatedPlayers,
      teams: updatedTeams,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated tournament
    saveToStorage(`${STORAGE_KEY}_${tournamentId}`, updatedTournament);
    
    return updatedTournament;
  } catch (error) {
    console.error('Error updatin player allocation:', error);
    throw error;
  }
};

/**
 * Get tournament auction history
 * @param {string} tournamentId - Tournament ID
 * @returns {Array} Auction history events
 */
export const getTournamentAuctionHistory = (tournamentId) => {
  try {
    const auction = getAuctionById(tournamentId);
    
    if (!auction) {
      return [];
    }
    
    return auction.history || [];
  } catch (error) {
    console.error('Error getting tournament auction history:', error);
    return [];
  }
};

/**
 * Export tournament data
 * @param {string} tournamentId - Tournament ID
 * @returns {Object} Tournament data for export
 */
export const exportTournamentData = (tournamentId) => {
  try {
    const tournament = getTournamentById(tournamentId);
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    // Create export object with relevant data
    const exportData = {
      tournament: {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        format: tournament.format,
        status: tournament.status,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        createdAt: tournament.createdAt,
        updatedAt: tournament.updatedAt
      },
      teams: tournament.teams.map(team => ({
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        color: team.color,
        budget: team.budget,
        playersAcquired: team.playersAcquired.length
      })),
      players: tournament.players.map(player => ({
        id: player.id,
        name: player.name,
        role: player.role,
        team: player.team,
        basePrice: player.basePrice,
        soldPrice: player.soldPrice
      })),
      matches: tournament.matches.map(match => ({
        id: match.id,
        team1: match.team1.name,
        team2: match.team2.name,
        date: match.date,
        venue: match.venue,
        status: match.status,
        result: match.result ? {
          team1Score: match.result.team1Score,
          team1Wickets: match.result.team1Wickets,
          team2Score: match.result.team2Score,
          team2Wickets: match.result.team2Wickets,
          winner: match.result.winnerId ? 
            (match.result.winnerId === match.team1.id ? match.team1.name : match.team2.name) : 
            'Tie'
        } : null
      })),
      standings: getTournamentStandings(tournamentId),
      exportedAt: new Date().toISOString()
    };
    
    return exportData;
  } catch (error) {
    console.error('Error exporting tournament data:', error);
    throw error;
  }
};

/**
 * Import tournament data
 * @param {Object} importData - Tournament data to import
 * @returns {Object} Imported tournament
 */
export const importTournamentData = (importData) => {
  try {
    // Extract tournament data
    const { tournament, teams, players, matches } = importData;
    
    // Create new tournament ID
    const newTournamentId = uuidv4();
    
    // Create team ID mapping (old ID to new ID)
    const teamIdMap = {};
    teams.forEach(team => {
      teamIdMap[team.id] = uuidv4();
    });
    
    // Create player ID mapping (old ID to new ID)
    const playerIdMap = {};
    players.forEach(player => {
      playerIdMap[player.id] = uuidv4();
    });
    
    // Create match ID mapping (old ID to new ID)
    const matchIdMap = {};
    matches?.forEach(match => {
      matchIdMap[match.id] = uuidv4();
    });
    
    // Create new tournament data
    const newTournament = {
      id: newTournamentId,
      name: `${tournament.name} (Imported)`,
      description: tournament.description,
      format: tournament.format,
      status: 'draft', // Always start in draft mode
      startDate: new Date().toISOString(),
      endDate: null,
      teamBudget: teams[0]?.budget || 10000000,
      teams: teams.map(team => ({
        id: teamIdMap[team.id],
        name: team.name,
        shortName: team.shortName,
        color: team.color,
        logo: null,
        captainId: null,
        members: [],
        budget: team.budget,
        playersAcquired: []
      })),
      players: players.map(player => ({
        id: playerIdMap[player.id],
        name: player.name,
        role: player.role,
        basePrice: player.basePrice,
        team: player.team ? teamIdMap[player.team] : null,
        soldPrice: player.soldPrice || 0
      })),
      matches: matches?.map(match => ({
        id: matchIdMap[match.id],
        team1: {
          id: teamIdMap[match.team1Id],
          name: match.team1,
          color: teams.find(t => t.id === match.team1Id)?.color || '#cccccc'
        },
        team2: {
          id: teamIdMap[match.team2Id],
          name: match.team2,
          color: teams.find(t => t.id === match.team2Id)?.color || '#cccccc'
        },
        date: match.date || new Date().toISOString(),
        venue: match.venue,
        status: 'scheduled'
      })) || [],
      createdBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      captainCode: generateAccessCode(6),
      viewerCode: generateAccessCode(6),
      settings: {
        playerDisplaySettings: {
          showBasePrice: true,
          showStats: true,
          showTeam: true
        },
        auctionSettings: {
          timerDuration: 15,
          minBidIncrement: 100000,
          allowAutoBidding: false,
          allowTeamViewers: true
        },
        matchSettings: {
          overs: 20,
          playersPerTeam: 11,
          pointsPerWin: 2,
          pointsPerTie: 1,
          pointsPerLoss: 0
        }
      }
    };
    
    // Create the tournament
    return createTournament(newTournament);
  } catch (error) {
    console.error('Error importing tournament data:', error);
    throw error;
  }
};

export default {
  createTournament,
  getTournamentById,
  getAllTournaments,
  updateTournament,
  deleteTournament,
  addTeamToTournament,
  removeTeamFromTournament,
  startTournamentAuction,
  completeTournamentAuction,
  updateMatchResult,
  completeTournament,
  getTournamentStandings,
  getPlayerStatistics,
  getTournamentAuction,
  updatePlayerAllocation,
  getTournamentAuctionHistory,
  exportTournamentData,
  importTournamentData
};