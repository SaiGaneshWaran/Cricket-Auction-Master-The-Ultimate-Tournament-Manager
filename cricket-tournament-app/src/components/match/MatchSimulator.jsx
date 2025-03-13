import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiCalendar, FiAward,  FiPlus } from 'react-icons/fi';
import { GiCricketBat, GiBaseballGlove,GiTrophy } from 'react-icons/gi';
import { useMatchSimulation } from '../../hooks/useMatchSimulation';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { generatePlayerPerformance } from '../../utils/matchHelper';
import styles from './MatchSimulator.module.css';

const MatchSimulator = () => {
  const navigate = useNavigate();
  const [tournamentData] = useLocalStorage('tournamentData', null);
  const [auctionData] = useLocalStorage('auctionData', null);
  const [selectedTeam1, setSelectedTeam1] = useState('');
  const [selectedTeam1Object, setSelectedTeam1Object] = useState(null);
  const [selectedTeam2, setSelectedTeam2] = useState('');
  const [selectedTeam2Object, setSelectedTeam2Object] = useState(null);
  const [matchType, setMatchType] = useState('league');
  const [showMatchTypes, setShowMatchTypes] = useState(false);
  const [animateTeams, setAnimateTeams] = useState(false);
  
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
  
  // Update team objects when selections change
  useEffect(() => {
    if (selectedTeam1 && auctionData?.teams) {
      const team = auctionData.teams.find(t => t.id === selectedTeam1);
      setSelectedTeam1Object(team);
    } else {
      setSelectedTeam1Object(null);
    }
    
    if (selectedTeam2 && auctionData?.teams) {
      const team = auctionData.teams.find(t => t.id === selectedTeam2);
      setSelectedTeam2Object(team);
    } else {
      setSelectedTeam2Object(null);
    }

    // Trigger animation when both teams are selected
    if (selectedTeam1 && selectedTeam2) {
      setAnimateTeams(true);
    }
  }, [selectedTeam1, selectedTeam2, auctionData]);
  
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
      <div className={styles.emptyStateContainer}>
        <motion.div 
          className={styles.emptyState}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.iconContainer}>
            <GiCricketBat className={styles.emptyStateIcon} />
          </div>
          <h2>Tournament Not Ready</h2>
          <p>You need to complete tournament setup and player auction before creating matches.</p>
          <motion.button
            className={styles.primaryButton}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px rgba(76, 110, 245, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/setup/tournament')}
          >
            Setup Tournament
          </motion.button>
        </motion.div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className={styles.matchSimulatorContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.pageBackground}></div>
      
      <div className={styles.simulatorHeader}>
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Match Simulator
        </motion.h2>
        <motion.button
          className={styles.viewPointsButton}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/match/points')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FiAward /> View Points Table
        </motion.button>
      </div>
      
      <div className={styles.simulatorMain}>
        <motion.div 
          className={styles.createMatchSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.sectionTitle}>
            <FiPlus />
            <h3>Create New Match</h3>
          </div>
          
          <div className={styles.teamSelectionContainer}>
            <div className={styles.teamSelector}>
              <label htmlFor="team1">Team 1</label>
              <select
                id="team1"
                className={styles.teamSelect}
                value={selectedTeam1}
                onChange={handleTeam1Change}
                required
              >
                <option value="">Select Team</option>
                {getAvailableTeams().map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              
              {selectedTeam1Object && (
                <motion.div 
                  className={styles.teamPreview}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className={styles.teamIcon}>🏏</div>
                  <div className={styles.teamInfo}>
                    <h4>{selectedTeam1Object.name}</h4>
                    <div className={styles.teamStats}>
                      <span>{selectedTeam1Object.players.length} Players</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <AnimatePresence>
              {animateTeams && (
                <motion.div 
                  className={styles.vsContainer}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <span>VS</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className={styles.teamSelector}>
              <label htmlFor="team2">Team 2</label>
              <select
                id="team2"
                className={styles.teamSelect}
                value={selectedTeam2}
                onChange={handleTeam2Change}
                required
              >
                <option value="">Select Team</option>
                {getAvailableTeams()
                  .filter(team => team.id !== selectedTeam1)
                  .map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                ))}
              </select>
              
              {selectedTeam2Object && (
                <motion.div 
                  className={styles.teamPreview}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className={styles.teamIcon}>🏏</div>
                  <div className={styles.teamInfo}>
                    <h4>{selectedTeam2Object.name}</h4>
                    <div className={styles.teamStats}>
                      <span>{selectedTeam2Object.players.length} Players</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          
          <div className={styles.matchTypeContainer}>
            <label>Match Type</label>
            <div className={styles.matchTypeSelector}>
              <motion.button 
                className={`${styles.matchTypeButton} ${matchType === 'league' ? styles.active : ''}`}
                onClick={() => setMatchType('league')}
                whileTap={{ scale: 0.95 }}
              >
                <FiCalendar />
                <span>League</span>
              </motion.button>
              <motion.button 
                className={`${styles.matchTypeButton} ${matchType === 'knockout' ? styles.active : ''}`}
                onClick={() => setMatchType('knockout')}
                whileTap={{ scale: 0.95 }}
              >
                <GiBaseballGlove />
                <span>Knockout</span>
              </motion.button>
              // In the match type selector button:
<motion.button 
  className={`${styles.matchTypeButton} ${matchType === 'final' ? styles.active : ''}`}
  onClick={() => setMatchType('final')}
  whileTap={{ scale: 0.95 }}
>
  <GiTrophy />
  <span>Final</span>
</motion.button>
            </div>
          </div>
          
          <div className={styles.buttonGroup}>
            <motion.button
              className={styles.primaryButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateMatch}
              disabled={!selectedTeam1 || !selectedTeam2}
            >
              <FiPlay />
              Start Match
            </motion.button>
          </div>
        </motion.div>
        
        <motion.div 
          className={styles.scheduledMatchesSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.sectionTitle}>
            <FiCalendar />
            <h3>Scheduled Matches</h3>
            <motion.button
              className={styles.toggleButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMatchTypes(!showMatchTypes)}
            >
              {showMatchTypes ? 'Hide Types' : 'Show Types'}
            </motion.button>
          </div>
          
          <div className={styles.matchListContainer}>
            {matchesData.matches.length === 0 ? (
              <div className={styles.noMatches}>
                <p>No scheduled matches available</p>
                <p className={styles.helperText}>Create a new match to get started</p>
              </div>
            ) : (
              <motion.ul 
                className={styles.matchList}
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {matchesData.matches.map(match => (
                  <motion.li 
                    key={match.id} 
                    className={styles.matchItem}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                  >
                    <div className={styles.matchInfo}>
                      <div className={styles.teamsInfo}>
                        <span className={styles.teamName}>{match.team1.name}</span>
                        <div className={styles.vsIndicator}>VS</div>
                        <span className={styles.teamName}>{match.team2.name}</span>
                      </div>
                      
                      <AnimatePresence>
                        {showMatchTypes && (
                          <motion.span 
                            className={`${styles.matchTypeTag} ${styles[match.type]}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            {match.type.charAt(0).toUpperCase() + match.type.slice(1)}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <motion.button
                      className={styles.startMatchButton}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStartScheduledMatch(match)}
                    >
                      <FiPlay /> Start
                    </motion.button>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MatchSimulator;