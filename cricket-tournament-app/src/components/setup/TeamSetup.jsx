import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './TeamSetup.module.css';

const TeamSetup = () => {
  const navigate = useNavigate();
  const [tournamentData, setTournamentData] = useLocalStorage('tournamentData', null);
  const [editingTeamIndex, setEditingTeamIndex] = useState(null);
  const [editedTeam, setEditedTeam] = useState(null);
  
  // Check if tournament data exists
  useEffect(() => {
    if (!tournamentData) {
      navigate('/setup/tournament');
    }
  }, [tournamentData, navigate]);
  
  if (!tournamentData) {
    return <div>Loading...</div>;
  }
  
  // Start editing a team
  const handleEditTeam = (index) => {
    setEditingTeamIndex(index);
    setEditedTeam({ ...tournamentData.teams[index] });
  };
  
  // Save edited team
  const handleSaveTeam = () => {
    if (editingTeamIndex === null || !editedTeam) return;
    
    const updatedTeams = [...tournamentData.teams];
    updatedTeams[editingTeamIndex] = editedTeam;
    
    setTournamentData({
      ...tournamentData,
      teams: updatedTeams
    });
    
    setEditingTeamIndex(null);
    setEditedTeam(null);
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTeamIndex(null);
    setEditedTeam(null);
  };
  
  // Handle team fields update
  const handleTeamFieldChange = (field, value) => {
    if (!editedTeam) return;
    
    setEditedTeam({
      ...editedTeam,
      [field]: value
    });
  };
  
  // Continue to next step
  const handleContinue = () => {
    navigate('/auction');
  };
  
  return (
    <div className="team-setup-container">
      <h2>Team Setup</h2>
      
      <div className="teams-grid">
        {tournamentData.teams.map((team, index) => (
          <motion.div 
            key={team.id}
            className="team-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {editingTeamIndex === index ? (
              <div className="team-edit-form">
                <div className="form-group">
                  <label htmlFor="teamName">Team Name</label>
                  <input
                    type="text"
                    id="teamName"
                    value={editedTeam.name}
                    onChange={(e) => handleTeamFieldChange('name', e.target.value)}
                    placeholder="Enter team name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="teamBudget">Budget (₹)</label>
                  <input
                    type="number"
                    id="teamBudget"
                    value={editedTeam.budget}
                    onChange={(e) => handleTeamFieldChange('budget', parseInt(e.target.value))}
                    min="1000000"
                    max="100000000"
                    step="1000000"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="teamIcon">Icon</label>
                  <select
                    id="teamIcon"
                    value={editedTeam.icon}
                    onChange={(e) => handleTeamFieldChange('icon', e.target.value)}
                  >
                    {['🏏', '🏆', '🎯', '🔥', '⚡', '🌟', '🚀', '🦁', '🐯', '🐘'].map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                
                <div className="edit-actions">
                  <motion.button
                    className="save-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveTeam}
                  >
                    Save
                  </motion.button>
                  
                  <motion.button
                    className="cancel-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            ) : (
              <>
                <div className="team-header">
                  <div className="team-icon">{team.icon}</div>
                  <h3 className="team-name">{team.name}</h3>
                </div>
                
                <div className="team-details">
                  <p className="team-budget">Budget: ₹{(team.budget / 1000000).toFixed(1)} Cr</p>
                </div>
                
                <motion.button
                  className="edit-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditTeam(index)}
                >
                  Edit
                </motion.button>
              </>
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="setup-actions">
        <motion.button
          className="secondary-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/setup/tournament')}
        >
          Back
        </motion.button>
        
        <motion.button
          className="primary-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleContinue}
        >
          Continue to Auction
        </motion.button>
      </div>
    </div>
  );
};

export default TeamSetup;