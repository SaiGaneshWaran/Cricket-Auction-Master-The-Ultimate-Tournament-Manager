import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/helpers';
import Card from '../common/Card';

const TeamRoster = ({ team, teamBalance, players = [] }) => {
  const [activeRole, setActiveRole] = useState('all');
  
  // Role filters
  const roles = [
    { id: 'all', label: 'All Players' },
    { id: 'batsman', label: 'Batsmen' },
    { id: 'bowler', label: 'Bowlers' },
    { id: 'allRounder', label: 'All-Rounders' },
    { id: 'wicketKeeper', label: 'Wicket-Keepers' }
  ];
  
  // Filter players by role
  const filteredPlayers = players.filter(player => 
    activeRole === 'all' || player.role === activeRole
  );
  
  // Sort players by price (highest first)
  const sortedPlayers = [...filteredPlayers].sort((a, b) => b.soldPrice - a.soldPrice);
  
  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'batsman':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 19V7L20 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 22V17L7 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 22V17L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'bowler':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15L18 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15L6 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'allRounder':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12L11 15L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'wicketKeeper':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 22L18 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 22V17C8 15.3431 9.34315 14 11 14H13C14.6569 14 16 15.3431 16 17V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Format role label
  const formatRole = (role) => {
    switch (role) {
      case 'batsman':
        return 'Batsman';
      case 'bowler':
        return 'Bowler';
      case 'allRounder':
        return 'All-Rounder';
      case 'wicketKeeper':
        return 'Wicket-Keeper';
      default:
        return role;
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <Card variant="glass">
      <div className="p-4 border-b border-blue-800 flex justify-between items-center">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
            style={{ backgroundColor: team.color }}
          >
            {team.name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-white">{team.name} Roster</h2>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-blue-300">Total Players</p>
          <p className="text-lg font-bold text-white">{players.length}</p>
        </div>
      </div>
      
      {/* Role filters */}
      <div className="p-4 flex overflow-x-auto space-x-2 border-b border-blue-800">
        {roles.map(role => (
          <button
            key={role.id}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              activeRole === role.id 
                ? 'bg-blue-700 text-white' 
                : 'bg-blue-900 bg-opacity-50 text-blue-300 hover:bg-opacity-70 hover:text-white'
            }`}
            onClick={() => setActiveRole(role.id)}
          >
            {role.label}
          </button>
        ))}
      </div>
      
      {/* Team stats summary */}
      <div className="p-4 border-b border-blue-800">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg">
            <p className="text-xs text-blue-300 mb-1">Batsmen</p>
            <p className="text-xl font-bold text-white">{players.filter(p => p.role === 'batsman').length}</p>
          </div>
          
          <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg">
            <p className="text-xs text-blue-300 mb-1">Bowlers</p>
            <p className="text-xl font-bold text-white">{players.filter(p => p.role === 'bowler').length}</p>
          </div>
          
          <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg">
            <p className="text-xs text-blue-300 mb-1">All-Rounders</p>
            <p className="text-xl font-bold text-white">{players.filter(p => p.role === 'allRounder').length}</p>
          </div>
          
          <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg">
            <p className="text-xs text-blue-300 mb-1">Wicket-Keepers</p>
            <p className="text-xl font-bold text-white">{players.filter(p => p.role === 'wicketKeeper').length}</p>
          </div>
        </div>
      </div>
      
      {/* Player list */}
      <div className="p-4">
        {sortedPlayers.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {sortedPlayers.map(player => (
              <motion.div
                key={player.id}
                variants={itemVariants}
                className="bg-blue-900 bg-opacity-30 rounded-lg overflow-hidden"
              >
                <div className="p-4 flex flex-col sm:flex-row sm:items-center">
                  <div className="flex items-center mb-3 sm:mb-0 sm:flex-1">
                    <div className="w-12 h-12 bg-indigo-800 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      {player.name.charAt(0)}
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold text-white">{player.name}</h4>
                      <div className="flex items-center text-blue-300">
                        <span className="mr-1">{getRoleIcon(player.role)}</span>
                        <span>{formatRole(player.role)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-x-6 gap-y-2">
                    <div className="text-right">
                      <p className="text-xs text-blue-300">Price</p>
                      <p className="text-lg font-bold text-white">{formatCurrency(player.soldPrice)}</p>
                    </div>
                    
                    <div className="sm:border-l sm:border-blue-800 sm:pl-6">
                      {player.battingStyle && (
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-white text-sm">{player.battingStyle}</span>
                        </div>
                      )}
                      
                      {player.bowlingStyle && (
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-white text-sm">{player.bowlingStyle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Player stats */}
                <div className="bg-blue-900 bg-opacity-50 px-4 py-3 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-xs text-blue-300">Matches</p>
                    <p className="text-white font-medium">{player.stats.matches}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-blue-300">Runs</p>
                    <p className="text-white font-medium">{player.stats.runs}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-blue-300">Bat Avg</p>
                    <p className="text-white font-medium">{player.stats.battingAverage}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-blue-300">Strike Rate</p>
                    <p className="text-white font-medium">{player.stats.battingStrikeRate}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-blue-300">{player.role === 'bowler' || player.role === 'allRounder' ? 'Wickets' : 'Highest Score'}</p>
                    <p className="text-white font-medium">
                      {player.role === 'bowler' || player.role === 'allRounder' 
                        ? player.stats.wickets 
                        : player.stats.highestScore}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="text-blue-300">No players found.</p>
            {activeRole !== 'all' && (
              <p className="text-sm text-blue-400 mt-2">Try selecting a different role filter.</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TeamRoster;