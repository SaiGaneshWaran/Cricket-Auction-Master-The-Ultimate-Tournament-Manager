import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTournament } from '../contexts/TournamentContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal.jsx';

const Tournament = () => {
  const { tournamentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getTournament, startAuction } = useTournament();
  
  const [tournament, setTournament] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCodes, setShowCodes] = useState(false);
  const [codes, setCodes] = useState({ captainCode: '', viewerCode: '' });
  const [isCreator, setIsCreator] = useState(false);
  
  // Load tournament data
  useEffect(() => {
    const loadTournament = async () => {
      try {
        setIsLoading(true);
        
        // Check if codes were passed via location state (just created tournament)
        if (location.state?.captainCode && location.state?.viewerCode) {
          setCodes({
            captainCode: location.state.captainCode,
            viewerCode: location.state.viewerCode
          });
          setShowCodes(true);
          setIsCreator(location.state.isCreator || false);
        }
        
        // Get tournament data
        const data = await getTournament(tournamentId);
        setTournament(data);
      } catch (error) {
        toast.error('Failed to load tournament data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTournament();
  }, [tournamentId, location, getTournament]);
  
  // Handle start auction
  const handleStartAuction = async () => {
    try {
      await startAuction(tournamentId);
      toast.success('Auction started successfully');
      navigate(`/auction/${tournamentId}`, { state: { isOrganizer: true } });
    } catch (error) {
      toast.error('Failed to start auction');
      console.error(error);
    }
  };
  
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
              <p className="text-blue-300">Tournament Home</p>
            </div>
            
            <div className="mt-4 md:mt-0 space-x-2">
              {tournament.status === 'pre-auction' && isCreator && (
                <Button 
                  variant="primary"
                  onClick={handleStartAuction}
                >
                  Start Auction
                </Button>
              )}
              
              {tournament.status === 'auction' && (
                <Link to={`/auction/${tournamentId}`}>
                  <Button variant="primary">
                    Join Auction
                  </Button>
                </Link>
              )}
              
              {tournament.status !== 'pre-auction' && (
                <Link to={`/dashboard/${tournamentId}`}>
                  <Button variant="glass">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Codes Modal */}
        <Modal
          isOpen={showCodes}
          onClose={() => setShowCodes(false)}
          title="Tournament Access Codes"
        >
          <div className="space-y-6">
            <p className="text-blue-300">
              Save these codes to access the tournament. You will need them to join from different devices.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Captain Code (For Team Owners)</label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={codes.captainCode}
                    className="w-full px-4 py-3 bg-slate-800 rounded-l-lg border border-r-0 border-blue-900 text-white"
                  />
                  <button
                    className="px-4 py-2 bg-blue-700 rounded-r-lg text-white"
                    onClick={() => {
                      navigator.clipboard.writeText(codes.captainCode);
                      toast.success('Captain code copied to clipboard');
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Viewer Code (For Spectators)</label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={codes.viewerCode}
                    className="w-full px-4 py-3 bg-slate-800 rounded-l-lg border border-r-0 border-blue-900 text-white"
                  />
                  <button
                    className="px-4 py-2 bg-blue-700 rounded-r-lg text-white"
                    onClick={() => {
                      navigator.clipboard.writeText(codes.viewerCode);
                      toast.success('Viewer code copied to clipboard');
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                <span className="font-bold">Important:</span> These codes will only be shown once. Please save them in a secure location.
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setShowCodes(false)}>
                I've Saved The Codes
              </Button>
            </div>
          </div>
        </Modal>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tournament Info */}
          <div className="md:col-span-2">
            <Card variant="glass" className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Tournament Information</h2>
              
              <div className="space-y-6">
                {/* Status Card */}
                <div className="bg-indigo-900 bg-opacity-40 rounded-lg p-4 flex flex-col md:flex-row justify-between">
                  <div>
                    <p className="text-blue-300 text-sm">Tournament Status</p>
                    <p className="text-lg font-bold text-white capitalize">{tournament.status.replace('-', ' ')}</p>
                  </div>
                  
                  <div className="mt-2 md:mt-0">
                    <p className="text-blue-300 text-sm">Created On</p>
                    <p className="text-white">
                      {new Date(tournament.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {isCreator && (
                    <div className="mt-2 md:mt-0">
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => setShowCodes(true)}
                      >
                        View Access Codes
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Tournament Details */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-900 bg-opacity-40 p-3 rounded-lg">
                      <p className="text-xs text-blue-300 mb-1">Teams</p>
                      <p className="text-xl font-bold text-white">{tournament.teams.length}</p>
                    </div>
                    
                    <div className="bg-blue-900 bg-opacity-40 p-3 rounded-lg">
                      <p className="text-xs text-blue-300 mb-1">Players</p>
                      <p className="text-xl font-bold text-white">{tournament.players.length}</p>
                    </div>
                    
                    <div className="bg-blue-900 bg-opacity-40 p-3 rounded-lg">
                      <p className="text-xs text-blue-300 mb-1">Team Budget</p>
                      <p className="text-xl font-bold text-white">{tournament.teamBudget} Cr</p>
                    </div>
                  </div>
                </div>
                
                {/* Teams */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Teams</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {tournament.teams.map(team => (
                      <motion.div
                        key={team.id}
                        className="bg-blue-900 bg-opacity-40 p-3 rounded-lg"
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <div className="flex items-center mb-2">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: team.color }}
                          >
                            {team.name.charAt(0)}
                          </div>
                          <h4 className="ml-2 font-medium text-white">{team.name}</h4>
                        </div>
                        <div className="text-xs text-blue-300">
                          <div className="flex justify-between mb-1">
                            <span>Players:</span>
                            <span className="text-white">{
                              tournament.status !== 'pre-auction' 
                                ? team.players?.length || 0
                                : `${team.slots?.batsmen || 0} + ${team.slots?.bowlers || 0} + ${team.slots?.allRounders || 0} + ${team.slots?.wicketKeepers || 0} slots`
                            }</span>
                          </div>
                          {tournament.status !== 'pre-auction' && (
                            <div className="flex justify-between">
                              <span>Budget Spent:</span>
                              <span className="text-white">{team.spent || 0} Cr</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div>
            {/* Tournament Actions */}
            <Card variant="primary" className="p-4 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
              
              <div className="space-y-3">
                {tournament.status === 'pre-auction' && isCreator && (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleStartAuction}
                  >
                    Start Auction
                  </Button>
                )}
                
                {tournament.status === 'auction' && (
                  <Link to={`/auction/${tournamentId}`} className="block">
                    <Button variant="primary" fullWidth>
                      Join Auction
                    </Button>
                  </Link>
                )}
                
                {tournament.status === 'post-auction' && (
                  <Link to={`/matches/${tournamentId}`} className="block">
                    <Button variant="primary" fullWidth>
                      Match Center
                    </Button>
                  </Link>
                )}
                
                {tournament.status !== 'pre-auction' && (
                  <Link to={`/dashboard/${tournamentId}`} className="block">
                    <Button variant="secondary" fullWidth>
                      Tournament Dashboard
                    </Button>
                  </Link>
                )}
                
                {isCreator && (
                  <Button
                    variant="glass"
                    fullWidth
                    onClick={() => setShowCodes(true)}
                  >
                    View Access Codes
                  </Button>
                )}
                
                <Link to="/" className="block">
                  <Button variant="glass" fullWidth>
                    Back to Home
                  </Button>
                </Link>
              </div>
            </Card>
            
            {/* Next Steps */}
            <Card variant="glass" className="p-4">
              <h3 className="text-lg font-bold text-white mb-4">Next Steps</h3>
              
              <div className="space-y-3">
                {tournament.status === 'pre-auction' && (
                  <>
                    <div className="flex items-start">
                      <div className="bg-blue-800 p-1 rounded-full mr-2 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">Share Access Codes</p>
                        <p className="text-sm text-blue-300">Distribute the captain and viewer codes to participants.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-800 p-1 rounded-full mr-2 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">Start the Auction</p>
                        <p className="text-sm text-blue-300">Begin the bidding process once everyone is ready.</p>
                      </div>
                    </div>
                  </>
                )}
                
                {tournament.status === 'auction' && (
                  <>
                    <div className="flex items-start">
                      <div className="bg-blue-800 p-1 rounded-full mr-2 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">Join the Auction</p>
                        <p className="text-sm text-blue-300">Participate in the auction to build your team.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-800 p-1 rounded-full mr-2 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">Bid for Players</p>
                        <p className="text-sm text-blue-300">Strategically bid within your budget to acquire players.</p>
                      </div>
                    </div>
                  </>
                )}
                
                {tournament.status === 'post-auction' && (
                  <>
                    <div className="flex items-start">
                      <div className="bg-blue-800 p-1 rounded-full mr-2 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">Create Matches</p>
                        <p className="text-sm text-blue-300">Schedule matches between teams to start the tournament.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-800 p-1 rounded-full mr-2 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">Simulate Matches</p>
                        <p className="text-sm text-blue-300">Run match simulations to determine the winners.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tournament;