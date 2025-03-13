import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchSimulation } from '../../hooks/useMatchSimulation';
import { formatOvers, calculateRequiredRunRate, generateCommentary } from '../../utils/matchHelper';
import styles from './LiveScoreboard.module.css';

const LiveScoreboard = () => {
  const [commentaryExpanded, setCommentaryExpanded] = useState(true);
  const [recentlyUpdated, setRecentlyUpdated] = useState(null);
  const [lastBoundary, setLastBoundary] = useState(null);
  const [showExportConfirmation, setShowExportConfirmation] = useState(false);
  
  const {
    currentMatch,
    innings,
    runs,
    wickets,
    overs,
    balls,
    target,
    matchStatus,
    highlightText,
    updateScore,
    addHighlight,
    exportMatchHighlights,
    currentBatters,
    currentBowler,
    recentOvers
  } = useMatchSimulation();
  
  // Handle updating the score
  const handleScoreUpdate = (runsAdded, isWicket = false) => {
    updateScore(runsAdded, isWicket);
    
    // Set recently updated value for animation
    setRecentlyUpdated(isWicket ? 'wicket' : `runs-${runsAdded}`);
    setTimeout(() => setRecentlyUpdated(null), 1500);
    
    // Check if it's a boundary for special animation
    if (runsAdded === 4 || runsAdded === 6) {
      setLastBoundary(runsAdded);
      setTimeout(() => setLastBoundary(null), 3000);
    }
    
    // Generate random batter and bowler names for commentary
    const battingTeam = innings === 1 ? currentMatch?.team1.name : currentMatch?.team2.name;
    const bowlingTeam = innings === 1 ? currentMatch?.team2.name : currentMatch?.team1.name;
    
    // Create a ball event for commentary generation
    const ballEvent = {
      runs: runsAdded,
      isWicket,
      batter: currentBatters?.[0]?.name || `${battingTeam} Batter`,
      bowler: currentBowler?.name || `${bowlingTeam} Bowler`
    };
    
    // Add commentary to highlights
    const commentary = generateCommentary(ballEvent);
    addHighlight(commentary);
  };
  
  // Handle match summary export
  const handleExport = () => {
    exportMatchHighlights();
    setShowExportConfirmation(true);
    setTimeout(() => setShowExportConfirmation(false), 3000);
  };
  
  // Calculate remaining runs to win (for 2nd innings)
  const getRemainingRuns = () => {
    if (!target || innings !== 2) return null;
    return target - runs;
  };
  
  // Calculate required run rate (for 2nd innings)
  const getRequiredRunRate = () => {
    if (!target || innings !== 2) return null;
    
    const totalOvers = 20; // T20 format
    const completedOvers = overs + (balls / 10);
    const remainingOvers = totalOvers - completedOvers;
    
    return calculateRequiredRunRate(target, runs, remainingOvers);
  };
  
  // Generate match situation text
  const getMatchSituationText = () => {
    if (matchStatus === 'completed') {
      const team1Won = currentMatch.team1.score > currentMatch.team2.score;
      const winningTeam = team1Won ? currentMatch.team1.name : currentMatch.team2.name;
      const margin = Math.abs(currentMatch.team1.score - currentMatch.team2.score);
      
      if (innings === 2 && wickets === 10) {
        return `${winningTeam} won by ${margin} runs`;
      } else if (innings === 2) {
        const remainingWickets = 10 - wickets;
        return `${winningTeam} won by ${remainingWickets} wickets`;
      }
    }
    
    if (innings === 2 && target) {
      const remainingRuns = getRemainingRuns();
      if (remainingRuns <= 0) {
        return `${currentMatch.team2.name} needs 0 more runs to win`;
      }
      
      const remainingBalls = (20 - overs) * 6 - balls;
      if (remainingRuns < 10) {
        return `Nail-biting finish! ${currentMatch.team2.name} needs ${remainingRuns} runs from ${remainingBalls} balls`;
      } else if (getRequiredRunRate() > 12) {
        return `Steep chase! RRR: ${getRequiredRunRate()?.toFixed(2)} - ${remainingRuns} needed from ${remainingBalls} balls`;
      } else if (getRequiredRunRate() < 6) {
        return `Comfortable chase! ${remainingRuns} runs needed at RRR ${getRequiredRunRate()?.toFixed(2)}`;
      } else {
        return `${remainingRuns} runs needed from ${remainingBalls} balls`;
      }
    }
    
    return innings === 1 ? "1st Innings in progress" : "2nd Innings in progress";
  };
  
  if (!currentMatch || matchStatus === 'setup') {
    return (
      <div className={styles.scoreboardContainer}>
        <div className={styles.emptyState}>
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            No active match
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Start a match from the Match Simulator section
          </motion.p>
          <motion.div 
            className={styles.cricketAnimation}
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          >
            🏏
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.scoreboardContainer}>
      {/* Boundary Animation */}
      <AnimatePresence>
        {lastBoundary && (
          <motion.div 
            className={styles.boundaryAnimation}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {lastBoundary === 4 ? 'FOUR!' : 'SIX!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Header */}
      <motion.div 
        className={styles.matchHeader}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.matchInfo}>
          <h2>Live Scoreboard</h2>
          <span className={styles.matchStatus}>
            {matchStatus === 'active' ? '🔴 LIVE' : matchStatus === 'completed' ? '✓ COMPLETED' : '⏸️ PAUSED'}
          </span>
        </div>
        
        <motion.div 
          className={styles.teamVsTeam}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`${styles.team} ${styles.team1}`}>
            <h3>{currentMatch.team1.name}</h3>
            <span className={`${styles.teamStatus} ${innings === 1 ? styles.batting : ''}`}>
              {innings === 1 ? '🏏 Batting' : '🎯 Bowled'}
            </span>
            <p className={styles.teamScore}>
              <span className={styles.scoreValue}>
                {innings > 1 ? currentMatch.team1.score : runs}
              </span>
              <span className={styles.scoreDelimiter}>/</span>
              <span className={styles.wicketValue}>
                {innings > 1 ? currentMatch.team1.wickets : wickets}
              </span>
              <span className={styles.oversValue}>
                ({innings > 1 ? formatOvers(currentMatch.team1.overs) : formatOvers(overs + balls/10)} ov)
              </span>
            </p>
          </div>
          
          <div className={styles.vsIndicator}>
            <span>VS</span>
          </div>
          
          <div className={`${styles.team} ${styles.team2}`}>
            <h3>{currentMatch.team2.name}</h3>
            <span className={`${styles.teamStatus} ${innings === 2 ? styles.batting : ''}`}>
              {innings === 2 ? '🏏 Batting' : '🎯 Bowling'}
            </span>
            <p className={styles.teamScore}>
              {innings === 2 ? (
                <>
                  <span className={styles.scoreValue}>{runs}</span>
                  <span className={styles.scoreDelimiter}>/</span>
                  <span className={styles.wicketValue}>{wickets}</span>
                  <span className={styles.oversValue}>
                    ({formatOvers(overs + balls/10)} ov)
                  </span>
                </>
              ) : (
                <span className={styles.yetToBat}>Yet to bat</span>
              )}
            </p>
          </div>
        </motion.div>
        
        {/* Target Info */}
        {innings === 2 && target && (
          <motion.div 
            className={styles.targetInfo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className={styles.targetDetails}>
              <div className={styles.targetRow}>
                <span>Target</span>
                <span className={styles.targetValue}>{target}</span>
              </div>
              <div className={styles.targetRow}>
                <span>Needs</span>
                <span className={styles.targetValue}>
                  {getRemainingRuns() <= 0 ? '0' : getRemainingRuns()}
                </span>
              </div>
              <div className={styles.targetRow}>
                <span>From</span>
                <span className={styles.targetValue}>
                  {(20 - overs - (balls > 0 ? 1 : 0))}.{balls > 0 ? 6 - balls : 0} ov
                </span>
              </div>
              <div className={styles.targetRow}>
                <span>Req. Rate</span>
                <span className={`${styles.targetValue} ${getRequiredRunRate() > 10 ? styles.highRate : ''}`}>
                  {getRequiredRunRate() ? getRequiredRunRate().toFixed(2) : 'N/A'}
                </span>
              </div>
            </div>
            <div className={styles.matchSituation}>
              {getMatchSituationText()}
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Scoreboard Main */}
      <div className={styles.scoreboardMain}>
        {/* Score Display */}
        <motion.div 
          className={styles.scoreDisplay}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.currentScore}>
            <h3 className={styles.scoreHeading}>Current Score</h3>
            <div className={styles.scoreRow}>
              {/* Runs Box */}
              <motion.div 
                className={`${styles.scoreBox} ${styles.runsBox} ${recentlyUpdated && recentlyUpdated.startsWith('runs') ? styles.updated : ''}`}
                whileHover={{ y: -3 }}
              >
                <span className={styles.scoreLabel}>Runs</span>
                <motion.span 
                  className={styles.scoreValue}
                  key={runs}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {runs}
                </motion.span>
              </motion.div>
              
              {/* Wickets Box */}
              <motion.div 
                className={`${styles.scoreBox} ${styles.wicketsBox} ${recentlyUpdated === 'wicket' ? styles.updated : ''}`}
                whileHover={{ y: -3 }}
              >
                <span className={styles.scoreLabel}>Wickets</span>
                <motion.span 
                  className={styles.scoreValue}
                  key={wickets}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {wickets}
                </motion.span>
              </motion.div>
              
              {/* Overs Box */}
              <motion.div 
                className={`${styles.scoreBox} ${styles.oversBox}`}
                whileHover={{ y: -3 }}
              >
                <span className={styles.scoreLabel}>Overs</span>
                <motion.span 
                  className={styles.scoreValue}
                  key={`${overs}.${balls}`}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {overs}.{balls}
                </motion.span>
                <span className={styles.totalOvers}>/20.0</span>
              </motion.div>
            </div>
          </div>
          
          {/* Current Batters and Bowler Section */}
          <div className={styles.currentPlayers}>
            <div className={styles.battersSection}>
              <h4>Batters</h4>
              <div className={styles.battersList}>
                {currentBatters?.map((batter, index) => (
                  <div key={batter.id} className={styles.playerItem}>
                    <span className={styles.playerName}>
                      {batter.name} {index === 0 ? '*' : ''}
                    </span>
                    <span className={styles.playerStats}>
                      {batter.runs} <span className={styles.statDivider}>(</span>{batter.balls}<span className={styles.statDivider}>)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.bowlerSection}>
              <h4>Bowler</h4>
              {currentBowler && (
                <div className={styles.playerItem}>
                  <span className={styles.playerName}>{currentBowler.name}</span>
                  <span className={styles.playerStats}>
                    {currentBowler.wickets}/{currentBowler.runsConceded} 
                    <span className={styles.statDivider}>(</span>
                    {Math.floor(currentBowler.overs)}.{(currentBowler.overs % 1) * 10}
                    <span className={styles.statDivider}>)</span>
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Overs Section */}
          <div className={styles.recentOversSection}>
            <h4>Recent Overs</h4>
            <div className={styles.recentOversList}>
              {recentOvers?.map((over, overIndex) => (
                <div key={overIndex} className={styles.overItem}>
                  <span className={styles.overNumber}>{over.number}</span>
                  <div className={styles.ballsList}>
                    {over.balls.map((ball, ballIndex) => (
                      <span 
                        key={ballIndex} 
                        className={`${styles.ballItem} ${
                          ball.runs === 4 ? styles.four : 
                          ball.runs === 6 ? styles.six : 
                          ball.isWicket ? styles.wicket : ''
                        }`}
                      >
                        {ball.isWicket ? 'W' : ball.runs}
                      </span>
                    ))}
                  </div>
                  <span className={styles.overTotal}>{over.runs}r</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Scoring Controls */}
          <div className={styles.scoringControls}>
            <div className={styles.controlRow}>
              <h3>Add Runs</h3>
              <div className={styles.runButtons}>
                {[0, 1, 2, 3, 4, 6].map(runs => (
                  <motion.button
                    key={`runs-${runs}`}
                    className={`${styles.runButton} ${styles[`runs${runs}`]} ${recentlyUpdated === `runs-${runs}` ? styles.highlighted : ''}`}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleScoreUpdate(runs, false)}
                  >
                    {runs}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div className={styles.controlRow}>
              <motion.button
                className={`${styles.wicketButton} ${recentlyUpdated === 'wicket' ? styles.highlighted : ''}`}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleScoreUpdate(0, true)}
              >
                Wicket
              </motion.button>
            </div>
          </div>
        </motion.div>
        
        {/* Commentary Section */}
        <motion.div 
          className={styles.commentarySection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.commentaryHeader}>
            <h3>Live Commentary</h3>
            <motion.button 
              className={styles.toggleButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCommentaryExpanded(!commentaryExpanded)}
            >
              {commentaryExpanded ? 'Collapse' : 'Expand'}
            </motion.button>
          </div>
          
          <AnimatePresence>
            {commentaryExpanded && (
              <motion.div 
                className={styles.commentaryFeed}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {highlightText.length === 0 ? (
                  <p className={styles.noCommentary}>No commentary yet</p>
                ) : (
                  <ul className={styles.commentaryList}>
                    {highlightText.slice().reverse().map((highlight, index) => (
                      <motion.li 
                        key={`highlight-${highlight.timestamp}`}
                        className={styles.commentaryItem}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <span className={styles.timestamp}>{highlight.timestamp}</span>
                        <span className={styles.commentaryText}>{highlight.text}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Scoreboard Footer */}
      <motion.div 
        className={styles.scoreboardFooter}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {showExportConfirmation ? (
          <motion.div 
            className={styles.confirmationMessage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Match highlights exported successfully! ✓
          </motion.div>
        ) : (
          <motion.button
            className={styles.exportButton}
            whileHover={{ scale: 1.05, boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
          >
            <span className={styles.exportIcon}>📊</span>
            Export Highlights
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default LiveScoreboard;