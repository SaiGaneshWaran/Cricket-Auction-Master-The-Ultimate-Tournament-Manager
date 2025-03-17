import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuction } from '../contexts/AuctionContext';
import { useTournament } from '../contexts/TournamentContext';
import { useMatch } from '../contexts/MatchContext';
import PointsTable from '../components/dashboard/PointsTable';
import PerformanceLeaderboard from "../components/dashboard/PerformanceLeaderboard.jsx";
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

// Error boundary component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white">
      <p className="text-lg font-bold mb-2">Something went wrong</p>
      <p className="text-sm mb-4 text-red-200">{error.message || 'Unknown error'}</p>
      <button 
        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm"
        onClick={resetErrorBoundary}
      >
        Try again
      </button>
    </div>
  );
};

// Memoized sub-components to reduce re-renders
const MatchItem = React.memo(({ match, tournamentId }) => {
  const team1Won = match.winnerId === match.team1.id;
  const team2Won = match.winnerId === match.team2.id;
  
  return (
    <Link key={match.id} to={`/matches/${tournamentId}`}>
      <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg hover:bg-opacity-50 transition-all cursor-pointer">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <div className="flex items-center mb-2 sm:mb-0">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${team1Won ? 'ring-2 ring-yellow-500' : ''}`}
              style={{ backgroundColor: match.team1.color }}
            >
              {match.team1.name.substring(0, 1)}
            </div>
            <div>
              <span className={`font-medium ${team1Won ? 'text-white' : 'text-blue-300'}`}>{match.team1.name}</span>
              {match.team1.score !== undefined && (
                <span className="ml-2 text-white">{match.team1.score}/{match.team1.wickets}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-center px-3 py-1 rounded-full bg-blue-900 text-blue-300 text-xs mx-2">
            vs
          </div>
          
          <div className="flex items-center">
            <div>
              <span className={`font-medium ${team2Won ? 'text-white' : 'text-blue-300'}`}>{match.team2.name}</span>
              {match.team2.score !== undefined && (
                <span className="ml-2 text-white">{match.team2.score}/{match.team2.wickets}</span>
              )}
            </div>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ml-2 ${team2Won ? 'ring-2 ring-yellow-500' : ''}`}
              style={{ backgroundColor: match.team2.color }}
            >
              {match.team2.name.substring(0, 1)}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-between text-xs">
          <span className="text-blue-300">{new Date(match.date).toLocaleDateString()}</span>
          {match.winnerId ? (
            <span className="text-green-400">
              {match.winnerId === match.team1.id 
                ? `${match.team1.name} won by ${match.team1.score - match.team2.score} runs` 
                : `${match.team2.name} won by ${10 - match.team2.wickets} wickets`}
            </span>
          ) : match.status === 'completed' ? (
            <span className="text-yellow-400">Match Tied</span>
          ) : (
            <span className="text-blue-300">Scheduled</span>
          )}
        </div>
      </div>
    </Link>
  );
});

const TournamentSummary = React.memo(({ tournament, matchSchedule, completedMatches }) => {
  return (
    <Card variant="glass" className="mb-6">
      <div className="p-4 border-b border-blue-800">
        <h3 className="text-lg font-bold text-white">Tournament Summary</h3>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg">
            <p className="text-xs text-blue-300 mb-1">Teams</p>
            <p className="text-xl font-bold text-white">{tournament.teams.length}</p>
          </div>
          
          <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg">
            <p className="text-xs text-blue-300 mb-1">Matches</p>
            <p className="text-xl font-bold text-white">{matchSchedule.length + completedMatches.length}</p>
          </div>
          
          <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg">
            <p className="text-xs text-blue-300 mb-1">Completed</p>
            <p className="text-xl font-bold text-white">{completedMatches.length}</p>
          </div>
          
          <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg">
            <p className="text-xs text-blue-300 mb-1">Players</p>
            <p className="text-xl font-bold text-white">{tournament.players?.length || 0}</p>
          </div>
        </div>
        
        <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg">
          <p className="text-xs text-blue-300 mb-1">Status</p>
          <p className="text-lg font-bold text-white capitalize">{tournament.status || 'Active'}</p>
        </div>
        
        {/* Next match */}
        {matchSchedule.length > 0 && (
          <div>
            <p className="text-sm text-blue-300 mb-2">Next Match</p>
            <MatchItem match={matchSchedule[0]} tournamentId={tournament.id} />
          </div>
        )}
      </div>
    </Card>
  );
});

// Main Dashboard Component
const Dashboard = () => {
  const { tournamentId } = useParams();
  const { getTournament } = useTournament();
  const { 
    initializeMatchState, 
    pointsTable = [], 
    performanceStats = { 
      mostRuns: [], 
      mostWickets: [] 
    }, 
    matchSchedule = [], 
    completedMatches = [] 
  } = useMatch();
  
  const [tournament, setTournament] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  
  // Load tournament data
  useEffect(() => {
    const loadTournament = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getTournament(tournamentId);
        
        if (!data) {
          throw new Error('Tournament not found');
        }
        
        setTournament(data);
        
        // Initialize match state
        if (initializeMatchState) {
          initializeMatchState(data);
        }
      } catch (error) {
        console.error('Failed to load tournament data:', error);
        setError(error.message || 'Failed to load tournament data');
        toast.error('Failed to load tournament data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (tournamentId) {
      loadTournament();
    }
  }, [tournamentId, getTournament, initializeMatchState]);
  
  // Handle loading state
  if (isLoading) {
    return <Loading message="Loading tournament data..." />;
  }
  
  // Handle error state
  if (error || !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="glass" className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Tournament Not Found</h2>
          <p className="text-blue-300 mb-6">{error || "We couldn't find the tournament you're looking for."}</p>
          <Link to="/">
            <Button variant="primary">Go to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{tournament.name}</h1>
              <p className="text-blue-300">Tournament Dashboard</p>
            </div>
            
            <div className="mt-4 md:mt-0 space-x-2">
              <Link to={`/matches/${tournamentId}`}>
                <Button variant="primary">
                  Match Center
                </Button>
              </Link>
              <Link to={`/tournament/${tournamentId}`}>
                <Button variant="glass">
                  Tournament Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Dashboard Tabs */}
        <div className="mb-6 flex overflow-x-auto space-x-1 pb-2">
          {['overview', 'standings', 'stats', 'schedule'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === tab 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-blue-900 bg-opacity-50 text-blue-300 hover:bg-opacity-70 hover:text-white'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Dashboard Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <PointsTable pointsTable={pointsTable} />
              </div>
              
              <div>
                <TournamentSummary 
                  tournament={tournament}
                  matchSchedule={matchSchedule}
                  completedMatches={completedMatches}
                />
                
                {/* Top Performers */}
                {performanceStats.mostRuns.length > 0 && (
                  <Card variant="glass">
                    <div className="p-4 border-b border-blue-800">
                      <h3 className="text-lg font-bold text-white">Top Performers</h3>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <div>
                        <p className="text-xs text-blue-300 mb-2">Top Batsman</p>
                        <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center text-sm font-bold mr-3">
                                {performanceStats.mostRuns[0]?.playerName?.charAt(0) || 'P'}
                              </div>
                              <div>
                                <p className="text-white font-medium">{performanceStats.mostRuns[0]?.playerName || 'No data'}</p>
                                {performanceStats.mostRuns[0]?.teamName && (
                                  <div className="flex items-center text-xs text-blue-300">
                                    <div 
                                      className="w-2 h-2 rounded-full mr-1"
                                      style={{ backgroundColor: performanceStats.mostRuns[0]?.teamColor }}
                                    ></div>
                                    <span>{performanceStats.mostRuns[0]?.teamName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-white">{performanceStats.mostRuns[0]?.runs || 0}</p>
                              <p className="text-xs text-blue-300">runs</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {performanceStats.mostWickets.length > 0 && (
                        <div>
                          <p className="text-xs text-blue-300 mb-2">Top Bowler</p>
                          <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center text-sm font-bold mr-3">
                                  {performanceStats.mostWickets[0]?.playerName?.charAt(0) || 'P'}
                                </div>
                                <div>
                                  <p className="text-white font-medium">{performanceStats.mostWickets[0]?.playerName || 'No data'}</p>
                                  {performanceStats.mostWickets[0]?.teamName && (
                                    <div className="flex items-center text-xs text-blue-300">
                                      <div 
                                        className="w-2 h-2 rounded-full mr-1"
                                        style={{ backgroundColor: performanceStats.mostWickets[0]?.teamColor }}
                                      ></div>
                                      <span>{performanceStats.mostWickets[0]?.teamName}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-white">{performanceStats.mostWickets[0]?.wickets || 0}</p>
                                <p className="text-xs text-blue-300">wickets</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          {/* Standings Tab */}
          {activeTab === 'standings' && (
            <PointsTable pointsTable={pointsTable} />
          )}
          
          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <PerformanceLeaderboard performanceStats={performanceStats} />
          )}
          
          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <Card variant="glass">
              <div className="p-4 border-b border-blue-800">
                <h3 className="text-lg font-bold text-white">Match Schedule</h3>
              </div>
              
              <div className="divide-y divide-blue-800">
                {/* Upcoming Matches */}
                {matchSchedule.length > 0 && (
                  <div className="p-4">
                    <h4 className="text-md font-semibold text-blue-300 mb-4">Upcoming Matches</h4>
                    <div className="space-y-3">
                      {matchSchedule.map(match => (
                        <MatchItem key={match.id} match={match} tournamentId={tournamentId} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Completed Matches */}
                {completedMatches.length > 0 && (
                  <div className="p-4">
                    <h4 className="text-md font-semibold text-blue-300 mb-4">Completed Matches</h4>
                    <div className="space-y-3">
                      {completedMatches.map(match => (
                        <MatchItem key={match.id} match={match} tournamentId={tournamentId} />
                      ))}
                    </div>
                  </div>
                )}
                
                {matchSchedule.length === 0 && completedMatches.length === 0 && (
                  <div className="p-6 text-center">
                    <p className="text-blue-300">No matches scheduled yet.</p>
                    <p className="text-sm text-blue-400 mt-2">Matches will appear here once they are scheduled.</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;