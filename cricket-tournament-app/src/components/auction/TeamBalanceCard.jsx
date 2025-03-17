import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/helpers';
import Card from '../common/Card';

const TeamBalanceCard = ({ team, teamBalance }) => {
  if (!team || !teamBalance) return null;
  
  // Calculate remaining percentage
  const remainingPercentage = (teamBalance.remaining / teamBalance.totalBudget) * 100;
  
  // Function to get player role summary
  const getPlayerRoleSummary = () => {
    const roleCounts = {
      batsman: 0,
      bowler: 0,
      allRounder: 0,
      wicketKeeper: 0
    };
    
    teamBalance.players.forEach(player => {
      if (roleCounts[player.role] !== undefined) {
        roleCounts[player.role]++;
      }
    });
    
    return roleCounts;
  };
  
  const roleCounts = getPlayerRoleSummary();
  
  return (
    <Card variant="primary" className="overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-blue-800">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
            style={{ backgroundColor: team.color }}
          >
            {team.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{team.name}</h3>
            <p className="text-sm text-blue-300">Your Team</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-blue-300">Total Budget</p>
          <p className="text-lg font-bold text-white">{formatCurrency(teamBalance.totalBudget)}</p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-blue-300">Remaining</p>
          <p className="text-lg font-bold text-white">{formatCurrency(teamBalance.remaining)}</p>
        </div>
        
        <div className="relative h-4 bg-blue-900 rounded-full overflow-hidden mb-4">
          <motion.div 
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-green-500 to-blue-500"
            initial={{ width: '100%' }}
            animate={{ width: `${remainingPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-blue-300">Spent</p>
          <p className="text-white font-medium">{formatCurrency(teamBalance.spent)}</p>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-blue-300 mb-2">Team Composition</h4>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-blue-900 bg-opacity-40 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-300">BAT</p>
              <p className="text-lg font-bold text-white">{roleCounts.batsman}</p>
            </div>
            <div className="bg-blue-900 bg-opacity-40 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-300">BOWL</p>
              <p className="text-lg font-bold text-white">{roleCounts.bowler}</p>
            </div>
            <div className="bg-blue-900 bg-opacity-40 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-300">ALL</p>
              <p className="text-lg font-bold text-white">{roleCounts.allRounder}</p>
            </div>
            <div className="bg-blue-900 bg-opacity-40 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-300">WK</p>
              <p className="text-lg font-bold text-white">{roleCounts.wicketKeeper}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-blue-300 mb-2">Acquired Players ({teamBalance.players.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {teamBalance.players.map(player => (
              <div 
                key={player.id}
                className="flex items-center justify-between bg-blue-900 bg-opacity-30 p-2 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-indigo-700 text-white"
                  >
                    {player.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{player.name}</p>
                    <p className="text-xs text-blue-300">{formatRole(player.role)}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-white">{formatCurrency(player.soldPrice)}</p>
              </div>
            ))}
            
            {teamBalance.players.length === 0 && (
              <div className="text-center py-4 text-blue-300 text-sm">
                No players acquired yet
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Helper function to format role
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

export default TeamBalanceCard;