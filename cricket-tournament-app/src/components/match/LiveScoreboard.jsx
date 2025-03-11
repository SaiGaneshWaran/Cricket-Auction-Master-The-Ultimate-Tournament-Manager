import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchSimulation } from '../../hooks/useMatchSimulation';
import { formatOvers, calculateRequiredRunRate, generateCommentary } from '../../utils/matchHelper';
import './LiveScoreboard.module.css';

const LiveScoreboard = () => {
  const [commentaryExpanded, setCommentaryExpanded] = useState(true);
  
  const {
    matchesData,
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
    exportMatchHighlights
  } = useMatchSimulation();
  
  // Handle updating the score
  const handleScoreUpdate = (runsAdded, isWicket = false) => {
    updateScore(runsAdded, isWicket);
    
    // Generate random batter and bowler names for commentary
    const battingTeam = innings === 1 ? currentMatch?.team1.name : currentMatch?.team2.name;
    const bowlingTeam = innings === 1 ? currentMatch?.team2.name : currentMatch?.team1.name;
    
    // Create a ball event for commentary generation
    const ballEvent = {
      runs: runsAdded,
      isWicket,
      batter: `${battingTeam} Batter`,
      bowler: `${bowlingTeam} Bowler`
    };
    
    // Add commentary to highlights
    const commentary = generateCommentary(ballEvent);
    addHighlight(commentary);
  };
  
  // Calculate remaining runs to win (for 2nd innings)
  const getRemainingRuns = () => {
    if (!target || innings !== 2) return null;
    return target - runs + 1;
  };
  
  // Calculate required run rate (for 2nd innings)
  const getRequiredRunRate = () => {
    if (!target || innings !== 2) return null;
    
    const totalOvers = 20; // T20 format
    const completedOvers = overs + (balls / 10);
    const remainingOvers = totalOvers - completedOvers;
    
    return calculateRequiredRunRate(target + 1, runs, remainingOvers);
  };
  
  if (!currentMatch || matchStatus === 'setup') {
    return (
      <div className="scoreboard-container empty-state">
        <h2>No active match</h2>
        <p>Start a match from the Match Simulator section</p>
      </div>
    );
  }
  
  return (
    <div className="scoreboard-container">
      <div className="match-header">
        <h2>Live Scoreboard</h2>
        
        <div className="team-vs-team">
          <div className="team team1">
            <h3>{currentMatch.team1.name}</h3>
            <p>{innings === 1 ? 'Batting' : 'Bowled'}</p>
            <p className="team-score">
              {innings > 1 ? `${currentMatch.team1.score}/${currentMatch.team1.wickets}` : `${runs}/${wickets}`}
              <span className="overs">({innings > 1 ? formatOvers(currentMatch.team1.overs) : formatOvers(overs + balls/10)} ov)</span>
            </p>
          </div>
          
          <div className="vs-indicator">VS</div>
          
          <div className="team team2">
            <h3>{currentMatch.team2.name}</h3>
            <p>{innings === 2 ? 'Batting' : 'Bowling'}</p>
            <p className="team-score">
              {innings === 2 ? `${runs}/${wickets}` : '---'}
              <span className="overs">
                {innings === 2 ? `(${formatOvers(overs + balls/10)} ov)` : ''}
              </span>
            </p>
          </div>
        </div>
        
        {innings === 2 && target && (
          <motion.div 
            className="target-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="target-text">
              {currentMatch.team2.name} needs 
              <span className="highlight">{getRemainingRuns()}</span> runs 
              from <span className="highlight">{20 - overs - (balls > 0 ? 1 : 0)}.{balls > 0 ? 6 - balls : 0}</span> overs
            </p>
            <p className="required-rate">
              Required Rate: <span className="highlight">{getRequiredRunRate()?.toFixed(2)}</span>
            </p>
          </motion.div>
        )}
      </div>
      
      <div className="scoreboard-main">
        <div className="score-display">
          <div className="current-score">
            <h3 className="score-heading">Current Score</h3>
            <div className="score-row">
              <div className="score-box runs-box">
                <span className="score-label">Runs</span>
                <motion.span 
                  className="score-value"
                  key={runs}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {runs}
                </motion.span>
              </div>
              
              <div className="score-box wickets-box">
                <span className="score-label">Wickets</span>
                <motion.span 
                  className="score-value"
                  key={wickets}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {wickets}
                </motion.span>
              </div>
              
              <div className="score-box overs-box">
                <span className="score-label">Overs</span>
                <motion.span 
                  className="score-value"
                  key={`${overs}.${balls}`}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {overs}.{balls}
                </motion.span>
              </div>
            </div>
          </div>
          
          <div className="scoring-controls">
            <div className="control-row">
              <h3>Add Runs</h3>
              <div className="run-buttons">
                {[0, 1, 2, 3, 4, 6].map(runs => (
                  <motion.button
                    key={`runs-${runs}`}
                    className={`run-button runs-${runs}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleScoreUpdate(runs, false)}
                  >
                    {runs}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div className="control-row">
              <motion.button
                className="wicket-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleScoreUpdate(0, true)}
              >
                Wicket
              </motion.button>
            </div>
          </div>
        </div>
        
        <div className="commentary-section">
          <div className="commentary-header">
            <h3>Live Commentary</h3>
            <button 
              className="toggle-button"
              onClick={() => setCommentaryExpanded(!commentaryExpanded)}
            >
              {commentaryExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
          
          <AnimatePresence>
            {commentaryExpanded && (
              <motion.div 
                className="commentary-feed"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {highlightText.length === 0 ? (
                  <p className="no-commentary">No commentary yet</p>
                ) : (
                  <ul className="commentary-list">
                    {highlightText.slice().reverse().map((highlight, index) => (
                      <motion.li 
                        key={`highlight-${highlight.timestamp}`}
                        className="commentary-item"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <span className="timestamp">{highlight.timestamp}</span>
                        <span className="commentary-text">{highlight.text}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="scoreboard-footer">
        <motion.button
          className="export-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportMatchHighlights}
        >
          Export Highlights
        </motion.button>
      </div>
    </div>
  );
};

export default LiveScoreboard;