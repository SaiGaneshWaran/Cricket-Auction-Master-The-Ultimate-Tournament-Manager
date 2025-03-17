import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTournament } from '../contexts/TournamentContext';
import { useMatch } from '../contexts/MatchContext';
import LiveScoreboard from '../components/match/LiveScoreboard';
import CommentaryFeed from '../components/match/CommentaryFeed';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Matches = () => {
  const { tournamentId } = useParams();
  const { getTournament } = useTournament();
  const { 
    initializeMatchState, 
    currentMatch, 
    isMatchLive, 
    matchSchedule, 
    completedMatches,
    createMatch,
    startMatch,
    simulateBall,
    toggleAutoSimulation,
    setSimulationSpeed,
    toggleSimulationPause,
    autoSimulation,
    isSimulationPaused,
    matchSimulationSpeed
  } = useMatch();
  
  const [tournament, setTournament] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState({ team1: '', team2: '' });
  const [view, setView] = useState('schedule'); // 'schedule', 'live', 'create'
  
  // Load tournament data
  useEffect(() => {
    const loadTournament = async () => {
      try {
        setIsLoading(true);
        const data = await getTournament(tournamentId);
        setTournament(data);
        
        // Initialize match state
        initializeMatchState(data);
        
        // If there's a live match, set view to 'live'
        if (isMatchLive) {
          setView('live');
        }
      } catch (error) {
        toast.error('Failed to load tournament data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTournament();
  }, [tournamentId, getTournament, initializeMatchState, isMatchLive]);
  
  // Handle team selection
  const handleTeamSelect = (type, teamId) => {
    setSelectedTeams(prev => ({
      ...prev,
      [type]: teamId
    }));
  };
  
  // Handle match creation
  const handleCreateMatch = async () => {
    if (selectedTeams.team1 === selectedTeams.team2) {
      toast.error('Please select different teams');
      return;
    }
    
    try {
      await createMatch(tournamentId, selectedTeams.team1, selectedTeams.team2);
      toast.success('Match created successfully');
      setIsCreatingMatch(false);
      setSelectedTeams({ team1: '', team2: '' });
      setView('schedule');
    } catch (error) {
      toast.error('Failed to create match');
      console.error(error);
    }
  };
  
  // Handle match start
  const handleStartMatch = async (matchId) => {
    try {
      await startMatch(tournamentId, matchId);
      setView('live');
    } catch (error) {
      toast.error('Failed to start match');
      console.error(error);
    }
  };
  
  // Handle manual ball simulation
  const handleSimulateBall = async () => {
    try {
      await simulateBall();
    } catch (error) {
      toast.error('Failed to simulate ball');
      console.error(error);
    }
  };
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Handle error state
  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="glass" className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Tournament Not Found</h2>
          <p className="text-blue-300 mb-6">We couldn't find the tournament you're looking for.</p>
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
              <p className="text-blue-300">Match Center</p>
            </div>
            
            <div className="mt-4 md:mt-0 space-x-2">
              <Link to={`/dashboard/${tournamentId}`}>
                <Button variant="glass">
                  Dashboard
                </Button>
              </Link>
              
              {view !== 'create' && (
                <Button variant="primary" onClick={() => setIsCreatingMatch(true)}>
                  Create Match
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Match Center Tabs */}
        <div className="mb-6 flex overflow-x-auto space-x-1 pb-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'schedule' 
                ? 'bg-blue-700 text-white' 
                : 'bg-blue-900 bg-opacity-50 text-blue-300 hover:bg-opacity-70 hover:text-white'
            }`}
            onClick={() => setView('schedule')}
          >
            Match Schedule
          </button>
          
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'live' 
                ? 'bg-blue-700 text-white' 
                : 'bg-blue-900 bg-opacity-50 text-blue-300 hover:bg-opacity-70 hover:text-white'
            }`}
            onClick={() => setView('live')}
            disabled={!isMatchLive}
          >
            Live Match
            {isMatchLive && (
              <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </button>
          
          {isCreatingMatch && (
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                view === 'create' 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-blue-900 bg-opacity-50 text-blue-300 hover:bg-opacity-70 hover:text-white'
              }`}
              onClick={() => setView('create')}
            >
              Create Match
            </button>
          )}
        </div>
        
        {/* Match Center Content */}
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Schedule View */}
          {view === 'schedule' && (
            <Card variant="glass">
              <div className="p-4 border-b border-blue-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Match Schedule</h3>
                
                {tournament.status === 'post-auction' && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => {
                      setIsCreatingMatch(true);
                      setView('create');
                    }}
                  >
                    Create Match
                  </Button>
                )}
              </div>
              
              <div className="divide-y divide-blue-800">
                {/* Upcoming Matches */}
                {matchSchedule.length > 0 && (
                  <div className="p-4">
                    <h4 className="text-md font-semibold text-blue-300 mb-4">Upcoming Matches</h4>
                    <div className="space-y-3">
                      {matchSchedule.map(match => (
                        <div key={match.id} className="bg-blue-900 bg-opacity-30 p-3 rounded-lg">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                            <div className="flex items-center mb-2 sm:mb-0">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-2"
                                style={{ backgroundColor: match.team1.color }}
                              >
                                {match.team1.name.charAt(0)}
                              </div>
                              <span className="text-white font-medium">{match.team1.name}</span>
                            </div>
                            
                            <div className="flex items-center justify-center px-3 py-1 rounded-full bg-blue-900 text-blue-300 text-xs mx-2">
                              vs
                            </div>
                            
                            <div className="flex items-center">
                              <span className="text-white font-medium mr-2">{match.team2.name}</span>
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: match.team2.color }}
                              >
                                {match.team2.name.charAt(0)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap justify-between text-xs mb-3">
                            <span className="text-blue-300">{new Date(match.date).toLocaleDateString()} | {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-blue-300">{match.venue || 'Home Ground'}</span>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={() => handleStartMatch(match.id)}
                            >
                              Start Match
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Completed Matches */}
                {completedMatches.length > 0 && (
                  <div className="p-4">
                    <h4 className="text-md font-semibold text-blue-300 mb-4">Completed Matches</h4>
                    <div className="space-y-3">
                      {completedMatches.map(match => {
                        const team1Won = match.winnerId === match.team1.id;
                        const team2Won = match.winnerId === match.team2.id;
                        
                        return (
                          <div key={match.id} className="bg-blue-900 bg-opacity-30 p-3 rounded-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                              <div className="flex items-center mb-2 sm:mb-0">
                                <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${team1Won ? 'ring-2 ring-yellow-500' : ''}`}
                                  style={{ backgroundColor: match.team1.color }}
                                >
                                  {match.team1.name.charAt(0)}
                                </div>
                                <div>
                                  <span className={`font-medium ${team1Won ? 'text-white' : 'text-blue-300'}`}>{match.team1.name}</span>
                                  <span className="ml-2 text-white">{match.team1.score}/{match.team1.wickets}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-center px-3 py-1 rounded-full bg-blue-900 text-blue-300 text-xs mx-2">
                                vs
                              </div>
                              
                              <div className="flex items-center">
                                <div>
                                  <span className={`font-medium ${team2Won ? 'text-white' : 'text-blue-300'}`}>{match.team2.name}</span>
                                  <span className="ml-2 text-white">{match.team2.score}/{match.team2.wickets}</span>
                                </div>
                                <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ml-2 ${team2Won ? 'ring-2 ring-yellow-500' : ''}`}
                                  style={{ backgroundColor: match.team2.color }}
                                >
                                  {match.team2.name.charAt(0)}
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
                              ) : (
                                <span className="text-yellow-400">Match Tied</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {matchSchedule.length === 0 && completedMatches.length === 0 && (
                  <div className="p-6 text-center">
                    <p className="text-blue-300">No matches scheduled yet.</p>
                    <p className="text-sm text-blue-400 mt-2">Create a match to get started.</p>
                    <div className="mt-4">
                      <Button 
                        variant="primary"
                        onClick={() => {
                          setIsCreatingMatch(true);
                          setView('create');
                        }}
                      >
                        Create Your First Match
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
          
          {/* Live Match View */}
          {view === 'live' && (
            <>
              {isMatchLive && currentMatch ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Scoreboard and Controls */}
                  <div className="lg:col-span-2 space-y-6">
                    <LiveScoreboard match={currentMatch} />
                    
                    {/* Match Controls */}
                    <Card variant="glass" className="p-4">
                      <h3 className="text-lg font-bold text-white mb-4">Match Controls</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-blue-300">Auto Simulation:</span>
                            <div 
                              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${autoSimulation ? 'bg-green-600' : 'bg-gray-700'}`}
                              onClick={() => toggleAutoSimulation()}
                            >
                              <div 
                                className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${autoSimulation ? 'translate-x-6' : ''}`}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-blue-300">Pause Simulation:</span>
                            <div 
                              className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isSimulationPaused ? 'bg-yellow-600' : 'bg-gray-700'}`}
                              onClick={() => toggleSimulationPause()}
                            >
                              <div 
                                className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 transform ${isSimulationPaused ? 'translate-x-6' : ''}`}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-blue-300">Simulation Speed:</span>
                            <div className="flex space-x-2">
                              <button 
                                className={`px-3 py-1 rounded-md text-xs font-medium ${matchSimulationSpeed === 0.5 ? 'bg-blue-600 text-white' : 'bg-blue-900 text-blue-300'}`}
                                onClick={() => setSimulationSpeed(0.5)}
                              >
                                Slow
                              </button>
                              <button 
                                className={`px-3 py-1 rounded-md text-xs font-medium ${matchSimulationSpeed === 1 ? 'bg-blue-600 text-white' : 'bg-blue-900 text-blue-300'}`}
                                onClick={() => setSimulationSpeed(1)}
                              >
                                Normal
                              </button>
                              <button 
                                className={`px-3 py-1 rounded-md text-xs font-medium ${matchSimulationSpeed === 2 ? 'bg-blue-600 text-white' : 'bg-blue-900 text-blue-300'}`}
                                onClick={() => setSimulationSpeed(2)}
                              >
                                Fast
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center">
                          <Button 
                            variant="primary" 
                            size="lg"
                            onClick={handleSimulateBall}
                            disabled={autoSimulation && !isSimulationPaused}
                          >
                            Simulate Ball
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  {/* Commentary Feed */}
                  <div>
                    <CommentaryFeed commentary={currentMatch.commentary} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Card variant="glass" className="p-8">
                    <h3 className="text-xl font-bold text-white mb-4">No Live Match</h3>
                    <p className="text-blue-300 mb-6">There is no match currently in progress.</p>
                    <Button 
                      variant="primary"
                      onClick={() => setView('schedule')}
                    >
                      View Match Schedule
                    </Button>
                  </Card>
                </div>
              )}
            </>
          )}
          
          {/* Create Match View */}
          {view === 'create' && (
            <Card variant="glass">
              <div className="p-4 border-b border-blue-800">
                <h3 className="text-lg font-bold text-white">Create New Match</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Team 1 Selection */}
                  <div>
                    <h4 className="text-md font-semibold text-blue-300 mb-4">Select Team 1</h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                      {tournament.teams.map(team => (
                        <div 
                          key={`team1_${team.id}`}
                          className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 flex items-center ${
                            selectedTeams.team1 === team.id 
                              ? 'bg-blue-700' 
                              : 'bg-blue-900 bg-opacity-40 hover:bg-opacity-60'
                          } ${selectedTeams.team2 === team.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => {
                            if (selectedTeams.team2 !== team.id) {
                              handleTeamSelect('team1', team.id);
                            }
                          }}
                        >
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
                            style={{ backgroundColor: team.color }}
                          >
                            {team.name.charAt(0)}
                          </div>
                          <span className="text-white font-medium">{team.name}</span>
                          
                          {selectedTeams.team1 === team.id && (
                            <div className="ml-auto">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Team 2 Selection */}
                  <div>
                    <h4 className="text-md font-semibold text-blue-300 mb-4">Select Team 2</h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                      {tournament.teams.map(team => (
                        <div 
                          key={`team2_${team.id}`}
                          className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 flex items-center ${
                            selectedTeams.team2 === team.id 
                              ? 'bg-blue-700' 
                              : 'bg-blue-900 bg-opacity-40 hover:bg-opacity-60'
                          } ${selectedTeams.team1 === team.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => {
                            if (selectedTeams.team1 !== team.id) {
                              handleTeamSelect('team2', team.id);
                            }
                          }}
                        >
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
                            style={{ backgroundColor: team.color }}
                          >
                            {team.name.charAt(0)}
                          </div>
                          <span className="text-white font-medium">{team.name}</span>
                          
                          {selectedTeams.team2 === team.id && (
                            <div className="ml-auto">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex space-x-3 justify-end">
                  <Button 
                    variant="glass" 
                    onClick={() => {
                      setIsCreatingMatch(false);
                      setSelectedTeams({ team1: '', team2: '' });
                      setView('schedule');
                    }}
                  >
                    Cancel
                  </Button>
                  
                  <Button 
                    variant="primary"
                    onClick={handleCreateMatch}
                    disabled={!selectedTeams.team1 || !selectedTeams.team2}
                  >
                    Create Match
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Matches;