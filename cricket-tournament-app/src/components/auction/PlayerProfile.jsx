import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/helpers';
import Card from '../common/Card';

const PlayerProfile = ({ 
  player, 
  currentBid, 
  currentBidder, 
  teams = [], 
  timer, 
  isTimerRunning 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!player) return null;
  
  // Find current bidder team
  const bidderTeam = teams.find(team => team.id === currentBidder);
  
  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'batsman':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 19V7L20 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 22V17L7 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 22V17L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'bowler':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15L18 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15L6 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'allRounder':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12L11 15L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'wicketKeeper':
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 22L18 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 22V17C8 15.3431 9.34315 14 11 14H13C14.6569 14 16 15.3431 16 17V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Format role display name
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
  
  return (
    <Card variant="glass" className="overflow-hidden">
      {/* Timer bar at the top */}
      {isTimerRunning && (
        <div className="relative h-2 bg-gray-700">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-yellow-500"
            initial={{ width: '100%' }}
            animate={{ width: `${(timer / 15) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          {/* Player avatar and basic info */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-indigo-800 flex items-center justify-center text-4xl text-white font-bold">
              {player.name.charAt(0)}
            </div>
            <div className="flex items-center space-x-2 text-white px-3 py-1 rounded-full bg-indigo-800">
              <span className="text-blue-300">
                {getRoleIcon(player.role)}
              </span>
              <span className="text-sm font-medium">{formatRole(player.role)}</span>
            </div>
          </div>
          
          {/* Player details */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{player.name}</h2>
            
            <div className="mt-2 flex flex-wrap justify-center md:justify-start text-sm gap-3">
              {player.battingStyle && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-900 text-blue-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {player.battingStyle} Bat
                </span>
              )}
              
              {player.bowlingStyle && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-900 text-blue-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {player.bowlingStyle}
                </span>
              )}
              
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-900 text-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {player.stats.matches} Matches
              </span>
            </div>
            
            {/* Current bid info */}
            <div className="mt-4 flex justify-between items-center border-t border-blue-800 pt-4">
              <div>
                <p className="text-sm text-blue-300">Current Bid</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(currentBid)}</p>
                <p className="text-xs text-blue-300">Base Price: {formatCurrency(player.basePrice)}</p>
              </div>
              
              {bidderTeam && (
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-10 h-10 rounded-full" 
                    style={{ backgroundColor: bidderTeam.color }}
                  ></div>
                  <div>
                    <p className="text-sm text-blue-300">Current Bidder</p>
                    <p className="text-white font-semibold">{bidderTeam.name}</p>
                  </div>
                </div>
              )}
              
              {!bidderTeam && (
                <div>
                  <p className="text-sm text-blue-300">Waiting for bids</p>
                  <p className="text-white">{timer} seconds left</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs for player stats */}
        <div className="mt-6">
          <div className="flex border-b border-blue-800">
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'overview' ? 'text-white border-b-2 border-blue-500' : 'text-blue-300 hover:text-white'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'batting' ? 'text-white border-b-2 border-blue-500' : 'text-blue-300 hover:text-white'}`}
              onClick={() => setActiveTab('batting')}
            >
              Batting
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'bowling' ? 'text-white border-b-2 border-blue-500' : 'text-blue-300 hover:text-white'}`}
              onClick={() => setActiveTab('bowling')}
            >
              Bowling
            </button>
          </div>
          
          <div className="mt-4">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-900 bg-opacity-50 rounded-lg">
                  <p className="text-blue-300 text-xs mb-1">Matches</p>
                  <p className="text-white font-bold text-lg">{player.stats.matches}</p>
                </div>
                <div className="text-center p-3 bg-blue-900 bg-opacity-50 rounded-lg">
                  <p className="text-blue-300 text-xs mb-1">Runs</p>
                  <p className="text-white font-bold text-lg">{player.stats.runs}</p>
                </div>
                <div className="text-center p-3 bg-blue-900 bg-opacity-50 rounded-lg">
                  <p className="text-blue-300 text-xs mb-1">Bat Avg</p>
                  <p className="text-white font-bold text-lg">{player.stats.battingAverage}</p>
                </div>
                <div className="text-center p-3 bg-blue-900 bg-opacity-50 rounded-lg">
                  <p className="text-blue-300 text-xs mb-1">Wickets</p>
                  <p className="text-white font-bold text-lg">{player.stats.wickets}</p>
                </div>
                <div className="text-center p-3 bg-blue-900 bg-opacity-50 rounded-lg">
                  <p className="text-blue-300 text-xs mb-1">Economy</p>
                  <p className="text-white font-bold text-lg">{player.stats.economyRate}</p>
                </div>
                <div className="text-center p-3 bg-blue-900 bg-opacity-50 rounded-lg">
                  <p className="text-blue-300 text-xs mb-1">Strike Rate</p>
                  <p className="text-white font-bold text-lg">{player.stats.battingStrikeRate}</p>
                </div>
                <div className="text-center p-3 bg-blue-900 bg-opacity-50 rounded-lg">
                  <p className="text-blue-300 text-xs mb-1">50s/100s</p>
                  <p className="text-white font-bold text-lg">{player.stats.fifties}/{player.stats.hundreds}</p>
                </div>
                <div className="text-center p-3 bg-blue-900 bg-opacity-50 rounded-lg">
                  <p className="text-blue-300 text-xs mb-1">Best Bowl</p>
                  <p className="text-white font-bold text-lg">{player.stats.bestBowling}</p>
                </div>
              </div>
            )}
            
            {activeTab === 'batting' && (
              <div className="space-y-4">
                <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-blue-300 text-xs mb-1">Matches</p>
                      <p className="text-white font-bold text-lg">{player.stats.matches}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 text-xs mb-1">Runs</p>
                      <p className="text-white font-bold text-lg">{player.stats.runs}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 text-xs mb-1">Average</p>
                      <p className="text-white font-bold text-lg">{player.stats.battingAverage}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-blue-300 text-xs mb-1">Strike Rate</p>
                      <p className="text-white font-bold text-lg">{player.stats.battingStrikeRate}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 text-xs mb-1">Highest</p>
                      <p className="text-white font-bold text-lg">{player.stats.highestScore}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 text-xs mb-1">50s/100s</p>
                      <p className="text-white font-bold text-lg">{player.stats.fifties}/{player.stats.hundreds}</p>
                    </div>
                  </div>
                </div>
                
                {/* Batting Style Visualization */}
                <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-medium mb-2">Batting Performance</h4>
                  <div className="relative h-8 bg-blue-800 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full"
                      style={{ width: `${Math.min(player.stats.battingStrikeRate / 2, 100)}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                      Strike Rate: {player.stats.battingStrikeRate}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'bowling' && (
              <div className="space-y-4">
                <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-blue-300 text-xs mb-1">Wickets</p>
                      <p className="text-white font-bold text-lg">{player.stats.wickets}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 text-xs mb-1">Economy</p>
                      <p className="text-white font-bold text-lg">{player.stats.economyRate}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 text-xs mb-1">Average</p>
                      <p className="text-white font-bold text-lg">{player.stats.bowlingAverage}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-blue-300 text-xs mb-1">Best Bowling</p>
                      <p className="text-white font-bold text-lg">{player.stats.bestBowling}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 text-xs mb-1">Bowling Style</p>
                      <p className="text-white font-bold text-lg">{player.bowlingStyle || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Bowling Performance Visualization */}
                <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-medium mb-2">Bowling Performance</h4>
                  <div className="relative h-8 bg-blue-800 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full"
                      style={{ width: `${Math.min(100 - player.stats.economyRate * 5, 100)}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                      Economy Rate: {player.stats.economyRate}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlayerProfile;