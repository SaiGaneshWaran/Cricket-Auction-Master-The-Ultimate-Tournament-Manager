import {  motion,AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './LiveScoreboard.module.css';


const LiveScoreboard = ({ matchData, onScoreUpdate }) => {
  const [score, setScore] = useState({
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    currentBowler: '',
    currentBatsman: '',
    recentBalls: []
  });

  useEffect(() => {
    if (matchData) {
      setScore(prevScore => ({
        ...prevScore,
        ...matchData
      }));
    }
  }, [matchData]);

  const scoreVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300 }
    }
  };

  const updateScore = (type, value) => {
    setScore(prevScore => {
      const newScore = { ...prevScore };
      
      switch(type) {
        case 'RUNS':
          newScore.runs += value;
          newScore.recentBalls.unshift(`${value}`);
          break;
        case 'WICKET':
          newScore.wickets += 1;
          newScore.recentBalls.unshift('W');
          break;
        case 'BALL':
          if (newScore.balls === 5) {
            newScore.overs += 1;
            newScore.balls = 0;
          } else {
            newScore.balls += 1;
          }
          break;
        default:
          break;
      }

      newScore.recentBalls = newScore.recentBalls.slice(0, 6);
      onScoreUpdate(newScore);
      return newScore;
    });
  };

  return (
    <div className={styles.scoreboard}>
      <motion.div 
        className={styles.scoreDisplay}
        variants={scoreVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className={styles.score}>
          {score.runs}/{score.wickets}
        </h2>
        <h3 className={styles.overs}>
          ({score.overs}.{score.balls})
        </h3>
      </motion.div>

      <div className={styles.recentBalls}>
        <h4>Recent Balls:</h4>
        <AnimatePresence>
          {score.recentBalls.map((ball, index) => (
            <motion.span
              key={`${ball}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`${styles.ball} ${ball === 'W' ? styles.wicket : ''}`}
            >
              {ball}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div className={styles.controls}>
        <div className={styles.runButtons}>
          {[0, 1, 2, 3, 4, 6].map(runs => (
            <motion.button
              key={runs}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateScore('RUNS', runs)}
              className={styles.runButton}
            >
              {runs}
            </motion.button>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => updateScore('WICKET')}
          className={styles.wicketButton}
        >
          Wicket
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => updateScore('BALL')}
          className={styles.ballButton}
        >
          Next Ball
        </motion.button>
      </div>
    </div>
  );
};

LiveScoreboard.propTypes = {
  matchData: PropTypes.shape({
    runs: PropTypes.number,
    wickets: PropTypes.number,
    overs: PropTypes.number,
    balls: PropTypes.number,
    currentBowler: PropTypes.string,
    currentBatsman: PropTypes.string,
    recentBalls: PropTypes.arrayOf(PropTypes.string)
  }),
  onScoreUpdate: PropTypes.func.isRequired
};

LiveScoreboard.defaultProps = {
  matchData: {
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    currentBowler: '',
    currentBatsman: '',
    recentBalls: []
  }
};

export default LiveScoreboard;