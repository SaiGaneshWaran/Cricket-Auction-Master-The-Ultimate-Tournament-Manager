import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/helpers';
import Card from '../common/Card';

const SpendingAnalysis = ({ team, teamBalance, players = [], teamBudget }) => {
  // Calculate spending by role
  const spendingByRole = useMemo(() => {
    const result = {
      batsman: 0,
      bowler: 0,
      allRounder: 0,
      wicketKeeper: 0
    };
    
    players.forEach(player => {
      if (result[player.role] !== undefined) {
        result[player.role] += player.soldPrice;
      }
    });
    
    return result;
  }, [players]);
  
  // Calculate total spending
  const totalSpending = useMemo(() => {
    return Object.values(spendingByRole).reduce((sum, value) => sum + value, 0);
  }, [spendingByRole]);
  
  // Calculate spending percentages
  const spendingPercentages = useMemo(() => {
    const result = {};
    
    for (const role in spendingByRole) {
      result[role] = totalSpending > 0 
        ? (spendingByRole[role] / totalSpending) * 100 
        : 0;
    }
    
    return result;
  }, [spendingByRole, totalSpending]);
  
  // Calculate highest and lowest spends
  const highestSpend = useMemo(() => {
    if (players.length === 0) return null;
    
    return players.reduce((highest, player) => 
      player.soldPrice > highest.soldPrice ? player : highest
    , players[0]);
  }, [players]);
  
  const lowestSpend = useMemo(() => {
    if (players.length === 0) return null;
    
    return players.reduce((lowest, player) => 
      player.soldPrice < lowest.soldPrice ? player : lowest
    , players[0]);
  }, [players]);
  
  // Calculate average spend
  const averageSpend = useMemo(() => {
    return players.length > 0 
      ? totalSpending / players.length 
      : 0;
  }, [players, totalSpending]);
  
  // Format role label
  const formatRole = (role) => {
    switch (role) {
      case 'batsman':
        return 'Batsmen';
      case 'bowler':
        return 'Bowlers';
      case 'allRounder':
        return 'All-Rounders';
      case 'wicketKeeper':
        return 'Wicket-Keepers';
      default:
        return role;
    }
  };
  
  // Role colors for charts
  const roleColors = {
    batsman: '#3B82F6', // blue-500
    bowler: '#10B981', // emerald-500
    allRounder: '#8B5CF6', // violet-500
    wicketKeeper: '#F59E0B' // amber-500
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
          <h2 className="text-xl font-bold text-white">{team.name} Spending Analysis</h2>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-blue-300">Total Spending</p>
          <p className="text-lg font-bold text-white">{formatCurrency(totalSpending)}</p>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Budget Overview</h3>
          
          <div className="space-y-4">
            <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-blue-300">Total Budget</span>
                <span className="text-white font-medium">{formatCurrency(teamBudget)}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-blue-300">Amount Spent</span>
                <span className="text-white font-medium">{formatCurrency(totalSpending)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-300">Remaining</span>
                <span className="text-white font-medium">{formatCurrency(teamBudget - totalSpending)}</span>
              </div>
              
              <div className="mt-3 relative h-4 bg-blue-900 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalSpending / teamBudget) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              
              <div className="mt-1 flex justify-between text-xs text-blue-300">
                <span>{Math.round((totalSpending / teamBudget) * 100)}% Used</span>
                <span>{Math.round(100 - (totalSpending / teamBudget) * 100)}% Available</span>
              </div>
            </div>
            
            <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg">
              <h4 className="text-md font-medium text-white mb-3">Spending Highlights</h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-blue-300 text-sm mb-1">Average Player Cost</p>
                  <p className="text-white text-lg font-bold">{formatCurrency(averageSpend)}</p>
                </div>
                
                {highestSpend && (
                  <div>
                    <p className="text-blue-300 text-sm mb-1">Highest Spend</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{highestSpend.name}</p>
                        <p className="text-xs text-blue-300">{formatRole(highestSpend.role)}</p>
                      </div>
                      <p className="text-white font-bold">{formatCurrency(highestSpend.soldPrice)}</p>
                    </div>
                  </div>
                )}
                
                {lowestSpend && (
                  <div>
                    <p className="text-blue-300 text-sm mb-1">Lowest Spend</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{lowestSpend.name}</p>
                        <p className="text-xs text-blue-300">{formatRole(lowestSpend.role)}</p>
                      </div>
                      <p className="text-white font-bold">{formatCurrency(lowestSpend.soldPrice)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Spending by Role */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Spending by Role</h3>
          
          <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg">
            <div className="mb-6">
              {/* Donut Chart */}
              <div className="relative w-48 h-48 mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Create a circle segment for each role */}
                  {Object.entries(spendingPercentages).map(([role, percentage], index) => {
                    // Skip if percentage is 0
                    if (percentage === 0) return null;
                    
                    // Calculate the segment's start and end angles
                    let cumulativePercentage = 0;
                    for (let i = 0; i < index; i++) {
                      const roleKey = Object.keys(spendingPercentages)[i];
                      cumulativePercentage += spendingPercentages[roleKey];
                    }
                    
                    const startAngle = (cumulativePercentage / 100) * 360;
                    const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
                    
                    // Calculate the segment path
                    const startRad = (startAngle - 90) * Math.PI / 180;
                    const endRad = (endAngle - 90) * Math.PI / 180;
                    
                    const x1 = 50 + 40 * Math.cos(startRad);
                    const y1 = 50 + 40 * Math.sin(startRad);
                    const x2 = 50 + 40 * Math.cos(endRad);
                    const y2 = 50 + 40 * Math.sin(endRad);
                    
                    // Determine the large arc flag
                    const largeArcFlag = percentage > 50 ? 1 : 0;
                    
                    // Create the SVG path
                    const pathData = `
                      M 50 50
                      L ${x1} ${y1}
                      A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}
                      Z
                    `;
                    
                    return (
                      <motion.path
                        key={role}
                        d={pathData}
                        fill={roleColors[role]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    );
                  })}
                  
                  {/* Inner circle for donut effect */}
                  <circle cx="50" cy="50" r="25" fill="#0F172A" />
                </svg>
                
                {/* Center text showing total */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-blue-300">Total</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(totalSpending)}</p>
                </div>
              </div>
              
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(spendingByRole).map(([role, amount]) => (
                  <div key={role} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: roleColors[role] }}
                    ></div>
                    <div className="text-sm">
                      <span className="text-white">{formatRole(role)}</span>
                      <span className="mx-1 text-blue-300">•</span>
                      <span className="text-blue-300">{Math.round(spendingPercentages[role])}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Role Spending Bars */}
            <div className="space-y-3">
              {Object.entries(spendingByRole).map(([role, amount]) => (
                <div key={role}>
                  <div className="flex justify-between mb-1">
                    <span className="text-blue-300 text-sm">{formatRole(role)}</span>
                    <span className="text-white text-sm font-medium">{formatCurrency(amount)}</span>
                  </div>
                  <div className="relative h-3 bg-blue-900 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full"
                      style={{ backgroundColor: roleColors[role] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${spendingPercentages[role]}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SpendingAnalysis;