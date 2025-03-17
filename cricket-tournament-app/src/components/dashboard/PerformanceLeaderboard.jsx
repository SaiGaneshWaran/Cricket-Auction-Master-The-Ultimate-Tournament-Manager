import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';

const PerformanceLeaderboard = ({ 
  performanceStats = {
    mostRuns: [],
    mostWickets: [],
    bestEconomy: [],
    highestStrikeRate: []
  }, 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState('mostRuns');
  
  // Tab definitions
  const tabs = [
    { id: 'mostRuns', label: 'Most Runs', icon: '🏏' },
    { id: 'mostWickets', label: 'Most Wickets', icon: '🎯' },
    { id: 'bestEconomy', label: 'Best Economy', icon: '📊' },
    { id: 'highestStrikeRate', label: 'Highest SR', icon: '⚡' }
  ];
  
  // Get leaderboard columns based on the active tab
  const getLeaderboardColumns = () => {
    switch (activeTab) {
      case 'mostRuns':
        return [
          { key: 'playerName', label: 'Player', align: 'left' },
          { key: 'teamName', label: 'Team', align: 'left' },
          { key: 'matches', label: 'M', align: 'center' },
          { key: 'runs', label: 'Runs', align: 'center', highlight: true },
          { key: 'strikeRate', label: 'SR', align: 'center' }
        ];
      case 'mostWickets':
        return [
          { key: 'playerName', label: 'Player', align: 'left' },
          { key: 'teamName', label: 'Team', align: 'left' },
          { key: 'matches', label: 'M', align: 'center' },
          { key: 'wickets', label: 'Wkts', align: 'center', highlight: true },
          { key: 'economy', label: 'Econ', align: 'center' }
        ];
      case 'bestEconomy':
        return [
          { key: 'playerName', label: 'Player', align: 'left' },
          { key: 'teamName', label: 'Team', align: 'left' },
          { key: 'overs', label: 'Overs', align: 'center' },
          { key: 'wickets', label: 'Wkts', align: 'center' },
          { key: 'economy', label: 'Econ', align: 'center', highlight: true }
        ];
      case 'highestStrikeRate':
        return [
          { key: 'playerName', label: 'Player', align: 'left' },
          { key: 'teamName', label: 'Team', align: 'left' },
          { key: 'matches', label: 'M', align: 'center' },
          { key: 'runs', label: 'Runs', align: 'center' },
          { key: 'strikeRate', label: 'SR', align: 'center', highlight: true }
        ];
      default:
        return [];
    }
  };
  
  const columns = getLeaderboardColumns();
  const data = performanceStats[activeTab] || [];
  const hasData = data.length > 0;
  
  return (
    <Card variant="glass" className={`overflow-hidden ${className}`}>
      <div className="p-4 border-b border-blue-800">
        <h3 className="text-lg font-bold text-white">Performance Leaders</h3>
      </div>
      
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-blue-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-blue-300 hover:text-white'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <table className="min-w-full">
              <thead>
                <tr className="bg-blue-900 bg-opacity-50 text-xs text-blue-300">
                  <th className="py-3 px-4 text-left">Rank</th>
                  {columns.map(column => (
                    <th 
                      key={column.key}
                      className={`py-3 px-4 text-${column.align}`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {hasData ? (
                  data.map((player, index) => (
                    <motion.tr 
                      key={player.playerId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`text-white border-b border-blue-800 ${index % 2 === 0 ? 'bg-blue-900 bg-opacity-20' : ''}`}
                    >
                      <td className="py-3 px-4 text-left">
                        {index === 0 ? (
                          <div className="w-6 h-6 rounded-full bg-yellow-500 text-gray-900 flex items-center justify-center font-bold">
                            1
                          </div>
                        ) : index === 1 ? (
                          <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-900 flex items-center justify-center font-bold">
                            2
                          </div>
                        ) : index === 2 ? (
                          <div className="w-6 h-6 rounded-full bg-yellow-700 text-gray-900 flex items-center justify-center font-bold">
                            3
                          </div>
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </td>
                      {columns.map(column => (
                        <td 
                          key={`${player.playerId}-${column.key}`}
                          className={`py-3 px-4 text-${column.align} ${column.highlight ? 'font-bold' : ''}`}
                        >
                          {column.key === 'playerName' ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center text-xs font-bold">
                                {player.playerName.charAt(0)}
                              </div>
                              <span>{player.playerName}</span>
                            </div>
                          ) : column.key === 'teamName' ? (
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: player.teamColor }}
                              ></div>
                              <span>{player.teamName}</span>
                            </div>
                          ) : (
                            player[column.key]
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <tr className="text-white">
                    <td colSpan={columns.length + 1} className="py-8 text-center text-blue-300">
                      No performance data available yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {hasData && activeTab === 'mostRuns' && (
        <div className="p-4 bg-blue-900 bg-opacity-30">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-yellow-500 text-gray-900 flex items-center justify-center font-bold mr-2">
              🏏
            </div>
            <span className="text-sm text-white">
              <span className="font-bold">{data[0]?.playerName}</span> leads with <span className="font-bold">{data[0]?.runs} runs</span> in the tournament
            </span>
          </div>
        </div>
      )}
      
      {hasData && activeTab === 'mostWickets' && (
        <div className="p-4 bg-blue-900 bg-opacity-30">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-yellow-500 text-gray-900 flex items-center justify-center font-bold mr-2">
              🎯
            </div>
            <span className="text-sm text-white">
              <span className="font-bold">{data[0]?.playerName}</span> leads with <span className="font-bold">{data[0]?.wickets} wickets</span> in the tournament
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PerformanceLeaderboard;