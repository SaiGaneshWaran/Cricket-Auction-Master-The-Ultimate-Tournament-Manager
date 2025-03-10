import {  AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import LiveScoreboard from './LiveScoreboard';
import styles from './MatchSimulator.module.css';

const MatchSimulator = ({ matchDetails, onMatchComplete }) => {
  const [currentInnings, setCurrentInnings] = useState(1);
  const [team1Score, setTeam1Score] = useState({
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    recentBalls: []
  });
  const [team2Score, setTeam2Score] = useState({
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    recentBalls: []
  });
  const [matchStatus, setMatchStatus] = useState('NOT_STARTED'); // NOT_STARTED, IN_PROGRESS, COMPLETED
  const [commentary, setCommentary] = useState([]);

  const maxOvers = matchDetails?.overs || 20;
  const maxWickets = 10;

  useEffect(() => {
    if (matchStatus === 'IN_PROGRESS') {
      generateCommentary();
    }
  }, [team1Score, team2Score]);

  const generateCommentary = () => {
    const currentScore = currentInnings === 1 ? team1Score : team2Score;
    const lastBall = currentScore.recentBalls[0];
    
    if (!lastBall) return;

    let comment = '';
    if (lastBall === 'W') {
      comment = `WICKET! That's a big moment in the game!`;
    } else if (lastBall === '6') {
      comment = `MASSIVE SIX! The ball sails over the boundary!`;
    } else if (lastBall === '4') {
      comment = `FOUR RUNS! Beautiful shot through the covers!`;
    }

    if (comment) {
      setCommentary(prev => [
        { text: comment, timestamp: new Date().toISOString() },
        ...prev.slice(0, 9)
      ]);
    }
  };

  const handleScoreUpdate = (newScore) => {
    if (currentInnings === 1) {
      setTeam1Score(newScore);
      checkInningsCompletion(newScore, 1);
    } else {
      setTeam2Score(newScore);
      checkInningsCompletion(newScore, 2);
    }
  };

  const checkInningsCompletion = (score, innings) => {
    const isInningsComplete = 
      score.wickets >= maxWickets || 
      (score.overs >= maxOvers) ||
      (innings === 2 && score.runs > team1Score.runs);

    if (isInningsComplete) {
      if (innings === 1) {
        setCurrentInnings(2);
      } else {
        const winner = determineWinner();
        setMatchStatus('COMPLETED');
        onMatchComplete({
          team1Score,
          team2Score,
          winner,
          commentary
        });
      }
    }
  };

  const determineWinner = () => {
    if (team1Score.runs > team2Score.runs) {
      return matchDetails.team1;
    } else if (team2Score.runs > team1Score.runs) {
      return matchDetails.team2;
    }
    return 'Tie';
  };

  const startMatch = () => {
    setMatchStatus('IN_PROGRESS');
  };

  return (
    <div className={styles.matchSimulator}>
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>{matchDetails.team1} vs {matchDetails.team2}</h2>
        <p>Match Type: {maxOvers} Overs</p>
      </motion.div>

      {matchStatus === 'NOT_STARTED' && (
        <motion.button
          className={styles.startButton}
          onClick={startMatch}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Match
        </motion.button>
      )}

      {matchStatus !== 'NOT_STARTED' && (
        <div className={styles.matchContent}>
          <div className={styles.scoreboards}>
            <div className={styles.inningsScore}>
              <h3>{matchDetails.team1}</h3>
              <p>{team1Score.runs}/{team1Score.wickets} ({team1Score.overs}.{team1Score.balls})</p>
            </div>
            <div className={styles.inningsScore}>
              <h3>{matchDetails.team2}</h3>
              <p>{team2Score.runs}/{team2Score.wickets} ({team2Score.overs}.{team2Score.balls})</p>
            </div>
          </div>

          {matchStatus === 'IN_PROGRESS' && (
            <LiveScoreboard
              matchData={currentInnings === 1 ? team1Score : team2Score}
              onScoreUpdate={handleScoreUpdate}
            />
          )}

          <motion.div 
            className={styles.commentary}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>Commentary</h3>
            <AnimatePresence>
              {commentary.map((comment) => (
                <motion.div
                  key={comment.timestamp}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={styles.commentaryItem}
                >
                  <span className={styles.commentaryText}>{comment.text}</span>
                  <span className={styles.commentaryTime}>
                    {new Date(comment.timestamp).toLocaleTimeString()}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  );
};

MatchSimulator.propTypes = {
  matchDetails: PropTypes.shape({
    team1: PropTypes.string.isRequired,
    team2: PropTypes.string.isRequired,
    overs: PropTypes.number.isRequired
  }).isRequired,
  onMatchComplete: PropTypes.func.isRequired
};

export default MatchSimulator;