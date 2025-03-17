import { motion } from 'framer-motion';
import { calculateRunRate, calculateRequiredRunRate } from '../../utils/statistics';
import Card from '../common/Card';

const LiveScoreboard = ({ match, className = '' }) => {
  if (!match) return null;
  
  // Determine batting and bowling teams
  const battingTeam = match.battingTeam === match.team1.id ? match.team1 : match.team2;
  const bowlingTeam = match.battingTeam === match.team1.id ? match.team2 : match.team1;
  
  // Calculate run rate
  const currentRunRate = calculateRunRate(battingTeam.score, match.currentOver + (match.currentBall / 6));
  
  // Calculate required run rate (for second innings)
  let requiredRunRate = 0;
  let runsRequired = 0;
  let ballsRemaining = 0;
  
  if (match.currentInnings === 2) {
    const targetTeam = match.battingTeam === match.team1.id ? match.team2 : match.team1;
    const target = targetTeam.score + 1;
    runsRequired = target - battingTeam.score;
    const oversRemaining = match.overs - (match.currentOver + (match.currentBall / 6));
    ballsRemaining = Math.ceil(oversRemaining * 6);
    requiredRunRate = calculateRequiredRunRate(target, battingTeam.score, oversRemaining);
  }
  
  // Format overs
  const formatOvers = (overs, balls = 0) => {
    return `${overs}.${balls}`;
  };
  
  // Get current batsmen
  const getCurrentBatsmen = () => {
    if (!match.currentBatsmen || match.currentBatsmen.length === 0) {
      return [
        { name: 'Batsman 1', runs: 0, balls: 0 },
        { name: 'Batsman 2', runs: 0, balls: 0 }
      ];
    }
    
    return match.currentBatsmen.map(batsman => {
      const scorecard = match.battingScorecard.find(b => b.playerId === batsman.playerId);
      return {
        name: batsman.name,
        runs: scorecard?.runs || 0,
        balls: scorecard?.balls || 0,
        fours: scorecard?.fours || 0,
        sixes: scorecard?.sixes || 0,
        strikeRate: scorecard?.strikeRate || 0,
        onStrike: batsman.onStrike
      };
    });
  };
  
  // Get current bowler
  const getCurrentBowler = () => {
    if (!match.currentBowler) {
      return { name: 'Bowler', overs: 0, maidens: 0, runs: 0, wickets: 0 };
    }
    
    const scorecard = match.bowlingScorecard.find(b => b.playerId === match.currentBowler.playerId);
    return {
      name: match.currentBowler.name,
      overs: scorecard?.overs || 0,
      maidens: scorecard?.maidens || 0,
      runs: scorecard?.runs || 0,
      wickets: scorecard?.wickets || 0
    };
  };
  
  // Get current partnership
  const getCurrentPartnership = () => {
    if (!match.innings1.partnerships || match.innings1.partnerships.length === 0) {
      return { runs: 0, balls: 0 };
    }
    
    const partnerships = match.currentInnings === 1 
      ? match.innings1.partnerships 
      : match.innings2.partnerships;
    
    return partnerships[partnerships.length - 1] || { runs: 0, balls: 0 };
  };
  
  const batsmen = getCurrentBatsmen();
  const bowler = getCurrentBowler();
  const partnership = getCurrentPartnership();
  
  return (
    <Card variant="glass" className={`p-0 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-indigo-900 p-4 border-b border-indigo-800">
        <div className="flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-bold text-white">
            {match.team1.name} vs {match.team2.name}
          </h2>
          
          <div className="flex items-center">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              match.status === 'live' 
                ? 'bg-green-600 text-white' 
                : match.status === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-yellow-600 text-white'
            }`}>
              {match.status === 'live' ? 'LIVE' : match.status.toUpperCase()}
            </span>
            
            {match.venue && (
              <span className="ml-2 text-xs text-blue-300">
                {match.venue}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Score */}
      <div className="p-4 md:p-6 border-b border-blue-800">
        <div className="flex flex-col md:flex-row justify-between">
          {/* Batting Team Score */}
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded-full mr-3"
                style={{ backgroundColor: battingTeam.color }}
              ></div>
              <div>
                <h3 className="text-lg font-bold text-white">{battingTeam.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-white">{battingTeam.score}/{battingTeam.wickets}</span>
                  <span className="ml-2 text-blue-300">
                    ({formatOvers(match.currentOver, match.currentBall)})
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Match Status/Required Runs */}
          <div className="bg-blue-900 bg-opacity-40 rounded-lg p-3">
            {match.currentInnings === 1 ? (
              <div>
                <p className="text-xs text-blue-300">Current Run Rate</p>
                <p className="text-xl font-bold text-white">{currentRunRate.toFixed(2)}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-blue-300">Target</p>
                <div className="flex flex-col">
                  <p className="text-lg font-bold text-white">
                    {runsRequired} runs from {ballsRemaining} balls
                  </p>
                  <p className="text-xs text-blue-300">
                    Required RR: {requiredRunRate.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Match Status Bar */}
        {match.currentInnings === 2 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-300 mb-1">
              <span>{battingTeam.name}</span>
              <span>{bowlingTeam.name}</span>
            </div>
            <div className="relative h-2 bg-blue-900 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400"
                initial={{ width: '0%' }}
                animate={{ width: `${(battingTeam.score / (bowlingTeam.score + 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-xs text-blue-300 mt-1">
              <span>{battingTeam.score}/{battingTeam.wickets}</span>
              <span>{bowlingTeam.score}/{bowlingTeam.wickets}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Current Batsmen */}
      <div className="p-4 border-b border-blue-800">
        <h4 className="text-sm font-medium text-blue-300 mb-2">Batsmen</h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="text-xs text-blue-300 border-b border-blue-800">
                <th className="text-left pb-2">Batsman</th>
                <th className="text-right pb-2">R</th>
                <th className="text-right pb-2">B</th>
                <th className="text-right pb-2">4s</th>
                <th className="text-right pb-2">6s</th>
                <th className="text-right pb-2">SR</th>
              </tr>
            </thead>
            <tbody>
              {batsmen.map((batsman, index) => (
                <tr key={index} className="text-white">
                  <td className="py-2 pr-4 text-left flex items-center">
                    {batsman.onStrike && (
                      <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    )}
                    {batsman.name}
                  </td>
                  <td className="py-2 text-right font-bold">{batsman.runs}</td>
                  <td className="py-2 text-right">{batsman.balls}</td>
                  <td className="py-2 text-right">{batsman.fours || 0}</td>
                  <td className="py-2 text-right">{batsman.sixes || 0}</td>
                  <td className="py-2 text-right">
                    {batsman.balls > 0 ? ((batsman.runs / batsman.balls) * 100).toFixed(1) : '0.0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-2 text-sm text-blue-300">
          <span>Partnership: </span>
          <span className="text-white font-medium">{partnership.runs} runs</span>
          <span> in </span>
          <span className="text-white font-medium">{partnership.balls} balls</span>
        </div>
      </div>
      
      {/* Current Bowler */}
      <div className="p-4 border-b border-blue-800">
        <h4 className="text-sm font-medium text-blue-300 mb-2">Bowler</h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="text-xs text-blue-300 border-b border-blue-800">
                <th className="text-left pb-2">Bowler</th>
                <th className="text-right pb-2">O</th>
                <th className="text-right pb-2">M</th>
                <th className="text-right pb-2">R</th>
                <th className="text-right pb-2">W</th>
                <th className="text-right pb-2">Econ</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-white">
                <td className="py-2 pr-4 text-left">{bowler.name}</td>
                <td className="py-2 text-right">{bowler.overs}</td>
                <td className="py-2 text-right">{bowler.maidens}</td>
                <td className="py-2 text-right">{bowler.runs}</td>
                <td className="py-2 text-right font-bold">{bowler.wickets}</td>
                <td className="py-2 text-right">
                  {bowler.overs > 0 ? (bowler.runs / bowler.overs).toFixed(1) : '0.0'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Last 5 Overs */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-blue-300 mb-2">Last 5 Overs</h4>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const overIndex = Math.max(0, match.currentOver - (5 - index));
            const overData = match.currentInnings === 1 
              ? match.innings1.overs?.[overIndex] 
              : match.innings2.overs?.[overIndex];
            
            if (!overData || overIndex >= match.currentOver) {
              return (
                <div 
                  key={index}
                  className="w-16 h-10 flex items-center justify-center rounded-lg bg-blue-900 bg-opacity-30 text-blue-300 text-xs"
                >
                  -
                </div>
              );
            }
            
            const overRuns = overData.balls.reduce((total, ball) => total + (ball.runs || 0), 0);
            const overWickets = overData.balls.filter(ball => ball.wicket).length;
            
            return (
              <div 
                key={index}
                className="min-w-16 h-10 flex flex-col items-center justify-center rounded-lg bg-blue-900 bg-opacity-50 px-2"
              >
                <span className="text-xs text-blue-300">Over {overIndex + 1}</span>
                <div className="flex items-center">
                  <span className="text-white font-medium">{overRuns}</span>
                  {overWickets > 0 && (
                    <span className="text-red-400 ml-1">-{overWickets}w</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default LiveScoreboard;