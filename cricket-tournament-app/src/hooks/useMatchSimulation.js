import { useState, useCallback } from 'react';
import { 
  calculateCurrentRunRate, 
  calculateRequiredRunRate,
  updateMatchScore 
} from '../utils/matchHelper';

const useMatchSimulation = (matchId, maxOvers = 20) => {
  const [innings, setInnings] = useState(1);
  const [score, setScore] = useState({
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0
  });
  const [target, setTarget] = useState(0);
  const [matchStatus, setMatchStatus] = useState('NOT_STARTED');
  const [commentary, setCommentary] = useState([]);
  const [ballHistory, setBallHistory] = useState([]);

  const possibleOutcomes = [
    { type: 'run', value: 0, probability: 30 },
    { type: 'run', value: 1, probability: 35 },
    { type: 'run', value: 2, probability: 10 },
    { type: 'run', value: 4, probability: 12 },
    { type: 'run', value: 6, probability: 8 },
    { type: 'wicket', value: 'W', probability: 5 }
  ];

  const generateCommentary = useCallback((outcome) => {
    const commentaries = {
      0: [
        'Dot ball! Good defensive shot',
        'No run, well bowled',
        'Played and missed, no run'
      ],
      1: [
        'Single taken, good running',
        'Quick single to rotate strike',
        'One run, keeps the score ticking'
      ],
      2: [
        'Good running between wickets, two runs',
        'Push to deep, comfortable two runs',
        'Two runs added to the total'
      ],
      4: [
        'FOUR! Beautiful shot through the covers',
        'FOUR RUNS! Well placed shot',
        'Brilliant boundary shot!'
      ],
      6: [
        'SIX! Maximum! What a shot!',
        'Into the crowd! SIX RUNS!',
        'Huge six over long-on!'
      ],
      'W': [
        'WICKET! Big moment in the game',
        'OUT! Crucial breakthrough',
        'GOT HIM! Important wicket falls'
      ]
    };

    const options = commentaries[outcome] || commentaries[0];
    return options[Math.floor(Math.random() * options.length)];
  }, []);

  const simulateBall = useCallback(() => {
    if (matchStatus !== 'IN_PROGRESS') return;

    // Generate random outcome based on probabilities
    const rand = Math.random() * 100;
    let sum = 0;
    const outcome = possibleOutcomes.find(({ probability }) => {
      sum += probability;
      return rand <= sum;
    });

    // Update score
    const newScore = { ...score };
    if (outcome.type === 'run') {
      newScore.runs += outcome.value;
    } else if (outcome.type === 'wicket') {
      newScore.wickets += 1;
    }

    // Update overs/balls
    if (newScore.balls === 5) {
      newScore.overs += 1;
      newScore.balls = 0;
    } else {
      newScore.balls += 1;
    }

    // Add commentary
    const commentary = generateCommentary(outcome.value);
    setCommentary(prev => [{
      text: commentary,
      timestamp: new Date().toISOString(),
      ball: `${newScore.overs}.${newScore.balls}`,
      outcome: outcome.value
    }, ...prev.slice(0, 9)]);

    // Add to ball history
    setBallHistory(prev => [...prev, outcome.value]);

    // Update match score in storage
    updateMatchScore(matchId, innings, newScore);
    setScore(newScore);

    // Check innings/match completion
    checkInningsCompletion(newScore);
  }, [score, matchStatus, innings, matchId, generateCommentary]);

  const checkInningsCompletion = useCallback((currentScore) => {
    const isInningsComplete = 
      currentScore.wickets >= 10 || 
      currentScore.overs >= maxOvers ||
      (innings === 2 && currentScore.runs > target);

    if (isInningsComplete) {
      if (innings === 1) {
        setTarget(currentScore.runs + 1);
        setInnings(2);
        setScore({
          runs: 0,
          wickets: 0,
          overs: 0,
          balls: 0
        });
      } else {
        setMatchStatus('COMPLETED');
      }
    }
  }, [innings, target, maxOvers]);

  const startMatch = useCallback(() => {
    setMatchStatus('IN_PROGRESS');
  }, []);

  const getCurrentRunRate = useCallback(() => {
    return calculateCurrentRunRate(score.runs, score.overs, score.balls);
  }, [score]);

  const getRequiredRunRate = useCallback(() => {
    if (innings !== 2) return 0;
    const remainingOvers = maxOvers - (score.overs + score.balls/6);
    return calculateRequiredRunRate(target, score.runs, remainingOvers);
  }, [innings, score, target, maxOvers]);

  return {
    score,
    innings,
    target,
    matchStatus,
    commentary,
    ballHistory,
    simulateBall,
    startMatch,
    getCurrentRunRate,
    getRequiredRunRate
  };
};

export default useMatchSimulation;