import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/helpers';
import Card from '../common/Card';

const OtherTeamsTable = ({ teams, teamBalances, currentTeam, currentBidder }) => {
  if (!teams || !teamBalances) return null;
  
  // Sort teams by remaining budget (highest first)
  const sortedTeams = [...teams].sort((a, b) => {
    const balanceA = teamBalances[a.id]?.remaining || 0;
    const balanceB = teamBalances[b.id]?.remaining || 0;
    return balanceB - balanceA;
  });
  
  return (
    <Card variant="glass" className="p-4">
      <h3 className="text-lg font-bold text-white mb-4">All Teams</h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {sortedTeams.map(team => {
          const isCurrentTeam = currentTeam && team.id === currentTeam.id;
          const isCurrentBidder = team.id === currentBidder;
          const balance = teamBalances[team.id] || {
            totalBudget: 0,
            spent: 0,
            remaining: 0,
            players: []
          };
          
          return (
            <motion.div
              key={team.id}
              className={`
                relative rounded-lg overflow-hidden
                ${isCurrentTeam ? 'border-2 border-blue-500' : 'border border-blue-900'}
                ${isCurrentBidder ? 'bg-indigo-900' : 'bg-blue-900 bg-opacity-40'}
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isCurrentBidder && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-bl-lg">
                  Bidding
                </div>
              )}
              
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.name.charAt(0)}
                    </div>
                    <h4 className="font-medium text-white">{team.name}</h4>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-blue-300">Remaining</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(balance.remaining)}</p>
                  </div>
                </div>
                
                <div className="relative h-2 bg-blue-900 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-green-500"
                    style={{ 
                      width: `${(balance.remaining / balance.totalBudget) * 100}%`,
                    }}
                  ></div>
                </div>
                
                <div className="mt-2 flex justify-between items-center text-xs">
                  <span className="text-blue-300">Players: {balance.players.length}</span>
                  <span className="text-blue-300">Spent: {formatCurrency(balance.spent)}</span>
                </div>
              </div>
              
              {/* Player summary by role */}
              <div className="bg-blue-900 bg-opacity-50 px-3 py-2 flex justify-between">
                {['batsman', 'bowler', 'allRounder', 'wicketKeeper'].map(role => {
                  const count = balance.players.filter(p => p.role === role).length;
                  return (
                    <div key={role} className="text-center">
                      <p className="text-xs text-blue-300">{getRoleShortcode(role)}</p>
                      <p className="text-sm font-medium text-white">{count}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};

// Helper function to get role shortcodes
const getRoleShortcode = (role) => {
  switch (role) {
    case 'batsman':
      return 'BAT';
    case 'bowler':
      return 'BWL';
    case 'allRounder':
      return 'ALL';
    case 'wicketKeeper':
      return 'WK';
    default:
      return role;
  }
};

export default OtherTeamsTable;