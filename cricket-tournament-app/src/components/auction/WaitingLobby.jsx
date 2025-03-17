import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Card from '../common/Card';

const WaitingLobby = ({ 
  tournamentData, 
  isOrganizer, 
  onStartAuction, 
  onTeamSelect,
  allCaptainsJoined,
  isCaptain,
  selectedTeam
}) => {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(selectedTeam?.id || '');
  const [isTeamSelectionOpen, setIsTeamSelectionOpen] = useState(!isCaptain);
  
  // Set connected users from tournament data
  useEffect(() => {
    if (tournamentData && tournamentData.connectedUsers) {
      setConnectedUsers(tournamentData.connectedUsers);
    } else {
      // Simulate connected users for demonstration
      const simulatedUsers = tournamentData?.teams?.map(team => ({
        id: team.id,
        name: `${team.name} Captain`,
        role: 'captain',
        teamId: team.id,
        connected: Math.random() > 0.3 // 70% chance of being connected
      })) || [];
      
      // Add some viewers
      for (let i = 0; i < 3; i++) {
        simulatedUsers.push({
          id: `viewer_${i}`,
          name: `Viewer ${i + 1}`,
          role: 'viewer',
          connected: Math.random() > 0.2 // 80% chance of being connected
        });
      }
      
      setConnectedUsers(simulatedUsers);
    }
  }, [tournamentData]);
  
  // Handle team selection
  const handleTeamSelect = () => {
    if (!selectedTeamId) return;
    
    const team = tournamentData?.teams?.find(t => t.id === selectedTeamId);
    if (team) {
      onTeamSelect(team);
      setIsTeamSelectionOpen(false);
    }
  };
  
  // Calculate connected captains
  const connectedCaptains = connectedUsers.filter(u => u.role === 'captain' && u.connected);
  const connectedViewers = connectedUsers.filter(u => u.role === 'viewer' && u.connected);
  
  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">{tournamentData?.name || 'Cricket Auction'}</h1>
          <p className="text-xl text-blue-300">Waiting for auction to start...</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team Selection */}
          {isTeamSelectionOpen && (
            <Card variant="primary" className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Select Your Team</h2>
              
              <div className="space-y-4">
                <p className="text-blue-300">Choose a team to represent in the auction:</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {tournamentData?.teams?.map(team => {
                    const isTeamTaken = connectedCaptains.some(u => u.teamId === team.id);
                    
                    return (
                      <div
                        key={team.id}
                        className={`
                          cursor-pointer rounded-lg p-3 border-2 transition-all
                          ${selectedTeamId === team.id ? 'border-blue-500 bg-blue-900' : 'border-blue-900 bg-blue-900 bg-opacity-30'}
                          ${isTeamTaken && selectedTeamId !== team.id ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        onClick={() => {
                          if (!isTeamTaken || selectedTeamId === team.id) {
                            setSelectedTeamId(team.id);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                            style={{ backgroundColor: team.color }}
                          >
                            {team.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{team.name}</h3>
                            {isTeamTaken && (
                              <p className="text-xs text-red-400">Already selected</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleTeamSelect}
                  disabled={!selectedTeamId}
                >
                  Confirm Selection
                </Button>
              </div>
            </Card>
          )}
          
          {/* Connected Users */}
          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Lobby Status</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-blue-300 mb-2">Team Captains ({connectedCaptains.length}/{tournamentData?.teams?.length || 0})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {tournamentData?.teams?.map(team => {
                    const captain = connectedCaptains.find(u => u.teamId === team.id);
                    const isConnected = !!captain;
                    
                    return (
                      <div
                        key={team.id}
                        className="flex items-center justify-between bg-blue-900 bg-opacity-30 p-2 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: team.color }}
                          >
                            {team.name.charAt(0)}
                          </div>
                          <span className="text-white">{team.name}</span>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs text-blue-300">{isConnected ? 'Connected' : 'Waiting'}</span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {tournamentData?.teams?.length === 0 && (
                    <p className="text-center text-blue-300 py-2">No teams available</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-blue-300 mb-2">Viewers ({connectedViewers.length})</h3>
                <div className="bg-blue-900 bg-opacity-30 p-2 rounded-lg">
                  <p className="text-white">{connectedViewers.length} viewers are watching</p>
                </div>
              </div>
              
              {isOrganizer && (
                <div className="pt-4 border-t border-blue-800">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={onStartAuction}
                    disabled={connectedCaptains.length === 0}
                  >
                    {allCaptainsJoined 
                      ? 'Start Auction' 
                      : `Start Auction (${connectedCaptains.length}/${tournamentData?.teams?.length || 0} captains)`}
                  </Button>
                  
                  {!allCaptainsJoined && (
                    <p className="text-xs text-center text-blue-300 mt-2">
                      Not all captains have joined, but you can still start the auction
                    </p>
                  )}
                </div>
              )}
              
              {!isOrganizer && (
                <div className="pt-4 border-t border-blue-800">
                  <div className="bg-blue-900 bg-opacity-50 p-3 rounded-lg text-center">
                    <p className="text-blue-300">Waiting for the organizer to start the auction</p>
                    {isCaptain && (
                      <p className="text-white mt-2">
                        You will be representing <span className="font-bold">{selectedTeam?.name}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {/* Auction Info */}
          {!isTeamSelectionOpen && (
            <Card variant="glass" className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Auction Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-blue-300 mb-2">How It Works</h3>
                  <ul className="space-y-2 text-white">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-700 text-white text-xs mr-2 flex-shrink-0">1</span>
                      <span>Players will be auctioned one by one</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-700 text-white text-xs mr-2 flex-shrink-0">2</span>
                      <span>Each player has a 15-second bidding window</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-700 text-white text-xs mr-2 flex-shrink-0">3</span>
                      <span>Minimum bid increment is 4% of current bid</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-700 text-white text-xs mr-2 flex-shrink-0">4</span>
                      <span>Timer resets on each new bid</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-700 text-white text-xs mr-2 flex-shrink-0">5</span>
                      <span>Player goes to highest bidder when time runs out</span>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-blue-800">
                  <h3 className="text-sm font-medium text-blue-300 mb-2">Tournament Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-300">Teams:</span>
                      <span className="text-white">{tournamentData?.teams?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Players:</span>
                      <span className="text-white">{tournamentData?.players?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Team Budget:</span>
                      <span className="text-white">{tournamentData?.teamBudget || 0} Cr ₹</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingLobby;