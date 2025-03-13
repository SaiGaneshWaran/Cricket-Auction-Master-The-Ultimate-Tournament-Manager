import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchSimulation } from '../../hooks/useMatchSimulation';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { 
   FiAward, FiPlayCircle, FiArrowUp, FiArrowDown, 
   FiBarChart2, FiInfo
} from 'react-icons/fi';
import { GiCricketBat, GiBaseballGlove } from 'react-icons/gi';
import styles from './PointsTable.module.css';

const PointsTable = () => {
  const navigate = useNavigate();
  const [tournamentData] = useLocalStorage('tournamentData', null);
  const { matchesData, getTournamentStats } = useMatchSimulation();
  
  const [sortBy, setSortBy] = useState('points');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeTab, setActiveTab] = useState('points');
  const [tournamentStats, setTournamentStats] = useState(null);
  const [showTableInfo, setShowTableInfo] = useState(false);
  const [highlightedTeam, setHighlightedTeam] = useState(null);
  const [viewType, setViewType] = useState('table'); // table or cards
  
  // Get tournament stats on component mount
  useEffect(() => {
    if (matchesData?.completed?.length > 0) {
      const stats = getTournamentStats();
      setTournamentStats(stats);
    }
  }, [matchesData?.completed?.length, getTournamentStats]);
  
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
  
  // Get progress percentage for a team
  const getProgressPercentage = (team) => {
    if (!team.matches) return 0;
    return (team.points / (team.matches * 2)) * 100;
  };

  // Sort points table data
  const getSortedPointsTable = () => {
    if (!matchesData?.pointsTable) return [];
    
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
    return sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />;
  };

  // Format NRR (Net Run Rate)
  const formatNRR = (nrr) => {
    const formattedNRR = nrr.toFixed(3);
    return formattedNRR > 0 ? `+${formattedNRR}` : formattedNRR;
  };
  
  // Check if a team is in playoff contention (top 4)
  const isInPlayoffContention = (index) => {
    return index < 4;
  };
  
  // Handle row hover
  const handleRowHover = (teamId) => {
    setHighlightedTeam(teamId);
  };
  
  // Handle row hover exit
  const handleRowHoverExit = () => {
    setHighlightedTeam(null);
  };

  // Check if tournament is ready
  const isTournamentReady = tournamentData && matchesData;
  
  if (!isTournamentReady) {
    return (
      <motion.div 
        className={styles.pointsTableContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.emptyState}>
          
          <h2>Tournament Not Started</h2>
          <p>Set up a tournament and play matches to see the points table.</p>
          <motion.button
            className={styles.primaryButton}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/setup/tournament')}
          >
            Setup Tournament
          </motion.button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className={styles.pointsTableContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.pageBackground}></div>
      
      <motion.div
        className={styles.tableHeader}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        
        
        <div className={styles.viewToggle}>
          <button 
            className={`${styles.viewButton} ${viewType === 'table' ? styles.active : ''}`}
            onClick={() => setViewType('table')}
          >
            <FiBarChart2 /> Table
          </button>
          <button 
            className={`${styles.viewButton} ${viewType === 'cards' ? styles.active : ''}`}
            onClick={() => setViewType('cards')}
          >
            <FiAward /> Cards
          </button>
        </div>
      </motion.div>
      
      <div className={styles.tournamentTabs}>
        <motion.button 
          className={`${styles.tabButton} ${activeTab === 'points' ? styles.active : ''}`}
          onClick={() => setActiveTab('points')}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
        >
           Points Table
        </motion.button>
        <motion.button 
          className={`${styles.tabButton} ${activeTab === 'stats' ? styles.active : ''}`}
          onClick={() => setActiveTab('stats')}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiAward /> Stats & Awards
        </motion.button>
        <motion.button 
          className={`${styles.tabButton} ${activeTab === 'matches' ? styles.active : ''}`}
          onClick={() => setActiveTab('matches')}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlayCircle /> Match Results
        </motion.button>
      </div>
      
      <AnimatePresence mode="wait">
        {activeTab === 'points' && (
          <motion.div 
            key="points-table"
            className={styles.pointsTableSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.sectionHeader}>
              <h3>Points Table</h3>
              
              <motion.button 
                className={styles.infoButton}
                onClick={() => setShowTableInfo(!showTableInfo)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiInfo />
              </motion.button>
            </div>
            
            <AnimatePresence>
              {showTableInfo && (
                <motion.div 
                  className={styles.tableInfo}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h4>Points System</h4>
                  <ul>
                    <li><span className={styles.infoHighlight}>Win:</span> 2 points</li>
                    <li><span className={styles.infoHighlight}>Tie/No Result:</span> 1 point</li>
                    <li><span className={styles.infoHighlight}>Loss:</span> 0 points</li>
                    <li><span className={styles.infoHighlight}>NRR:</span> Net Run Rate (runs per over scored - runs per over conceded)</li>
                  </ul>
                  <p>Top 4 teams qualify for playoffs</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {(!matchesData.pointsTable || matchesData.pointsTable.length === 0) ? (
              <div className={styles.noData}>
                <p>No matches played yet</p>
                <motion.button
                  className={styles.primaryButton}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/match/simulate')}
                >
                  <FiPlayCircle /> Play First Match
                </motion.button>
              </div>
            ) : (
              <>
                {viewType === 'table' ? (
                  <div className={styles.tableContainer}>
                    <table className={styles.pointsTable}>
                      <thead>
                        <tr>
                          <th className={styles.positionCell}>#</th>
                          <th 
                            className={`${styles.teamCell} ${styles.sortable}`}
                            onClick={() => handleSort('teamName')}
                          >
                            Team {getSortIndicator('teamName')}
                          </th>
                          <th 
                            className={styles.sortable}
                            onClick={() => handleSort('matches')}
                          >
                            M {getSortIndicator('matches')}
                          </th>
                          <th 
                            className={styles.sortable}
                            onClick={() => handleSort('won')}
                          >
                            W {getSortIndicator('won')}
                          </th>
                          <th 
                            className={styles.sortable}
                            onClick={() => handleSort('lost')}
                          >
                            L {getSortIndicator('lost')}
                          </th>
                          <th 
                            className={styles.sortable}
                            onClick={() => handleSort('tied')}
                          >
                            T {getSortIndicator('tied')}
                          </th>
                          <th 
                            className={`${styles.pointsCell} ${styles.sortable}`}
                            onClick={() => handleSort('points')}
                          >
                            Pts {getSortIndicator('points')}
                          </th>
                          <th 
                            className={`${styles.nrrCell} ${styles.sortable}`}
                            onClick={() => handleSort('nrr')}
                          >
                            NRR {getSortIndicator('nrr')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedPointsTable().map((team, index) => (
                          <motion.tr 
                            key={team.teamId} 
                            className={`
                              ${isInPlayoffContention(index) ? styles.qualifyingPosition : ''}
                              ${highlightedTeam === team.teamId ? styles.highlighted : ''}
                            `}
                            onMouseEnter={() => handleRowHover(team.teamId)}
                            onMouseLeave={handleRowHoverExit}
                            whileHover={{ backgroundColor: 'var(--hover-bg)', y: -2 }}
                          >
                            <td className={styles.positionCell}>
                              <span className={styles.position}>{index + 1}</span>
                              {isInPlayoffContention(index) && (
                                <span className={styles.qualifyingIndicator}></span>
                              )}
                            </td>
                            <td className={styles.teamCell}>
                              <div className={styles.teamInfo}>
                                <span className={styles.teamIcon}>
                                  {tournamentData.teams.find(t => t.id === team.teamId)?.icon || '🏏'}
                                </span>
                                <span>{team.teamName}</span>
                              </div>
                              <div className={styles.progressBarContainer}>
                                <motion.div 
                                  className={styles.progressBar}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${getProgressPercentage(team)}%` }}
                                  transition={{ duration: 0.8 }}
                                />
                              </div>
                            </td>
                            <td>{team.matches}</td>
                            <td className={styles.wonCell}>{team.won}</td>
                            <td className={styles.lostCell}>{team.lost}</td>
                            <td>{team.tied}</td>
                            <td className={styles.pointsCell}>{team.points}</td>
                            <td className={`${styles.nrrCell} ${team.nrr >= 0 ? styles.positiveNrr : styles.negativeNrr}`}>
                              {formatNRR(team.nrr)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={styles.teamCardsContainer}>
                    {getSortedPointsTable().map((team, index) => (
                      <motion.div 
                        key={team.teamId}
                        className={`${styles.teamCard} ${isInPlayoffContention(index) ? styles.qualifyingCard : ''}`}
                        whileHover={{ y: -8, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { delay: index * 0.1 }
                        }}
                      >
                        <div className={styles.teamCardHeader}>
                          <span className={styles.teamPosition}>#{index + 1}</span>
                          <span className={styles.teamIcon}>
                            {tournamentData.teams.find(t => t.id === team.teamId)?.icon || '🏏'}
                          </span>
                          <h4>{team.teamName}</h4>
                        </div>
                        
                        <div className={styles.teamCardStats}>
                          <div className={styles.statItem}>
                            <span className={styles.statLabel}>Points</span>
                            <span className={styles.statValue}>{team.points}</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.statLabel}>Matches</span>
                            <span className={styles.statValue}>{team.matches}</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.statLabel}>W/L</span>
                            <span className={styles.statValue}>{team.won}/{team.lost}</span>
                          </div>
                          <div className={styles.statItem}>
                            <span className={styles.statLabel}>NRR</span>
                            <span className={`${styles.statValue} ${team.nrr >= 0 ? styles.positiveNrr : styles.negativeNrr}`}>
                              {formatNRR(team.nrr)}
                            </span>
                          </div>
                        </div>
                        
                        <div className={styles.teamCardProgress}>
                          <div className={styles.progressBarContainer}>
                            <motion.div 
                              className={styles.progressBar}
                              initial={{ width: 0 }}
                              animate={{ width: `${getProgressPercentage(team)}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                          <div className={styles.progressLabel}>
                            {getProgressPercentage(team).toFixed(0)}% of max points
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                <div className={styles.tournamentActions}>
                  <motion.button
                    className={styles.primaryButton}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/match/simulate')}
                  >
                    <FiPlayCircle /> Play More Matches
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
        
        {activeTab === 'stats' && (
          <motion.div 
            key="stats-section"
            className={styles.statsSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <h3>Tournament Stats & Awards</h3>
            
            {!tournamentStats ? (
              <div className={styles.noData}>
                <p>Play matches to generate stats and awards</p>
                <motion.button
                  className={styles.primaryButton}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/match/simulate')}
                >
                  <FiPlayCircle /> Play First Match
                </motion.button>
              </div>
            ) : (
              <div className={styles.awardsContainer}>
                <motion.div 
                  className={`${styles.awardCard} ${styles.orangeCap}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className={styles.awardHeader}>
                    <div className={styles.awardIcon}><GiCricketBat /></div>
                    <div>
                      <h4>Orange Cap</h4>
                      <span className={styles.awardSubtitle}>Most Runs</span>
                    </div>
                  </div>
                  
                  {tournamentStats.orangeCap && tournamentStats.orangeCap.length > 0 ? (
                    <div className={styles.awardContent}>
                      <div className={styles.winner}>
                        <div className={styles.winnerDetails}>
                          <span className={styles.playerName}>{tournamentStats.orangeCap[0].playerName}</span>
                          <span className={styles.teamName}>{tournamentStats.orangeCap[0].teamName}</span>
                        </div>
                        <div className={styles.statValueLarge}>{tournamentStats.orangeCap[0].runs}</div>
                      </div>
                      
                      <ul className={styles.runnersUp}>
                        {tournamentStats.orangeCap.slice(1, 3).map((player, index) => (
                          <li key={player.playerId} className={styles.playerItem}>
                            <span className={styles.position}>{index + 2}</span>
                            <span className={styles.playerName}>{player.playerName}</span>
                            <span className={styles.statValue}>{player.runs}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className={styles.additionalStats}>
                        <div className={styles.statChip}>
                          <span>Strike Rate</span>
                          <span>{(tournamentStats.orangeCap[0].strikeRate || 120).toFixed(1)}</span>
                        </div>
                        <div className={styles.statChip}>
                          <span>Avg</span>
                          <span>{(tournamentStats.orangeCap[0].average || 30).toFixed(1)}</span>
                        </div>
                        <div className={styles.statChip}>
                          <span>4s/6s</span>
                          <span>{tournamentStats.orangeCap[0].fours || 0}/{tournamentStats.orangeCap[0].sixes || 0}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.noData}>No batting stats yet</p>
                  )}
                </motion.div>
                
                <motion.div 
                  className={`${styles.awardCard} ${styles.purpleCap}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className={styles.awardHeader}>
                    <div className={styles.awardIcon}><GiBaseballGlove /></div>
                    <div>
                      <h4>Purple Cap</h4>
                      <span className={styles.awardSubtitle}>Most Wickets</span>
                    </div>
                  </div>
                  
                  {tournamentStats.purpleCap && tournamentStats.purpleCap.length > 0 ? (
                    <div className={styles.awardContent}>
                      <div className={styles.winner}>
                        <div className={styles.winnerDetails}>
                          <span className={styles.playerName}>{tournamentStats.purpleCap[0].playerName}</span>
                          <span className={styles.teamName}>{tournamentStats.purpleCap[0].teamName}</span>
                        </div>
                        <div className={styles.statValueLarge}>{tournamentStats.purpleCap[0].wickets}</div>
                      </div>
                      
                      <ul className={styles.runnersUp}>
                        {tournamentStats.purpleCap.slice(1, 3).map((player, index) => (
                          <li key={player.playerId} className={styles.playerItem}>
                            <span className={styles.position}>{index + 2}</span>
                            <span className={styles.playerName}>{player.playerName}</span>
                            <span className={styles.statValue}>{player.wickets}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className={styles.additionalStats}>
                        <div className={styles.statChip}>
                          <span>Economy</span>
                          <span>{(tournamentStats.purpleCap[0].economy || 7.5).toFixed(1)}</span>
                        </div>
                        <div className={styles.statChip}>
                          <span>Avg</span>
                          <span>{(tournamentStats.purpleCap[0].average || 22).toFixed(1)}</span>
                        </div>
                        <div className={styles.statChip}>
                          <span>Best</span>
                          <span>{tournamentStats.purpleCap[0].best || '3/25'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.noData}>No bowling stats yet</p>
                  )}
                </motion.div>
                
                <motion.div 
                  className={`${styles.awardCard} ${styles.bestTeam}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className={styles.awardHeader}>
                    <div className={styles.awardIcon}><FiTrophy /></div>
                    <div>
                      <h4>Best Team</h4>
                      <span className={styles.awardSubtitle}>Top of the Table</span>
                    </div>
                  </div>
                  
                  {tournamentStats.bestTeam ? (
                    <div className={styles.awardContent}>
                      <div className={styles.winner}>
                        <motion.div 
                          className={styles.teamTrophy}
                          animate={{ rotate: [0, 5, -5, 5, 0] }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            repeatType: "reverse" 
                          }}
                        >
                          🏆
                        </motion.div>
                        <div className={styles.winnerDetails}>
                          <span className={styles.teamName}>{tournamentStats.bestTeam.teamName}</span>
                        </div>
                      </div>
                      
                      <div className={styles.teamStatGrid}>
                        <div className={styles.teamStat}>
                          <span className={styles.teamStatLabel}>Points</span>
                          <span className={styles.teamStatValue}>{tournamentStats.bestTeam.points}</span>
                        </div>
                        <div className={styles.teamStat}>
                          <span className={styles.teamStatLabel}>NRR</span>
                          <span className={`${styles.teamStatValue} ${tournamentStats.bestTeam.nrr >= 0 ? styles.positiveNrr : styles.negativeNrr}`}>
                            {formatNRR(tournamentStats.bestTeam.nrr)}
                          </span>
                        </div>
                        <div className={styles.teamStat}>
                          <span className={styles.teamStatLabel}>Wins</span>
                          <span className={styles.teamStatValue}>{tournamentStats.bestTeam.won}</span>
                        </div>
                        <div className={styles.teamStat}>
                          <span className={styles.teamStatLabel}>Losses</span>
                          <span className={styles.teamStatValue}>{tournamentStats.bestTeam.lost}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.noData}>No team stats yet</p>
                  )}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
        
        {activeTab === 'matches' && (
  <motion.div 
    key="matches-section"
    className={styles.matchesSection}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
  >
    <h3>Match Results</h3>
    
    {!matchesData.completed || matchesData.completed.length === 0 ? (
      <div className={styles.noData}>
        <p>No completed matches</p>
        <motion.button
          className={styles.primaryButton}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/match/simulate')}
        >
          <FiPlayCircle /> Play First Match
        </motion.button>
      </div>
    ) : (
      <motion.ul 
        className={styles.matchesList}
        variants={{
          visible: { 
            transition: { staggerChildren: 0.1 } 
          }
        }}
        initial="hidden"
        animate="visible"
      >
        {matchesData.completed.map(match => (
          <motion.li 
            key={match.id} 
            className={styles.matchResultCard}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ 
              y: -5, 
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)' 
            }}
          >
            <div className={styles.matchHeader}>
              <div className={`${styles.matchTypeTag} ${styles[match.type]}`}>
                {match.type === 'league' ? 'League Match' : 
                 match.type === 'knockout' ? 'Knockout' : 'Final'}
              </div>
              <span className={styles.matchDate}>
                {new Date(match.date).toLocaleDateString(undefined, {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
            
            <div className={styles.teamResults}>
              <div className={`${styles.teamResult} ${match.winner === match.team1.id ? styles.winner : ''}`}>
                <h4 className={styles.teamName}>{match.team1.name}</h4>
                <div className={styles.scoreDisplay}>
                  <span className={styles.runs}>{match.team1.score}</span>
                  <span className={styles.wickets}>/{match.team1.wickets}</span>
                  <span className={styles.overs}>
                    ({Math.floor(match.team1.overs)}.
                    {Math.round((match.team1.overs % 1) * 10)} ov)
                  </span>
                </div>
                {match.winner === match.team1.id && (
                  <motion.div 
                    className={styles.winnerBadge}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, delay: 0.2 }}
                  >
                    <GiTrophy />
                  </motion.div>
                )}
              </div>
              
              <div className={styles.versusContainer}>
                <div className={styles.versusLine}></div>
                <span className={styles.versusText}>VS</span>
                <div className={styles.versusLine}></div>
              </div>
              
              <div className={`${styles.teamResult} ${match.winner === match.team2.id ? styles.winner : ''}`}>
                <h4 className={styles.teamName}>{match.team2.name}</h4>
                <div className={styles.scoreDisplay}>
                  <span className={styles.runs}>{match.team2.score}</span>
                  <span className={styles.wickets}>/{match.team2.wickets}</span>
                  <span className={styles.overs}>
                    ({Math.floor(match.team2.overs)}.
                    {Math.round((match.team2.overs % 1) * 10)} ov)
                  </span>
                </div>
                {match.winner === match.team2.id && (
                  <motion.div 
                    className={styles.winnerBadge}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, delay: 0.2 }}
                  >
                    <GiTrophy />
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className={styles.matchSummary}>
              <div className={styles.resultSummary}>
                <span>
                  {match.result || 
                   `${tournamentData.teams.find(t => t.id === match.winner)?.name} won by ${match.winMargin} ${match.winMarginType}`}
                </span>
              </div>
              
              {match.manOfTheMatch && (
                <div className={styles.playerHighlight}>
                  <span className={styles.motmLabel}>Player of the Match:</span>
                  <span className={styles.motmName}>{match.manOfTheMatch.name}</span>
                </div>
              )}
            </div>
            
            <div className={styles.matchActions}>
              <motion.button
                className={styles.viewMatchButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/match/summary/${match.id}`)}
              >
                View Details
              </motion.button>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    )}
    
    {matchesData.completed && matchesData.completed.length === 0 && (
      <motion.div 
        className={styles.noMatchesMessage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={styles.noMatchesIcon}>
          <GiCricketBat />
        </div>
        <h3>No Matches Completed Yet</h3>
        <p>Complete some matches to see results here</p>
        <motion.button
          className={styles.createMatchButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/match/simulate')}
        >
          Schedule a Match
        </motion.button>
      </motion.div>
    )}
  </motion.div>
)} </AnimatePresence>
      
      
      
</motion.div>
);
};

export default PointsTable;