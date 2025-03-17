/**
 * Calculate run rate
 * @param {number} runs - Total runs scored
 * @param {number} overs - Total overs faced (e.g., 4.3 for 4 overs and 3 balls)
 * @returns {number} Run rate (runs per over)
 */
export const calculateRunRate = (runs, overs) => {
    if (runs === 0 || overs === 0) return 0;
    
    // Convert overs to a decimal (e.g., 4.3 to 4.5)
    const oversDecimal = Math.floor(overs) + (overs % 1) * 10 / 6;
    
    return +(runs / oversDecimal).toFixed(2);
  };
  
  /**
   * Calculate required run rate
   * @param {number} target - Target score
   * @param {number} currentScore - Current score
   * @param {number} oversRemaining - Overs remaining (e.g., 4.3 for 4 overs and 3 balls)
   * @returns {number} Required run rate
   */
  export const calculateRequiredRunRate = (target, currentScore, oversRemaining) => {
    if (target <= currentScore) return 0;
    if (oversRemaining === 0) return 99.99; // Impossible
    
    const runsRequired = target - currentScore;
    
    // Convert overs to a decimal (e.g., 4.3 to 4.5)
    const oversDecimal = Math.floor(oversRemaining) + (oversRemaining % 1) * 10 / 6;
    
    return +(runsRequired / oversDecimal).toFixed(2);
  };
  
  /**
   * Calculate strike rate
   * @param {number} runs - Runs scored
   * @param {number} balls - Balls faced
   * @returns {number} Strike rate (runs per 100 balls)
   */
  export const calculateStrikeRate = (runs, balls) => {
    if (runs === 0 || balls === 0) return 0;
    return +((runs / balls) * 100).toFixed(2);
  };
  
  /**
   * Calculate economy rate
   * @param {number} runs - Runs conceded
   * @param {number} overs - Overs bowled (e.g., 4.3 for 4 overs and 3 balls)
   * @returns {number} Economy rate
   */
  export const calculateEconomyRate = (runs, overs) => {
    if (runs === 0 || overs === 0) return 0;
    
    // Convert overs to a decimal (e.g., 4.3 to 4.5)
    const oversDecimal = Math.floor(overs) + (overs % 1) * 10 / 6;
    
    return +(runs / oversDecimal).toFixed(2);
  };
  
  /**
   * Calculate net run rate
   * @param {number} runsScored - Total runs scored
   * @param {number} oversFaced - Total overs faced
   * @param {number} runsConceded - Total runs conceded
   * @param {number} oversBowled - Total overs bowled
   * @returns {number} Net run rate
   */
  export const calculateNetRunRate = (runsScored, oversFaced, runsConceded, oversBowled) => {
    if (oversFaced === 0 || oversBowled === 0) return 0;
    
    // Convert overs to a decimal
    const oversFacedDecimal = Math.floor(oversFaced) + (oversFaced % 1) * 10 / 6;
    const oversBowledDecimal = Math.floor(oversBowled) + (oversBowled % 1) * 10 / 6;
    
    const runRateScored = runsScored / oversFacedDecimal;
    const runRateConceded = runsConceded / oversBowledDecimal;
    
    return +(runRateScored - runRateConceded).toFixed(3);
  };
  
  /**
   * Calculate average (batting or bowling)
   * @param {number} runs - Runs scored or conceded
   * @param {number} dismissals - Times dismissed or wickets taken
   * @returns {number} Average
   */
  export const calculateAverage = (runs, dismissals) => {
    if (runs === 0 || dismissals === 0) return 0;
    return +(runs / dismissals).toFixed(2);
  };
  
  /**
   * Calculate maiden over percentage
   * @param {number} maidens - Maiden overs bowled
   * @param {number} overs - Total overs bowled
   * @returns {number} Maiden over percentage
   */
  export const calculateMaidenPercentage = (maidens, overs) => {
    if (maidens === 0 || overs === 0) return 0;
    return +((maidens / Math.floor(overs)) * 100).toFixed(2);
  };
  
  /**
   * Calculate partnership run rate
   * @param {number} runs - Runs scored in partnership
   * @param {number} balls - Balls faced in partnership
   * @returns {number} Partnership run rate
   */
  export const calculatePartnershipRunRate = (runs, balls) => {
    if (runs === 0 || balls === 0) return 0;
    return +((runs / balls) * 6).toFixed(2);
  };
  
  /**
   * Calculate batting position statistics
   * @param {Array} matches - Array of match data
   * @param {number} position - Batting position (1-11)
   * @returns {Object} Position statistics
   */
  export const calculatePositionStats = (matches, position) => {
    const stats = {
      matches: 0,
      runs: 0,
      balls: 0,
      highestScore: 0,
      fifties: 0,
      hundreds: 0,
      average: 0,
      strikeRate: 0
    };
    
    matches.forEach(match => {
      const positionBatsman = match.battingScorecard.filter(b => b.position === position);
      
      positionBatsman.forEach(batsman => {
        stats.matches++;
        stats.runs += batsman.runs;
        stats.balls += batsman.balls;
        stats.highestScore = Math.max(stats.highestScore, batsman.runs);
        
        if (batsman.runs >= 50 && batsman.runs < 100) {
          stats.fifties++;
        } else if (batsman.runs >= 100) {
          stats.hundreds++;
        }
      });
    });
    
    stats.average = calculateAverage(stats.runs, stats.matches);
    stats.strikeRate = calculateStrikeRate(stats.runs, stats.balls);
    
    return stats;
  };
  
  /**
   * Calculate bowling spell statistics
   * @param {Array} overs - Array of over data
   * @returns {Object} Spell statistics
   */
  export const calculateSpellStats = (overs) => {
    const stats = {
      overs: overs.length,
      runs: 0,
      wickets: 0,
      maidens: 0,
      economy: 0
    };
    
    overs.forEach(over => {
      let overRuns = 0;
      over.balls.forEach(ball => {
        if (ball.runs) {
          stats.runs += ball.runs;
          overRuns += ball.runs;
        }
        if (ball.wicket) {
          stats.wickets++;
        }
      });
      
      if (overRuns === 0) {
        stats.maidens++;
      }
    });
    
    stats.economy = calculateEconomyRate(stats.runs, stats.overs);
    
    return stats;
  };
  
  /**
   * Calculate team totals at each over
   * @param {Array} overs - Array of over data
   * @returns {Array} Array of [over, cumulativeRuns] pairs
   */
  export const calculateRunsProgression = (overs) => {
    const progression = [];
    let cumulativeRuns = 0;
    
    overs.forEach((over, index) => {
      let overRuns = 0;
      over.balls.forEach(ball => {
        if (ball.runs) {
          overRuns += ball.runs;
        }
      });
      
      cumulativeRuns += overRuns;
      progression.push([index + 1, cumulativeRuns]);
    });
    
    return progression;
  };
  
  /**
   * Calculate wickets progression
   * @param {Array} overs - Array of over data
   * @returns {Array} Array of [over, cumulativeWickets] pairs
   */
  export const calculateWicketsProgression = (overs) => {
    const progression = [];
    let cumulativeWickets = 0;
    
    overs.forEach((over, index) => {
      let overWickets = 0;
      over.balls.forEach(ball => {
        if (ball.wicket) {
          overWickets++;
        }
      });
      
      cumulativeWickets += overWickets;
      progression.push([index + 1, cumulativeWickets]);
    });
    
    return progression;
  };
  
  /**
   * Calculate run distribution (1s, 2s, 3s, 4s, 6s, dots)
   * @param {Array} overs - Array of over data
   * @returns {Object} Run distribution
   */
  export const calculateRunDistribution = (overs) => {
    const distribution = {
      dot: 0,
      one: 0,
      two: 0,
      three: 0,
      four: 0,
      six: 0
    };
    
    overs.forEach(over => {
      over.balls.forEach(ball => {
        if (!ball.extra) { // Don't count extras
          if (ball.runs === 0) {
            distribution.dot++;
          } else if (ball.runs === 1) {
            distribution.one++;
          } else if (ball.runs === 2) {
            distribution.two++;
          } else if (ball.runs === 3) {
            distribution.three++;
          } else if (ball.runs === 4) {
            distribution.four++;
          } else if (ball.runs === 6) {
            distribution.six++;
          }
        }
      });
    });
    
    return distribution;
  };