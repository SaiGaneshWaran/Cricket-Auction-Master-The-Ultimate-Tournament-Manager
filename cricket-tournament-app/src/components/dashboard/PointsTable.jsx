import { motion } from 'framer-motion';
import Card from '../common/Card';

const PointsTable = ({ pointsTable = {}, className = '' }) => {
  // Convert points table object to array and sort
  const teams = Object.values(pointsTable).sort((a, b) => {
    // Sort by points first
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    
    // If points are equal, sort by net run rate
    return b.netRunRate - a.netRunRate;
  });
  
  // Check if there are any teams with data
  const hasTeams = teams.length > 0;
  
  return (
    <Card variant="glass" className={`overflow-hidden ${className}`}>
      <div className="p-4 border-b border-blue-800">
        <h3 className="text-lg font-bold text-white">Points Table</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-blue-900 bg-opacity-50 text-xs text-blue-300">
              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-left">Team</th>
              <th className="py-3 px-4 text-center">P</th>
              <th className="py-3 px-4 text-center">W</th>
              <th className="py-3 px-4 text-center">L</th>
              <th className="py-3 px-4 text-center">T/NR</th>
              <th className="py-3 px-4 text-center">Pts</th>
              <th className="py-3 px-4 text-center">NRR</th>
            </tr>
          </thead>
          
          <tbody>
            {hasTeams ? (
              teams.map((team, index) => (
                <motion.tr 
                  key={team.teamId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`text-white border-b border-blue-800 ${index % 2 === 0 ? 'bg-blue-900 bg-opacity-20' : ''}`}
                >
                  <td className="py-3 px-4 text-left">{index + 1}</td>
                  <td className="py-3 px-4 text-left">
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded-full mr-2"
                        style={{ backgroundColor: team.teamColor }}
                      ></div>
                      <span className="font-medium">{team.teamName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">{team.played}</td>
                  <td className="py-3 px-4 text-center">{team.won}</td>
                  <td className="py-3 px-4 text-center">{team.lost}</td>
                  <td className="py-3 px-4 text-center">{team.tied + team.noResult}</td>
                  <td className="py-3 px-4 text-center font-bold">{team.points}</td>
                  <td className="py-3 px-4 text-center" style={{ color: team.netRunRate >= 0 ? '#34D399' : '#F87171' }}>
                    {team.netRunRate.toFixed(3)}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr className="text-white">
                <td colSpan="8" className="py-8 text-center text-blue-300">
                  No teams or matches data available yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-3 bg-blue-900 bg-opacity-30 text-xs">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-blue-300">
          <div className="flex items-center">
            <span className="mr-1">P:</span>
            <span className="text-white">Played</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">W:</span>
            <span className="text-white">Won</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">L:</span>
            <span className="text-white">Lost</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">T/NR:</span>
            <span className="text-white">Tied/No Result</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">Pts:</span>
            <span className="text-white">Points</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">NRR:</span>
            <span className="text-white">Net Run Rate</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PointsTable;