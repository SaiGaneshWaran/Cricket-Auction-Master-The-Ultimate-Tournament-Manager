import { motion } from 'framer-motion';
import { useMatch } from '../../contexts/MatchContext';
import Button from '../common/Button';
import Card from '../common/Card';

const MatchControls = ({ match }) => {
  const { 
    simulateBall, 
    toggleAutoSimulation, 
    setSimulationSpeed, 
    toggleSimulationPause,
    autoSimulation,
    isSimulationPaused,
    matchSimulationSpeed
  } = useMatch();
  
  if (!match) return null;
  
  // Format overs
  const formatOvers = (overs, balls = 0) => {
    return `${overs}.${balls}`;
  };
  
  // Get match progress percentage
  const getMatchProgress = () => {
    const totalBalls = match.overs * 6 * 2; // Total balls in the match (both innings)
    const currentInningsOvers = match.currentOver * 6 + match.currentBall;
    const firstInningsOvers = match.currentInnings === 2 ? match.overs * 6 : 0;
    
    const ballsCompleted = firstInningsOvers + currentInningsOvers;
    return (ballsCompleted / totalBalls) * 100;
  };
  
  // Get innings progress
  const getInningsProgress = () => {
    const totalBalls = match.overs * 6;
    const currentBalls = match.currentOver * 6 + match.currentBall;
    return (currentBalls / totalBalls) * 100;
  };
  
  return (
    <Card variant="glass" className="overflow-hidden">
      <div className="p-4 border-b border-blue-800 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Match Controls</h3>
        
        <div className="flex space-x-2">
          <Button
            variant={autoSimulation ? "primary" : "glass"}
            size="sm"
            onClick={toggleAutoSimulation}
          >
            Auto Sim {autoSimulation ? 'ON' : 'OFF'}
          </Button>
          
          {autoSimulation && (
            <Button
              variant={isSimulationPaused ? "warning" : "glass"}
              size="sm"
              onClick={toggleSimulationPause}
            >
              {isSimulationPaused ? 'Resume' : 'Pause'}
            </Button>
          )}
        </div>
      </div>
      
      {/* Match Progress */}
      <div className="p-4 border-b border-blue-800">
        <div className="flex justify-between items-center mb-2">
          <span className="text-blue-300 text-sm">Match Progress</span>
          <span className="text-white text-sm font-medium">
            {match.currentInnings === 1 ? 'First Innings' : 'Second Innings'}
          </span>
        </div>
        
        <div className="relative h-2 bg-blue-900 rounded-full overflow-hidden mb-1">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${getMatchProgress()}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-blue-300">
          <span>0 overs</span>
          <span>{match.overs * 2} overs</span>
        </div>
      </div>
      
      {/* Innings Progress */}
      <div className="p-4 border-b border-blue-800">
        <div className="flex justify-between items-center mb-2">
          <span className="text-blue-300 text-sm">Current Innings</span>
          <span className="text-white text-sm font-medium">
            {formatOvers(match.currentOver, match.currentBall)} / {match.overs}.0 overs
          </span>
        </div>
        
        <div className="relative h-2 bg-blue-900 rounded-full overflow-hidden mb-1">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-600"
            initial={{ width: 0 }}
            animate={{ width: `${getInningsProgress()}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-blue-300">
          <span>{match.battingTeam === match.team1.id ? match.team1.name : match.team2.name} Batting</span>
          <span>{match.currentOver * 6 + match.currentBall} balls</span>
        </div>
      </div>
      
      {/* Simulation Controls */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Simulation Speed</label>
              <div className="flex space-x-2">
                <button 
                  className={`px-3 py-1 rounded-md text-xs font-medium ${matchSimulationSpeed === 0.5 ? 'bg-blue-600 text-white' : 'bg-blue-900 text-blue-300'}`}
                  onClick={() => setSimulationSpeed(0.5)}
                >
                  Slow
                </button>
                <button 
                  className={`px-3 py-1 rounded-md text-xs font-medium ${matchSimulationSpeed === 1 ? 'bg-blue-600 text-white' : 'bg-blue-900 text-blue-300'}`}
                  onClick={() => setSimulationSpeed(1)}
                >
                  Normal
                </button>
                <button 
                  className={`px-3 py-1 rounded-md text-xs font-medium ${matchSimulationSpeed === 2 ? 'bg-blue-600 text-white' : 'bg-blue-900 text-blue-300'}`}
                  onClick={() => setSimulationSpeed(2)}
                >
                  Fast
                </button>
                <button 
                  className={`px-3 py-1 rounded-md text-xs font-medium ${matchSimulationSpeed === 5 ? 'bg-blue-600 text-white' : 'bg-blue-900 text-blue-300'}`}
                  onClick={() => setSimulationSpeed(5)}
                >
                  Super Fast
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-blue-300">Auto Simulation:</span>
              <div 
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${autoSimulation ? 'bg-green-600' : 'bg-gray-700'}`}
                onClick={toggleAutoSimulation}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${autoSimulation ? 'translate-x-6' : ''}`}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-blue-300">Pause Simulation:</span>
              <div 
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isSimulationPaused ? 'bg-yellow-600' : 'bg-gray-700'}`}
                onClick={toggleSimulationPause}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${isSimulationPaused ? 'translate-x-6' : ''}`}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <Button 
              variant="primary" 
              size="lg"
              onClick={simulateBall}
              disabled={autoSimulation && !isSimulationPaused}
              className="w-full"
            >
              <div className="flex flex-col items-center">
                <span>Simulate Ball</span>
                <span className="text-xs opacity-80 mt-1">
                  {autoSimulation && !isSimulationPaused ? 'Auto Simulation Active' : 'Manual Mode'}
                </span>
              </div>
            </Button>
          </div>
        </div>
        
        {/* Current Over Status */}
        {match.currentInnings && (
          <div className="mt-4 p-3 bg-blue-900 bg-opacity-40 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-2">Current Over</h4>
            <div className="flex justify-center space-x-2">
              {Array.from({ length: 6 }).map((_, index) => {
                const ballInOver = index;
                const isCurrent = ballInOver === match.currentBall;
                const isPast = ballInOver < match.currentBall;
                
                // Get ball data if available
                const currentInnings = match.currentInnings === 1 ? match.innings1 : match.innings2;
                const ballData = currentInnings.overs?.[match.currentOver]?.balls?.[ballInOver];
                
                return (
                  <div 
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isCurrent ? 'bg-yellow-500 text-black' : 
                        isPast && ballData ? 
                          ballData.wicket ? 'bg-red-600 text-white' : 
                          ballData.runs === 4 ? 'bg-blue-600 text-white' :
                          ballData.runs === 6 ? 'bg-purple-600 text-white' :
                          ballData.runs > 0 ? 'bg-green-600 text-white' :
                          'bg-gray-700 text-white' 
                        : 'bg-blue-900 text-blue-300'
                      }
                    `}
                  >
                    {isPast && ballData ? 
                      ballData.wicket ? 'W' : 
                      ballData.extra ? 'E' :
                      ballData.runs 
                      : index + 1
                    }
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MatchControls;