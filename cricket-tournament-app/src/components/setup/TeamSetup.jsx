import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiSave, FiX, FiArrowLeft, FiArrowRight, FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useLocalStorage } from '../../hooks/useLocalStorage';

import styles from './TeamSetup.module.css';

const TeamSetup = () => {
  const navigate = useNavigate();
  const [tournamentData, setTournamentData] = useLocalStorage('tournamentData', null);
  const [editingTeamIndex, setEditingTeamIndex] = useState(null);
  const [editedTeam, setEditedTeam] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [dragDisabled, setDragDisabled] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Check if tournament data exists
  useEffect(() => {
    if (!tournamentData) {
      navigate('/setup/tournament');
    }
  }, [tournamentData, navigate]);
  
  if (!tournamentData) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading tournament data...</p>
      </div>
    );
  }
  
  // Start editing a team
  const handleEditTeam = (index) => {
    setEditingTeamIndex(index);
    setEditedTeam({ ...tournamentData.teams[index] });
    setDragDisabled(true);
  };
  
  // Save edited team
  const handleSaveTeam = () => {
    if (editingTeamIndex === null || !editedTeam) return;
    
    // Validate team data
    const errors = {};
    if (!editedTeam.name || editedTeam.name.trim() === '') {
      errors.name = "Team name cannot be empty";
    }
    
    if (!editedTeam.budget || editedTeam.budget < 1000000) {
      errors.budget = "Budget must be at least 10 Million";
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    const updatedTeams = [...tournamentData.teams];
    updatedTeams[editingTeamIndex] = editedTeam;
    
    setTournamentData({
      ...tournamentData,
      teams: updatedTeams
    });
    
    setEditingTeamIndex(null);
    setEditedTeam(null);
    setValidationErrors({});
    setDragDisabled(false);
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTeamIndex(null);
    setEditedTeam(null);
    setValidationErrors({});
    setDragDisabled(false);
  };
  
  // Handle team fields update
  const handleTeamFieldChange = (field, value) => {
    if (!editedTeam) return;
    
    setEditedTeam({
      ...editedTeam,
      [field]: value
    });
    
    // Clear validation error for this field if it exists
    if (validationErrors[field]) {
      setValidationErrors({
        ...validationErrors,
        [field]: null
      });
    }
  };
  
  // Add a new team
  const handleAddTeam = () => {
    const newTeamId = `team_${Date.now()}`;
    const newTeam = {
      id: newTeamId,
      name: `Team ${tournamentData.teams.length + 1}`,
      budget: 80000000, // Default budget
      icon: '🏏',
      color: '#4c6ef5',
      players: [],
      description: 'New challenger team'
    };
    
    setTournamentData({
      ...tournamentData,
      teams: [...tournamentData.teams, newTeam]
    });
  };
  
  // Delete a team
  const handleDeleteTeam = (index) => {
    if (tournamentData.teams.length <= 2) {
      alert("Tournament requires at least 2 teams");
      return;
    }
    
    const updatedTeams = [...tournamentData.teams];
    updatedTeams.splice(index, 1);
    
    setTournamentData({
      ...tournamentData,
      teams: updatedTeams
    });
  };
  
  // Handle drag end for team reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const teams = [...tournamentData.teams];
    const [reorderedTeam] = teams.splice(result.source.index, 1);
    teams.splice(result.destination.index, 0, reorderedTeam);
    
    setTournamentData({
      ...tournamentData,
      teams: teams
    });
  };
  
  // Continue to next step
  const handleContinue = () => {
    navigate('/auction');
  };
  
  // Get progress percentage
  const getProgressPercentage = () => {
    const totalSteps = 3; // Tournament setup, team setup, auction
    const currentStep = 2;
    return (currentStep / totalSteps) * 100;
  };
  
  return (
    <motion.div 
      className={styles.teamSetupContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.pageBackground}></div>
      
      <motion.div
        className={styles.setupHeader}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h2>
          Team Setup - {tournamentData.name}
        </h2>
        
        <div className={styles.helpButton}>
          <motion.button 
            className={styles.iconButton}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHelp(!showHelp)}
          >
            <FiInfo />
          </motion.button>
        </div>
      </motion.div>
      
      <div className={styles.progressContainer}>
        <div className={styles.progressBarWrapper}>
          <motion.div 
            className={styles.progressBar}
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <div className={styles.progressText}>Step 2 of 3</div>
      </div>
      
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            className={styles.helpPanel}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4>Team Setup Tips</h4>
            <ul>
              <li>Drag and drop teams to reorder them</li>
              <li>Click "Edit" to customize team name, budget, and visuals</li>
              <li>Each team needs a unique name and icon</li>
              <li>Teams will compete according to the tournament format</li>
              <li>Team budgets will be used during the auction phase</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="teamsDroppable" direction="vertical">
          {(provided) => (
            <div 
              className={styles.teamsGrid} 
              ref={provided.innerRef} 
              {...provided.droppableProps}
            >
              {tournamentData.teams.map((team, index) => (
                <Draggable 
                  key={team.id} 
                  draggableId={team.id} 
                  index={index}
                  isDragDisabled={dragDisabled}
                >
                  {(provided, snapshot) => (
                    <motion.div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${styles.teamCard} ${snapshot.isDragging ? styles.dragging : ''}`}
                      style={{
                        ...provided.draggableProps.style,
                        borderColor: team.color || '#4c6ef5'
                      }}
                    >
                      <div 
                        className={styles.dragHandle} 
                        {...provided.dragHandleProps}
                      >
                        <div className={styles.dragIcon}></div>
                      </div>
                      
                      {editingTeamIndex === index ? (
                        <div className={styles.teamEditForm}>
                          <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                              <label htmlFor={`teamName_${index}`}>Team Name</label>
                              <input
                                type="text"
                                id={`teamName_${index}`}
                                value={editedTeam.name}
                                onChange={(e) => handleTeamFieldChange('name', e.target.value)}
                                placeholder="Enter team name"
                                className={validationErrors.name ? styles.inputError : ''}
                              />
                              {validationErrors.name && (
                                <span className={styles.errorText}>{validationErrors.name}</span>
                              )}
                            </div>
                            
                            <div className={styles.formGroup}>
                              <label htmlFor={`teamIcon_${index}`}>Icon</label>
                             
                            </div>
                          </div>
                          
                          <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                              <label htmlFor={`teamBudget_${index}`}>Budget (₹ Cr)</label>
                              <input
                                type="number"
                                id={`teamBudget_${index}`}
                                value={editedTeam.budget / 1000000}
                                onChange={(e) => handleTeamFieldChange('budget', parseFloat(e.target.value) * 1000000)}
                                min="10"
                                max="100"
                                step="1"
                                className={validationErrors.budget ? styles.inputError : ''}
                              />
                              {validationErrors.budget && (
                                <span className={styles.errorText}>{validationErrors.budget}</span>
                              )}
                            </div>
                            
                            <div className={styles.formGroup}>
                              <label htmlFor={`teamColor_${index}`}>Team Color</label>
                              
                            </div>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label htmlFor={`teamDescription_${index}`}>Team Tagline</label>
                            <input
                              type="text"
                              id={`teamDescription_${index}`}
                              value={editedTeam.description || ''}
                              onChange={(e) => handleTeamFieldChange('description', e.target.value)}
                              placeholder="Team motto or tagline"
                            />
                          </div>
                          
                          <div className={styles.editActions}>
                            <motion.button
                              className={styles.saveButton}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleSaveTeam}
                            >
                              <FiSave /> Save
                            </motion.button>
                            
                            <motion.button
                              className={styles.cancelButton}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleCancelEdit}
                            >
                              <FiX /> Cancel
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div 
                            className={styles.teamHeader}
                            style={{ backgroundColor: team.color || '#4c6ef5' }}
                          >
                            <div className={styles.teamIcon}>{team.icon}</div>
                            <h3 className={styles.teamName}>{team.name}</h3>
                          </div>
                          
                          <div className={styles.teamDetails}>
                            <div className={styles.budgetDisplay}>
                              <span className={styles.budgetLabel}>Budget:</span>
                              <span className={styles.budgetValue}>₹{(team.budget / 1000000).toFixed(1)} Cr</span>
                            </div>
                            
                            {team.description && (
                              <p className={styles.teamDescription}>"{team.description}"</p>
                            )}
                            
                            <div className={styles.teamStats}>
                              <div className={styles.statItem}>
                                <span className={styles.statLabel}>Players:</span>
                                <span className={styles.statValue}>{team.players?.length || 0}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className={styles.cardActions}>
                            <motion.button
                              className={styles.editButton}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEditTeam(index)}
                            >
                              <FiEdit2 /> Edit
                            </motion.button>
                            
                            <motion.button
                              className={styles.deleteButton}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteTeam(index)}
                            >
                              <FiTrash2 />
                            </motion.button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              <motion.div 
                className={styles.addTeamCard}
                whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                onClick={handleAddTeam}
              >
                <div className={styles.addTeamIcon}>
                  <FiPlus />
                </div>
                <p>Add Team</p>
              </motion.div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      <div className={styles.setupActions}>
        <motion.button
          className={styles.secondaryButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/setup/tournament')}
        >
          <FiArrowLeft /> Back to Tournament Setup
        </motion.button>
        
        <motion.button
          className={styles.primaryButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleContinue}
        >
          Continue to Auction <FiArrowRight />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TeamSetup;