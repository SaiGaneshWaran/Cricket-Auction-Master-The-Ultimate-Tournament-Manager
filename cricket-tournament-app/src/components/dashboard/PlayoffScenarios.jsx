// src/components/dashboard/PlayoffScenarios.jsx
import React, { useState, useEffect } from 'react';
import { useTournament } from '../../contexts/TournamentContext';
import Card from '../common/Card';
import Loader from '../common/Loader';
import { motion } from 'framer-motion';

const PlayoffScenarios = () => {
  const { tournament, loading } = useTournament();
  const [scenarios, setScenarios] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    if (tournament && tournament.points) {
      calculateScenarios();
    }
  }, [tournament, selectedTeam]);

  // Calculate playoff qualification scenarios for teams
  const calculateScenarios = () => {
    if (!tournament || !tournament.points || !tournament.matches) return;

    // Get remaining matches
    const remainingMatches = tournament.matches.filter(match => match.status !== 'completed');
    const totalTeams = tournament.teams.length;
    const playoffSpots = Math.min(4, totalTeams); // Top 4 teams qualify for playoffs or fewer if less teams
    
    // Current points table sorted by points (desc) and then NRR (desc)
    const pointsTable = [...tournament.points].sort((a, b) => 
      b.points !== a.points ? b.points - a.points : b.nrr - a.nrr
    );

    // Calculate scenarios
    const teamScenarios = tournament.teams.map(team => {
      const teamPoints = pointsTable.find(t => t.teamId === team.id);
      if (!teamPoints) return null;

      // Current position
      const currentPosition = pointsTable.findIndex(t => t.teamId === team.id) + 1;
      
      // Remaining matches for this team
      const teamRemainingMatches = remainingMatches.filter(
        m => m.team1Id === team.id || m.team2Id === team.id
      );
      
      // Max possible points
      const maxPossiblePoints = teamPoints.points + (teamRemainingMatches.length * 2);
      
      // Teams that can't be overtaken even if this team wins all remaining matches
      const teamsAhead = pointsTable
        .filter(t => t.teamId !== team.id && t.points > maxPossiblePoints)
        .map(t => tournament.teams.find(team => team.id === t.teamId).name);

      // Qualification status
      let status = 'In Contention';
      let description = '';
      
      // If already in top 4 and can't be overtaken by enough teams
      const teamsWithHigherMaxPoints = pointsTable.filter(
        t => t.teamId !== team.id && (t.points + (remainingMatches.filter(
          m => m.team1Id === t.teamId || m.team2Id === t.teamId
        ).length * 2)) >= teamPoints.points
      ).length;
      
      if (currentPosition <= playoffSpots && teamsWithHigherMaxPoints < playoffSpots) {
        status = 'Qualified';
        description = 'This team has qualified for the playoffs!';
      } 
      // If mathematically impossible to reach top 4
      else if (currentPosition > playoffSpots && 
              pointsTable[playoffSpots-1].points > maxPossiblePoints) {
        status = 'Eliminated';
        description = 'This team cannot mathematically qualify for the playoffs.';
      }
      // Specific scenarios
      else {
        // Must win all remaining matches
        const mustWinAll = pointsTable[playoffSpots-1].points > 
                          (teamPoints.points + (teamRemainingMatches.length * 2) - 2);
        
        // Dependent on other results
        const dependentOnOthers = teamsAhead.length > 0 || 
                                pointsTable.filter(t => 
                                  t.teamId !== team.id && 
                                  t.points === teamPoints.points
                                ).length > (playoffSpots - currentPosition);
        
        if (mustWinAll && dependentOnOthers) {
          description = 'Must win all remaining matches and depends on other results.';
        } else if (mustWinAll) {
          description = 'Must win all remaining matches to have a chance.';
        } else if (dependentOnOthers) {
          description = 'In good position but depends on other match results.';
        } else {
          description = 'Controls their own destiny with upcoming matches.';
        }
      }
      
      return {
        teamId: team.id,
        teamName: team.name,
        currentPosition,
        points: teamPoints.points,
        nrr: teamPoints.nrr,
        remainingMatches: teamRemainingMatches.length,
        maxPossiblePoints,
        status,
        description,
        requiredResults: status === 'In Contention' ? generateRequiredResults(team, tournament) : []
      };
    }).filter(Boolean);
    
    setScenarios(teamScenarios);
    
    // If no team is selected, select the first one
    if (!selectedTeam && teamScenarios.length > 0) {
      setSelectedTeam(teamScenarios[0].teamId);
    }
  };

  // Generate required results for qualification
  const generateRequiredResults = (team, tournament) => {
    const results = [];
    const teamPoints = tournament.points.find(t => t.teamId === team.id);
    
    if (!teamPoints) return results;
    
    // Get remaining matches for this team
    const teamRemainingMatches = tournament.matches.filter(
      m => (m.status !== 'completed') && (m.team1Id === team.id || m.team2Id === team.id)
    );
    
    // If need to win at least X matches
    const pointsTable = [...tournament.points].sort((a, b) => 
      b.points !== a.points ? b.points - a.points : b.nrr - a.nrr
    );
    
    const playoffCutoffPoints = pointsTable.length >= 4 ? pointsTable[3].points : 0;
    const pointsNeeded = Math.max(0, playoffCutoffPoints - teamPoints.points);
    const winsNeeded = Math.ceil(pointsNeeded / 2);
    
    if (winsNeeded > 0 && winsNeeded <= teamRemainingMatches.length) {
      results.push(`Need to win at least ${winsNeeded} out of ${teamRemainingMatches.length} remaining matches.`);
    } else if (winsNeeded > teamRemainingMatches.length) {
      results.push(`Cannot reach playoff cutoff even with winning all remaining matches.`);
    }
    
    // Critical matches
    const criticalOpponents = tournament.teams.filter(t => {
      const opponentPoints = tournament.points.find(pt => pt.teamId === t.id);
      return opponentPoints && Math.abs(opponentPoints.points - teamPoints.points) <= 4;
    }).map(t => t.name);
    
    if (criticalOpponents.length > 0) {
      results.push(`Critical matches against: ${criticalOpponents.join(', ')}.`);
    }
    
    // NRR scenarios
    const teamsWithSamePoints = pointsTable.filter(t => t.points === teamPoints.points);
    if (teamsWithSamePoints.length > 1) {
      results.push(`May need to improve Net Run Rate to advance over teams with equal points.`);
    }
    
    return results;
  };

  if (loading) {
    return <Loader message="Loading playoff scenarios..." />;
  }

  if (!tournament || !scenarios.length) {
    return (
      <Card title="Playoff Scenarios">
        <div className="p-4 text-center text-gray-500">
          No playoff scenarios available yet. Complete more matches to see qualification paths.
        </div>
      </Card>
    );
  }

  const selectedScenario = selectedTeam 
    ? scenarios.find(s => s.teamId === selectedTeam) 
    : scenarios[0];

  return (
    <Card title="Playoff Scenarios">
      <div className="p-4">
        {/* Team selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Team
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedTeam || ''}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            {scenarios.map(scenario => (
              <option key={scenario.teamId} value={scenario.teamId}>
                {scenario.teamName} ({scenario.status})
              </option>
            ))}
          </select>
        </div>

        {/* Selected team scenario */}
        {selectedScenario && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className={`p-4 rounded-lg mb-4 ${
              selectedScenario.status === 'Qualified' ? 'bg-green-100 border-l-4 border-green-500' :
              selectedScenario.status === 'Eliminated' ? 'bg-red-100 border-l-4 border-red-500' :
              'bg-blue-100 border-l-4 border-blue-500'
            }`}>
              <h3 className="text-lg font-bold mb-2">{selectedScenario.teamName}</h3>
              <div className="text-sm font-medium">
                <span className={`inline-block px-2 py-1 rounded-full text-white ${
                  selectedScenario.status === 'Qualified' ? 'bg-green-500' :
                  selectedScenario.status === 'Eliminated' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}>
                  {selectedScenario.status}
                </span>
              </div>
              <p className="mt-2">{selectedScenario.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Current Position</h4>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold">{selectedScenario.currentPosition}</span>
                  <span className="ml-2 text-sm text-gray-500">of {tournament.teams.length}</span>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Points</h4>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold">{selectedScenario.points}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    Max: {selectedScenario.maxPossiblePoints}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Remaining Matches</h4>
              {selectedScenario.remainingMatches > 0 ? (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{selectedScenario.remainingMatches}</span> matches left to play
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  All matches completed
                </div>
              )}
            </div>

            {selectedScenario.status === 'In Contention' && selectedScenario.requiredResults.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Path to Qualification</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedScenario.requiredResults.map((result, index) => (
                    <li key={index} className="text-sm">{result}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* League standings mini table */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Current Standings</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Pos</th>
                  <th className="px-4 py-2 text-left">Team</th>
                  <th className="px-4 py-2 text-right">Pts</th>
                  <th className="px-4 py-2 text-right">NRR</th>
                  <th className="px-4 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scenarios
                  .sort((a, b) => a.currentPosition - b.currentPosition)
                  .map((team) => (
                    <tr 
                      key={team.teamId}
                      className={`${
                        team.currentPosition <= 4 ? 'bg-green-50' : ''
                      } ${
                        team.teamId === selectedTeam ? 'bg-blue-100' : ''
                      }`}
                    >
                      <td className="px-4 py-2 font-medium">{team.currentPosition}</td>
                      <td className="px-4 py-2">{team.teamName}</td>
                      <td className="px-4 py-2 text-right">{team.points}</td>
                      <td className="px-4 py-2 text-right">{team.nrr.toFixed(3)}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs text-white ${
                          team.status === 'Qualified' ? 'bg-green-500' :
                          team.status === 'Eliminated' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}>
                          {team.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlayoffScenarios;