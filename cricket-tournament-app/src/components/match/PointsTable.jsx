import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchSimulation } from '../../hooks/useMatchSimulation';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './PointsTable.module.css';

const PointsTable = () => {
  const navigate = useNavigate();
  const [tournamentData] = useLocalStorage('tournamentData', null);
  const { matchesData, getTournamentStats } = useMatchSimulation();
  
  const [sortBy, setSortBy] = useState('points');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeTab, setActiveTab] = useState('points');
  const [tournamentStats, setTournamentStats] = useState(null);
  
  // Get tournament stats on component mount
  useEffect(() => {
    if (matchesData.completed.length > 0) {
      const stats = getTournamentStats();
      setTournamentStats(stats);
    }
  }, [matchesData.completed.length, getTournamentStats]);
  
  // Handle sort change
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column and default to descending
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  // Sort points table data
  const getSortedPointsTable = () => {
    if (!matchesData.pointsTable) return [];
    
    return [...matchesData.pointsTable].sort((a, b) => {
      let comparison = 0;
      
      // Sort by selected column
      if (sortBy === 'teamName') {
        comparison = a.teamName.localeCompare(b.teamName);
      } else if (sortBy === 'nrr') {
        comparison = a.nrr - b.nrr;
      } else {
        comparison = a[sortBy] - b[sortBy];
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };
  
  // Get sort indicator for column
  const getSortIndicator = (column) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? '▲' : '▼';
  };

  // Check if tournament is ready
  const isTournamentReady = tournamentData && matchesData;
  
  if (!isTournamentReady) {
    return (
      <div className="points-table-container empty-state">
        <h2>Tournament Not Started</h2>
        <p>Set up a tournament and play matches to see the points table.</p>
        <motion.button
          className="primary-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/setup/tournament')}
        >
          Setup Tournament
        </motion.button>
      </div>
    );
  }
  
  return (
    <div className="points-table-container">
      <h2>{tournamentData.name} - Tournament Dashboard</h2>
      
      <div className="tournament-tabs">
        <button 
          className={`tab-button ${activeTab === 'points' ? 'active' : ''}`}
          onClick={() => setActiveTab('points')}
        >
          Points Table
        </button>
        <button 
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Stats & Awards
        </button>
        <button 
          className={`tab-button ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Match Results
        </button>
      </div>
      
      <AnimatePresence mode="wait">
        {activeTab === 'points' && (
          <motion.div 
            key="points-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="points-table-section"
          >
            <h3>Points Table</h3>
            
            {matchesData.pointsTable.length === 0 ? (
              <p className="no-data">No matches played yet</p>
            ) : (
              <div className="table-container">
                <table className="points-table">
                  <thead>
                    <tr>
                      <th className="position-cell">#</th>
                      <th 
                        className="team-cell sortable"
                        onClick={() => handleSort('teamName')}
                      >
                        Team {getSortIndicator('teamName')}
                      </th>
                      <th 
                        className="sortable"
                        onClick={() => handleSort('matches')}
                      >
                        M {getSortIndicator('matches')}
                      </th>
                      <th 
                        className="sortable"
                        onClick={() => handleSort('won')}
                      >
                        W {getSortIndicator('won')}
                      </th>
                      <th 
                        className="sortable"
                        onClick={() => handleSort('lost')}
                      >
                        L {getSortIndicator('lost')}
                      </th>
                      <th 
                        className="sortable"
                        onClick={() => handleSort('tied')}
                      >
                        T {getSortIndicator('tied')}
                      </th>
                      <th 
                        className="points-cell sortable"
                        onClick={() => handleSort('points')}
                      >
                        Pts {getSortIndicator('points')}
                      </th>
                      <th 
                        className="nrr-cell sortable"
                        onClick={() => handleSort('nrr')}
                      >
                        NRR {getSortIndicator('nrr')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedPointsTable().map((team, index) => (
                      <tr key={team.teamId} className={index < 4 ? 'qualifying-position' : ''}>
                        <td className="position-cell">{index + 1}</td>
                        <td className="team-cell">
                          {tournamentData.teams.find(t => t.id === team.teamId)?.icon} {team.teamName}
                        </td>
                        <td>{team.matches}</td>
                        <td>{team.won}</td>
                        <td>{team.lost}</td>
                        <td>{team.tied}</td>
                        <td className="points-cell">{team.points}</td>
                        <td className="nrr-cell">{team.nrr.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="tournament-actions">
              <motion.button
                className="primary-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/match/simulate')}
              >
                Play More Matches
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'stats' && (
          <motion.div 
            key="stats-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="stats-section"
          >
            <h3>Tournament Stats & Awards</h3>
            
            {!tournamentStats ? (
              <p className="no-data">Play matches to generate stats</p>
            ) : (
              <div className="awards-container">
                <div className="award-card orange-cap">
                  <div className="award-header">
                    <h4>🏏 Orange Cap</h4>
                    <span className="award-subtitle">Most Runs</span>
                  </div>
                  
                  {tournamentStats.orangeCap.length > 0 ? (
                    <div className="award-content">
                      <div className="winner">
                        <span className="player-name">{tournamentStats.orangeCap[0].playerName}</span>
                        <span className="team-name">{tournamentStats.orangeCap[0].teamName}</span>
                        <span className="stat-value">{tournamentStats.orangeCap[0].runs} runs</span>
                      </div>
                      
                      <ul className="runners-up">
                        {tournamentStats.orangeCap.slice(1, 3).map((player, index) => (
                          <li key={player.playerId} className="player-item">
                            <span className="position">{index + 2}.</span>
                            <span className="player-name">{player.playerName}</span>
                            <span className="stat-value">{player.runs}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="no-data">No batting stats yet</p>
                  )}
                </div>
                
                <div className="award-card purple-cap">
                  <div className="award-header">
                    <h4>🎯 Purple Cap</h4>
                    <span className="award-subtitle">Most Wickets</span>
                  </div>
                  
                  {tournamentStats.purpleCap.length > 0 ? (
                    <div className="award-content">
                      <div className="winner">
                        <span className="player-name">{tournamentStats.purpleCap[0].playerName}</span>
                        <span className="team-name">{tournamentStats.purpleCap[0].teamName}</span>
                        <span className="stat-value">{tournamentStats.purpleCap[0].wickets} wickets</span>
                      </div>
                      
                      <ul className="runners-up">
                        {tournamentStats.purpleCap.slice(1, 3).map((player, index) => (
                          <li key={player.playerId} className="player-item">
                            <span className="position">{index + 2}.</span>
                            <span className="player-name">{player.playerName}</span>
                            <span className="stat-value">{player.wickets}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="no-data">No bowling stats yet</p>
                  )}
                </div>
                
                <div className="award-card best-team">
                  <div className="award-header">
                    <h4>🏆 Best Team</h4>
                    <span className="award-subtitle">Top of the Table</span>
                  </div>
                  
                  {tournamentStats.bestTeam ? (
                    <div className="award-content">
                      <div className="winner">
                        <span className="team-name">{tournamentStats.bestTeam.teamName}</span>
                        <div className="team-stats">
                          <span className="stat-item">Points: {tournamentStats.bestTeam.points}</span>
                          <span className="stat-item">NRR: {tournamentStats.bestTeam.nrr.toFixed(3)}</span>
                          <span className="stat-item">W/L: {tournamentStats.bestTeam.won}/{tournamentStats.bestTeam.lost}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="no-data">No team stats yet</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        {activeTab === 'matches' && (
          <motion.div 
            key="matches-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="matches-section"
          >
            <h3>Match Results</h3>
            
            {matchesData.completed.length === 0 ? (
              <p className="no-data">No completed matches</p>
            ) : (
              <ul className="matches-list">
                {matchesData.completed.map(match => (
                  <li key={match.id} className="match-result-card">
                    <div className="match-header">
                      <span className={`match-type ${match.type}`}>
                        {match.type.charAt(0).toUpperCase() + match.type.slice(1)}
                      </span>
                      <span className="match-date">
                        {new Date(match.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="teams-scores">
                      <div className={`team-score ${match.winner === match.team1.id ? 'winner' : ''}`}>
                        <span className="team-name">{match.team1.name}</span>
                        <span className="score">{match.team1.score}/{match.team1.wickets}</span>
                        <span className="overs">({match.team1.overs.toFixed(1)} ov)</span>
                      </div>
                      
                      <div className="vs-divider">vs</div>
                      
                      <div className={`team-score ${match.winner === match.team2.id ? 'winner' : ''}`}>
                        <span className="team-name">{match.team2.name}</span>
                        <span className="score">{match.team2.score}/{match.team2.wickets}</span>
                        <span className="overs">({match.team2.overs.toFixed(1)} ov)</span>
                      </div>
                    </div>
                    
                    <div className="match-result">
                      {match.winner === match.team1.id ? (
                        <p>{match.team1.name} won by {match.team1.score - match.team2.score} runs</p>
                      ) : match.winner === match.team2.id ? (
                        <p>{match.team2.name} won by {10 - match.team2.wickets} wickets</p>
                      ) : (
                        <p>Match tied</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PointsTable;