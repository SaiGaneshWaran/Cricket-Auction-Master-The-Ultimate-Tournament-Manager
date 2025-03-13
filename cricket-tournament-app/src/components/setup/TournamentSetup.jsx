import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateBasePrice } from '../../utils/auctionHelper';
import PropTypes from 'prop-types';
import styles from './TournamentSetup.module.css';

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
    <>
      {/* Background Elements */}
      <div className={styles.pageBackground}></div>
      <div className={styles.fieldPattern}></div>
      
      {/* Animated Cricket Balls */}
      <motion.div 
        className={styles.cricketBall}
        animate={{
          x: [0, 30, 0, -30, 0],
          y: [0, 30, 60, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      <motion.div 
        className={styles.cricketBall}
        animate={{
          x: [0, -40, 0, 40, 0],
          y: [0, 40, 80, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      
      <motion.div 
        className={styles.tournamentSetupContainer}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2 
          className={styles.setupHeading}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {step === 1 && 'Tournament Setup 🏆'}
          {step === 2 && 'Team Setup 🏏'}
          {step === 3 && 'Player Setup 👤'}
        </motion.h2>
        
        <div className={styles.setupProgress}>
          <motion.div 
            className={`${styles.progressStep} ${step >= 1 ? styles.active : ''}`}
            whileHover={{ scale: 1.1 }}
          >1</motion.div>
          <motion.div 
            className={styles.progressLine}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.5 }}
          ></motion.div>
          <motion.div 
            className={`${styles.progressStep} ${step >= 2 ? styles.active : ''}`}
            whileHover={{ scale: 1.1 }}
          >2</motion.div>
          <motion.div 
            className={styles.progressLine}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          ></motion.div>
          <motion.div 
            className={`${styles.progressStep} ${step >= 3 ? styles.active : ''}`}
            whileHover={{ scale: 1.1 }}
          >3</motion.div>
        </div>
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form 
              onSubmit={handleBasicSetup}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              key="step1"
            >
              <div className={styles.formGroup}>
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
              
              <div className={styles.formGroup}>
                <label htmlFor="numTeams">Number of Teams</label>
                <input
                  type="number"
                  id="numTeams"
                  value={isNaN(numTeams) ? '' : numTeams}
                  onChange={(e) => setNumTeams(parseInt(e.target.value) || 0)}
                  min="2"
                  max="10"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
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
                className={styles.primaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
              </motion.button>
            </motion.form>
          )}
          
          {step === 2 && (
            <motion.form 
              onSubmit={handleTeamSetup}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              key="step2"
            >
              <div className={styles.teamsGrid}>
                {teams.map((team, index) => (
                  <motion.div 
                    key={team.id} 
                    className={styles.teamCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      transition: { delay: index * 0.1 } 
                    }}
                    whileHover={{ 
                      y: -10,
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)"
                    }}
                  >
                    <div className={styles.teamIcon}>{team.icon}</div>
                    <div className={styles.formGroup}>
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
                    
                    <div className={styles.formGroup}>
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
                    
                    <div className={styles.formGroup}>
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
                  </motion.div>
                ))}
              </div>
              
              <div className={styles.buttonGroup}>
                <motion.button 
                  type="button"
                  className={styles.secondaryButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(1)}
                >
                  Back
                </motion.button>
                
                <motion.button 
                  type="submit"
                  className={styles.primaryButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next
                </motion.button>
              </div>
            </motion.form>
          )}
          
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              key="step3"
            >
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Players for Auction
              </motion.h3>
              
              <motion.div 
                className={styles.playersTableContainer}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <table className={styles.playersTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Base Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.slice(0, 10).map((player, index) => (
                      <motion.tr 
                        key={player.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { delay: 0.4 + index * 0.05 } 
                        }}
                      >
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
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
              
              <motion.p 
                className={styles.note}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Showing 10 of {players.length} players. Others will use default values.
              </motion.p>
              
              <div className={styles.buttonGroup}>
                <motion.button 
                  type="button"
                  className={styles.secondaryButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(2)}
                >
                  Back
                </motion.button>
                
                <motion.button 
                  type="button"
                  className={styles.primaryButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFinish}
                >
                  Start Tournament
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

TournamentSetup.propTypes = {
  setTournamentData: PropTypes.func.isRequired
};

export default TournamentSetup;