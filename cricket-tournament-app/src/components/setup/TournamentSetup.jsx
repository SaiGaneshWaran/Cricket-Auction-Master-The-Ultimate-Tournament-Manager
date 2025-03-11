import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { calculateBasePrice } from '../../utils/auctionHelper';
import PropTypes from 'prop-types';
import './TournamentSetup.module.css';

const playerRoles = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];

const TournamentSetup = ({ setTournamentData }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [tournamentName, setTournamentName] = useState('');
  const [numTeams, setNumTeams] = useState(4);
  const [playersPerTeam, setPlayersPerTeam] = useState(11);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  
  // Step 1: Tournament basics
  const handleBasicSetup = (e) => {
    e.preventDefault();
    if (!tournamentName) return;
    
    // Initialize empty teams
    const initialTeams = Array(numTeams)
      .fill()
      .map((_, index) => ({
        id: `team_${index + 1}`,
        name: `Team ${index + 1}`,
        budget: 10000000, // Default 1 crore budget
        icon: `🏏`,
        captain: '',
      }));
    
    setTeams(initialTeams);
    setStep(2);
  };
  
  // Step 2: Team setup
  const handleTeamUpdate = (index, field, value) => {
    const updatedTeams = [...teams];
    updatedTeams[index] = {
      ...updatedTeams[index],
      [field]: value
    };
    setTeams(updatedTeams);
  };
  
  const handleTeamSetup = (e) => {
    e.preventDefault();
    // Validation: All teams must have a name
    if (teams.some(team => !team.name.trim())) return;
    
    // Initialize player list with players for auction
    const initialPlayers = Array(numTeams * playersPerTeam)
      .fill()
      .map((_, index) => {
        const randomRole = playerRoles[Math.floor(Math.random() * playerRoles.length)];
        // Calculate base price as 5% of team budget
        const basePrice = calculateBasePrice(teams[0].budget);
        
        return {
          id: `player_${index + 1}`,
          name: `Player ${index + 1}`,
          role: randomRole,
          basePrice: basePrice,
          team: null, // Will be assigned during auction
        };
      });
    
    setPlayers(initialPlayers);
    setStep(3);
  };
  
  // Step 3: Player setup
  const handlePlayerUpdate = (index, field, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = {
      ...updatedPlayers[index],
      [field]: value
    };
    setPlayers(updatedPlayers);
  };
  
  const handleFinish = () => {
    // Save tournament data
    const tournamentData = {
      name: tournamentName,
      teams,
      players,
      numTeams,
      playersPerTeam,
      createdAt: new Date().toISOString(),
    };
    
    setTournamentData(tournamentData);
    navigate('/auction');
  };
  
  return (
    <motion.div 
      className="tournament-setup-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="setup-heading">
        {step === 1 && 'Tournament Setup 🏆'}
        {step === 2 && 'Team Setup 🏏'}
        {step === 3 && 'Player Setup 👤'}
      </h2>
      
      <div className="setup-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className="progress-line"></div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
        <div className="progress-line"></div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
      </div>
      
      {step === 1 && (
        <motion.form 
          onSubmit={handleBasicSetup}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="form-group">
            <label htmlFor="tournamentName">Tournament Name</label>
            <input
              type="text"
              id="tournamentName"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder="Enter tournament name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="numTeams">Number of Teams</label>
            <input
              type="number"
              id="numTeams"
              value={numTeams}
              onChange={(e) => setNumTeams(parseInt(e.target.value))}
              min="2"
              max="10"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="playersPerTeam">Players Per Team</label>
            <input
              type="number"
              id="playersPerTeam"
              value={playersPerTeam}
              onChange={(e) => setPlayersPerTeam(parseInt(e.target.value))}
              min="5"
              max="15"
              required
            />
          </div>
          
          <motion.button 
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="primary-button"
          >
            Next
          </motion.button>
        </motion.form>
      )}
      
      {step === 2 && (
        <motion.form 
          onSubmit={handleTeamSetup}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="teams-grid">
            {teams.map((team, index) => (
              <div key={team.id} className="team-card">
                <div className="team-icon">{team.icon}</div>
                <div className="form-group">
                  <label htmlFor={`teamName-${index}`}>Team Name</label>
                  <input
                    type="text"
                    id={`teamName-${index}`}
                    value={team.name}
                    onChange={(e) => handleTeamUpdate(index, 'name', e.target.value)}
                    placeholder="Enter team name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`teamBudget-${index}`}>Budget (₹)</label>
                  <input
                    type="number"
                    id={`teamBudget-${index}`}
                    value={team.budget}
                    onChange={(e) => handleTeamUpdate(index, 'budget', parseInt(e.target.value))}
                    min="1000000"
                    max="100000000"
                    step="1000000"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`teamIcon-${index}`}>Icon</label>
                  <select
                    id={`teamIcon-${index}`}
                    value={team.icon}
                    onChange={(e) => handleTeamUpdate(index, 'icon', e.target.value)}
                  >
                    {['🏏', '🏆', '🎯', '🔥', '⚡', '🌟', '🚀', '🦁', '🐯', '🐘'].map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          
          <div className="button-group">
            <motion.button 
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="secondary-button"
              onClick={() => setStep(1)}
            >
              Back
            </motion.button>
            
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="primary-button"
            >
              Next
            </motion.button>
          </div>
        </motion.form>
      )}
      
      {step === 3 && (
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h3>Players for Auction</h3>
          
          <div className="players-table-container">
            <table className="players-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Base Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {players.slice(0, 10).map((player, index) => (
                  <tr key={player.id}>
                    <td>
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => handlePlayerUpdate(index, 'name', e.target.value)}
                        placeholder="Player name"
                      />
                    </td>
                    <td>
                      <select
                        value={player.role}
                        onChange={(e) => handlePlayerUpdate(index, 'role', e.target.value)}
                      >
                        {playerRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={player.basePrice}
                        onChange={(e) => handlePlayerUpdate(index, 'basePrice', parseInt(e.target.value))}
                        min="10000"
                        step="10000"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className="note">Showing 10 of {players.length} players. Others will use default values.</p>
          
          <div className="button-group">
            <motion.button 
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="secondary-button"
              onClick={() => setStep(2)}
            >
              Back
            </motion.button>
            
            <motion.button 
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="primary-button"
              onClick={handleFinish}
            >
              Start Tournament
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

TournamentSetup.propTypes = {
  setTournamentData: PropTypes.func.isRequired
};

export default TournamentSetup;