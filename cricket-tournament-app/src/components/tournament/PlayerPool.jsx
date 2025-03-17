import React from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';

const PlayerPool = ({ playerPool, onPlayerPoolUpdate }) => {
  const updatePlayerCount = (type, value) => {
    onPlayerPoolUpdate({
      ...playerPool,
      [type]: parseInt(value) || 0
    });
  };

  const calculateTotalPlayers = () => {
    return Object.values(playerPool).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-6">Configure Player Pool</h3>
      
      <p className="text-blue-300 mb-4">
        Define how many players of each type will be available in the auction.
        This will generate a balanced player pool with realistic skills and attributes.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-blue-300 mb-2">Batsmen</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="15"
              max="40"
              value={playerPool.batsmen}
              onChange={(e) => updatePlayerCount('batsmen', e.target.value)}
              className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white font-bold w-8 text-right">{playerPool.batsmen}</span>
          </div>
          
          <label className="block text-sm font-medium text-blue-300 mb-2">Bowlers</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="15"
              max="40"
              value={playerPool.bowlers}
              onChange={(e) => updatePlayerCount('bowlers', e.target.value)}
              className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white font-bold w-8 text-right">{playerPool.bowlers}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-blue-300 mb-2">All-Rounders</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="10"
              max="30"
              value={playerPool.allRounders}
              onChange={(e) => updatePlayerCount('allRounders', e.target.value)}
              className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white font-bold w-8 text-right">{playerPool.allRounders}</span>
          </div>
          
          <label className="block text-sm font-medium text-blue-300 mb-2">Wicket-Keepers</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="5"
              max="20"
              value={playerPool.wicketKeepers}
              onChange={(e) => updatePlayerCount('wicketKeepers', e.target.value)}
              className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white font-bold w-8 text-right">{playerPool.wicketKeepers}</span>
          </div>
        </div>
      </div>
      
      <motion.div 
        className="mt-6 p-4 bg-indigo-900/40 rounded-lg border border-indigo-700/30 flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div>
          <p className="text-blue-300 font-medium">Total Players</p>
          <p className="text-white text-2xl font-bold">{calculateTotalPlayers()}</p>
        </div>
        
        <div className="text-right">
          <p className="text-blue-300 font-medium">Recommended</p>
          <p className="text-green-400">60-100 players</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PlayerPool;