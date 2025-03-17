import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Card from '../common/Card';

const AuctionHistory = ({ history = [], teams = [] }) => {
  // Group history by player
  const groupedHistory = history.reduce((grouped, bid) => {
    if (!grouped[bid.playerId]) {
      grouped[bid.playerId] = [];
    }
    grouped[bid.playerId].push(bid);
    return grouped;
  }, {});
  
  // Get sorted player IDs by latest bid timestamp
  const sortedPlayerIds = Object.entries(groupedHistory)
    .sort(([, bidsA], [, bidsB]) => {
      const latestBidA = bidsA[bidsA.length - 1].timestamp;
      const latestBidB = bidsB[bidsB.length - 1].timestamp;
      return new Date(latestBidB) - new Date(latestBidA);
    })
    .map(([playerId]) => playerId);
  
  // Find team details
  const getTeamDetails = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return {
      name: team?.name || 'Unknown Team',
      color: team?.color || '#888888'
    };
  };
  
  // Calculate the time difference between bids
  const getTimeDifference = (timestamp, prevTimestamp) => {
    if (!prevTimestamp) return '';
    
    const diff = new Date(timestamp) - new Date(prevTimestamp);
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) {
      return `+${seconds}s`;
    }
    
    return `+${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };
  
  return (
    <Card variant="glass" className="p-4">
      <h3 className="text-lg font-bold text-white mb-4">Auction History</h3>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        <AnimatePresence initial={false}>
          {sortedPlayerIds.map(playerId => {
            const bids = groupedHistory[playerId];
            const latestBid = bids[bids.length - 1];
            const team = getTeamDetails(latestBid.teamId);
            
            return (
              <motion.div
                key={playerId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3 }}
                className="bg-blue-900 bg-opacity-40 rounded-lg overflow-hidden"
              >
                <div className="p-3 border-b border-blue-800">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-white">Player #{playerId.substring(0, 6)}</h4>
                    <span className="text-xs text-blue-300">{formatDate(latestBid.timestamp)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: team.color }}
                      ></div>
                      <span className="text-sm text-white">{team.name}</span>
                    </div>
                    <span className="font-bold text-white">{formatCurrency(latestBid.amount)}</span>
                  </div>
                </div>
                
                {bids.length > 1 && (
                  <div className="p-3 bg-blue-900 bg-opacity-30">
                    <p className="text-xs text-blue-300 mb-2">Bidding History</p>
                    <div className="space-y-2">
                      {bids.map((bid, index) => {
                        const prevBid = index > 0 ? bids[index - 1] : null;
                        const teamDetails = getTeamDetails(bid.teamId);
                        const timeDiff = getTimeDifference(bid.timestamp, prevBid?.timestamp);
                        
                        return (
                          <div key={bid.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: teamDetails.color }}
                              ></div>
                              <span className="text-xs text-white">{teamDetails.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-white">{formatCurrency(bid.amount)}</span>
                              {timeDiff && (
                                <span className="text-xs text-blue-300">{timeDiff}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {sortedPlayerIds.length === 0 && (
          <div className="text-center py-8">
            <p className="text-blue-300">No bidding history yet</p>
            <p className="text-sm text-blue-400 mt-2">Bids will appear here as they are placed</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AuctionHistory;