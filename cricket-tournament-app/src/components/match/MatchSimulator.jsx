import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchSimulation } from '../../hooks/useMatchSimulation';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { generatePlayerPerformance } from '../../utils/matchHelper';
import './MatchSimulator.module.css';

const MatchSimulator = () => {
  const navigate = useNavigate();
  const [tournamentData] = useLocalStorage('tournamentData', null);
  const [auctionData] = useLocalStorage('auctionData', null);
  const [selectedTeam1, setSelectedTeam1] = useState('');
  const [selectedTeam2, setSelectedTeam2] = useState('');
  const [matchType, setMatchType] = useState('league');
  const [showMatchTypes, setShowMatchTypes] = useState(false);
  
  const {
    matchesData,
    
    createMatch,
    startMatch
  } = useMatchSimulation();
  
  // Check if tournament is ready for matches
  const isTournamentReady = tournamentData && auctionData;
  
  // Get available teams
  const getAvailableTeams = () => {
    if (!auctionData || !auctionData.teams) return [];
    return auctionData.teams.filter(team => team.players.length > 0);
  };
  
  // Handle team selection
  const handleTeam1Change = (e) => {
    setSelectedTeam1(e.target.value);
    
    // Auto-select a different team for team 2 if same team is selected
    if (e.target.value === selectedTeam2) {
      const teams = getAvailableTeams();
      const otherTeams = teams.filter(team => team.id !== e.target.value);
      if (otherTeams.length > 0) {
        setSelectedTeam2(otherTeams[0].id);
      } else {
        setSelectedTeam2('');
      }
    }
  };
  
  const handleTeam2Change = (e) => {
    setSelectedTeam2(e.target.value);
    
    // Auto-select a different team for team 1 if same team is selected
    if (e.target.value === selectedTeam1) {
      const teams = getAvailableTeams();
      const otherTeams = teams.filter(team => team.id !== e.target.value);
      if (otherTeams.length > 0) {
        setSelectedTeam1(otherTeams[0].id);
      } else {
        setSelectedTeam1('');
      }
    }
  };
  
  // Create and start a new match
  const handleCreateMatch = () => {
    if (!selectedTeam1 || !selectedTeam2) return;
    
    const team1 = auctionData.teams.find(team => team.id === selectedTeam1);
    const team2 = auctionData.teams.find(team => team.id === selectedTeam2);
    
    if (!team1 || !team2) return;
    
    const match = createMatch(team1, team2, matchType);
    if (match) {
      // Generate random player performances
      const playerPerformances = generatePlayerPerformance(
        auctionData.soldPlayers,
        team1.id,
        team2.id
      );
      
      // Start the match
      startMatch({
        ...match,
        playerStats: playerPerformances
      });
      
      // Navigate to live scoreboard
      navigate('/match/scoreboard');
    }
  };
  
  // Handle scheduled matches
  const handleStartScheduledMatch = (match) => {
    startMatch(match);
    navigate('/match/scoreboard');
  };
  
  if (!isTournamentReady) {
    return (
      <div className="match-simulator empty-state">
        <h2>Tournament Not Ready</h2>
        <p>Complete tournament setup and player auction first.</p>
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
    <div className="match-simulator-container">
      <h2>Match Simulator</h2>
      
      <div className="simulator-main">
        <div className="create-match-section">
          <h3>Create New Match</h3>
          
          <div className="form-group">
            <label htmlFor="team1">Team 1</label>
            <select
              id="team1"
              value={selectedTeam1}
              onChange={handleTeam1Change}
              required
            >
              <option value="">Select Team 1</option>
              {getAvailableTeams().map(team => (
                <option key={team.id} value={team.id}>
                  {team.icon} {team.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="team2">Team 2</label>
            <select
              id="team2"
              value={selectedTeam2}
              onChange={handleTeam2Change}
              required
            >
              <option value="">Select Team 2</option>
              {getAvailableTeams()
                .filter(team => team.id !== selectedTeam1)
                .map(team => (
                  <option key={team.id} value={team.id}>
                    {team.icon} {team.name}
                  </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="matchType">Match Type</label>
            <div className="match-type-selector">
              <button 
                className={`match-type-button ${matchType === 'league' ? 'active' : ''}`}
                onClick={() => setMatchType('league')}
              >
                League Match
              </button>
              <button 
                className={`match-type-button ${matchType === 'knockout' ? 'active' : ''}`}
                onClick={() => setMatchType('knockout')}
              >
                Knockout
              </button>
              <button 
                className={`match-type-button ${matchType === 'final' ? 'active' : ''}`}
                onClick={() => setMatchType('final')}
              >
                Final
              </button>
            </div>
          </div>
          
          <div className="button-group">
            <motion.button
              className="primary-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateMatch}
              disabled={!selectedTeam1 || !selectedTeam2}
            >
              Start Match
            </motion.button>
          </div>
        </div>
        
        <div className="scheduled-matches-section">
          <div className="section-header">
            <h3>Scheduled Matches</h3>
            <button
              className="toggle-button"
              onClick={() => setShowMatchTypes(!showMatchTypes)}
            >
              {showMatchTypes ? 'Hide Types' : 'Show Types'}
            </button>
          </div>
          
          {matchesData.matches.length === 0 ? (
            <p className="no-matches">No scheduled matches</p>
          ) : (
            <ul className="match-list">
              {matchesData.matches.map(match => (
                <li key={match.id} className="match-item">
                  <div className="match-info">
                    <div className="teams-info">
                      <span className="team">{match.team1.name}</span>
                      <span className="vs">vs</span>
                      <span className="team">{match.team2.name}</span>
                    </div>
                    
                    {showMatchTypes && (
                      <span className={`match-type ${match.type}`}>
                        {match.type.charAt(0).toUpperCase() + match.type.slice(1)}
                      </span>
                    )}
                  </div>
                  
                  <motion.button
                    className="start-match-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStartScheduledMatch(match)}
                  >
                    Start
                  </motion.button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="match-actions">
        <motion.button
          className="secondary-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/match/points')}
        >
          View Points Table
        </motion.button>
      </div>
    </div>
  );
};

export default MatchSimulator;