import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTournament } from '../contexts/TournamentContext';
import { useAuction } from '../contexts/AuctionContext';
import TeamRoster from '../components/analysis/TeamRoster.jsx';
import SpendingAnalysis from '../components/analysis/SpendingAnalysis.jsx';
import TeamStrengthRating from '../components/analysis/TeamStrengthRating.jsx';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';

const Analysis = () => {
  const { tournamentId } = useParams();
  const { getTournament } = useTournament();
  const { initializeAuction, teamBalances } = useAuction();
  
  const [tournament, setTournament] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roster');
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Load tournament data
  useEffect(() => {
    const loadTournament = async () => {
      try {
        setIsLoading(true);
        const data = await getTournament(tournamentId);
        setTournament(data);
        
        // Initialize auction with tournament data (to get team balances)
        initializeAuction(data);
        
        // Set initial selected team (first team)
        if (data.teams && data.teams.length > 0) {
          setSelectedTeam(data.teams[0]);
        }
      } catch (error) {
        toast.error('Failed to load tournament data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTournament();
  }, [tournamentId, getTournament, initializeAuction]);
  
  // Handle loading state
  if (isLoading) {
    return <Loader />;
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
              <p className="text-blue-300">Post-Auction Analysis</p>
            </div>
            
            <div className="mt-4 md:mt-0 space-x-2">
              <Link to={`/matches/${tournamentId}`}>
                <Button variant="primary">
                  Match Center
                </Button>
              </Link>
              
              <Link to={`/dashboard/${tournamentId}`}>
                <Button variant="glass">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Team Selection Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-1 pb-2">
            {tournament.teams.map(team => (
              <button
                key={team.id}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  selectedTeam?.id === team.id 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-blue-900 bg-opacity-50 text-blue-300 hover:bg-opacity-70 hover:text-white'
                }`}
                onClick={() => setSelectedTeam(team)}
              >
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: team.color }}
                  ></div>
                  {team.name}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Analysis Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 pb-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'roster' 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-blue-900 bg-opacity-50 text-blue-300 hover:bg-opacity-70 hover:text-white'
              }`}
              onClick={() => setActiveTab('roster')}
            >
              Team Roster
            </button>
            
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'spending' 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-blue-900 bg-opacity-50 text-blue-300 hover:bg-opacity-70 hover:text-white'
              }`}
              onClick={() => setActiveTab('spending')}
            >
              Spending Analysis
            </button>
            
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'strength' 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-blue-900 bg-opacity-50 text-blue-300 hover:bg-opacity-70 hover:text-white'
              }`}
              onClick={() => setActiveTab('strength')}
            >
              Team Strength
            </button>
          </div>
        </div>
        
        {/* Analysis Content */}
        <motion.div
          key={`${selectedTeam?.id}-${activeTab}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {selectedTeam && (
            <>
              {activeTab === 'roster' && (
                <TeamRoster 
                  team={selectedTeam} 
                  teamBalance={teamBalances[selectedTeam.id]} 
                  players={tournament.players.filter(p => p.team === selectedTeam.id)}
                />
              )}
              
              {activeTab === 'spending' && (
                <SpendingAnalysis 
                  team={selectedTeam} 
                  teamBalance={teamBalances[selectedTeam.id]} 
                  players={tournament.players.filter(p => p.team === selectedTeam.id)}
                  teamBudget={tournament.teamBudget}
                />
              )}
              
              {activeTab === 'strength' && (
                <TeamStrengthRating 
                  team={selectedTeam} 
                  teamBalance={teamBalances[selectedTeam.id]} 
                  players={tournament.players.filter(p => p.team === selectedTeam.id)}
                  allTeams={tournament.teams}
                  allTeamBalances={teamBalances}
                />
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Analysis;