import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTournament } from '../../contexts/TournamentContext';
import { useAuction } from '../../contexts/AuctionContext';
import PlayerProfile from './PlayerProfile';
import TeamBalanceCard from './TeamBalanceCard';
import OtherTeamsTable from './OtherTeamsTable';
import BiddingControls from './BiddingControls.jsx';
import AuctionHistory from './AuctionHistory.jsx';
import WaitingLobby from './WaitingLobby';
import Button from '../common/Button';
import Card from '../common/Card';

const AuctionRoom = () => {
  const { auctionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getTournament } = useTournament();
  const { 
    initializeAuction,
    currentAuction,
    currentPlayer,
    currentBid,
    currentBidder,
    timer,
    isTimerRunning,
    auctionHistory,
    teamBalances,
    isAuctionActive, 
    startAuction,
    placeBid,
    completeBid,
    skipPlayer
  } = useAuction();
  
  const [tournamentData, setTournamentData] = useState(null);
  const [isCaptain, setIsCaptain] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allCaptainsJoined, setAllCaptainsJoined] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const loadAuction = async () => {
      try {
        setIsLoading(true);
        
        // Get data from location state or fetch from API
        if (location.state?.tournamentData) {
          setTournamentData(location.state.tournamentData);
          setIsCaptain(location.state.isCaptain || false);
          setIsOrganizer(location.state.isOrganizer || false);
          
          // Initialize auction with tournament data
          initializeAuction(location.state.tournamentData);
        } else {
          // Fetch tournament data
          const tournament = await getTournament(auctionId);
          setTournamentData(tournament);
          setIsOrganizer(false);
          
          // Initialize auction with tournament data
          initializeAuction(tournament);
        }
      } catch (error) {
        console.error('Error loading auction:', error);
        toast.error('Failed to load auction. Please try again.');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAuction();
  }, [auctionId, location, navigate, getTournament, initializeAuction]);

  // Check if all captains have joined
  useEffect(() => {
    if (tournamentData && tournamentData.teams && tournamentData.connectedUsers) {
      const captainsJoined = tournamentData.connectedUsers.filter(u => u.role === 'captain').length;
      setAllCaptainsJoined(captainsJoined === tournamentData.teams.length);
    }
  }, [tournamentData]);

  // Effect to play sounds
  useEffect(() => {
    if (!soundEnabled) return;
    
    // Play sounds based on events
    const playSound = (audioFile) => {
      const audio = new Audio(`/sounds/${audioFile}`);
      audio.play().catch(e => console.error('Error playing sound:', e));
    };
    
    // Play timer sound when timer is low
    if (isTimerRunning && timer <= 5 && timer > 0) {
      playSound('timer-tick.mp3');
    }
    
    // Play bid sound when new bid is placed
    if (auctionHistory.length > 0 && !showConfetti) {
      // Check if this is a new bid (not on component mount)
      const lastBid = auctionHistory[auctionHistory.length - 1];
      const timestamp = new Date(lastBid.timestamp).getTime();
      const now = new Date().getTime();
      
      if (now - timestamp < 3000) { // Bid in the last 3 seconds
        playSound('bid-placed.mp3');
      }
    }
    
    // Play confetti sound when player is sold
    if (showConfetti) {
      playSound('player-sold.mp3');
    }
  }, [timer, isTimerRunning, auctionHistory, showConfetti, soundEnabled]);

  // Handle bidding
  const handlePlaceBid = async () => {
    if (!isCaptain || !selectedTeam) return;
    
    try {
      const bidAmount = currentBid + Math.ceil(currentBid * 0.04); // 4% increment
      await placeBid(selectedTeam.id, bidAmount);
    } catch (error) {
      toast.error(error.message || 'Failed to place bid');
    }
  };

  // Handle auction start
  const handleStartAuction = async () => {
    if (!isOrganizer) return;
    
    try {
      await startAuction(auctionId);
      toast.success('Auction started!');
    } catch (error) {
      toast.error('Failed to start auction: ' + error.message);
    }
  };

  // Handle player sold (complete bid)
  const handlePlayerSold = async () => {
    if (!isOrganizer) return;
    
    try {
      setShowConfetti(true);
      await completeBid();
      
      // Hide confetti after a delay
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    } catch (error) {
      setShowConfetti(false);
      toast.error('Failed to complete bid: ' + error.message);
    }
  };

  // Handle player skip
  const handleSkipPlayer = async () => {
    if (!isOrganizer) return;
    
    try {
      await skipPlayer();
      toast.info('Player skipped');
    } catch (error) {
      toast.error('Failed to skip player: ' + error.message);
    }
  };

  // Handle team selection
  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setIsCaptain(true);
  };

  // If still loading, show loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If auction hasn't started yet, show the waiting lobby
  if (!isAuctionActive) {
    return (
      <WaitingLobby
        tournamentData={tournamentData}
        isOrganizer={isOrganizer}
        onStartAuction={handleStartAuction}
        onTeamSelect={handleTeamSelect}
        allCaptainsJoined={allCaptainsJoined}
        isCaptain={isCaptain}
        selectedTeam={selectedTeam}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4">
      {/* Confetti effect when player is sold */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            {/* We would implement confetti animation here */}
            {Array.from({ length: 150 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-6"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -20,
                  rotate: Math.random() * 360,
                  backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
                }}
                animate={{
                  y: window.innerHeight + 20,
                  rotate: Math.random() * 360 + 360
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  ease: "linear"
                }}
                style={{
                  width: Math.random() * 10 + 5 + 'px',
                  height: Math.random() * 20 + 10 + 'px',
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left column - Team Balance and Other Teams */}
          <div className="lg:w-1/4 space-y-4">
            {/* Team Balance Card */}
            {selectedTeam && (
              <TeamBalanceCard
                team={selectedTeam}
                teamBalance={teamBalances[selectedTeam.id]}
              />
            )}
            
            {/* Other Teams Table */}
            <OtherTeamsTable
              teams={tournamentData?.teams || []}
              teamBalances={teamBalances}
              currentTeam={selectedTeam}
              currentBidder={currentBidder}
            />
          </div>
          
          {/* Center column - Current Player and Bidding */}
          <div className="lg:w-2/4 space-y-4">
            {/* Auction Header */}
            <Card variant="glass" className="p-4">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">
                  {tournamentData?.name || 'Cricket Auction'}
                </h1>
                <div className="flex space-x-2">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    icon={
                      soundEnabled ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )
                    }
                  />
                  {isOrganizer && (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleSkipPlayer}
                      >
                        Skip Player
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={handlePlayerSold}
                      >
                        Sold!
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
            
            {/* Current Player Profile */}
            <AnimatePresence mode="wait">
              {currentPlayer ? (
                <motion.div
                  key={currentPlayer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PlayerProfile
                    player={currentPlayer}
                    currentBid={currentBid}
                    currentBidder={currentBidder}
                    teams={tournamentData?.teams || []}
                    timer={timer}
                    isTimerRunning={isTimerRunning}
                  />
                </motion.div>
              ) : (
                <Card variant="glass" className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-4">No Player Available</h3>
                    <p className="text-blue-200">The auction has ended or no player is currently being auctioned.</p>
                  </div>
                </Card>
              )}
            </AnimatePresence>
            
            {/* Bidding Controls */}
            {currentPlayer && selectedTeam && (
              <BiddingControls
                currentBid={currentBid}
                currentBidder={currentBidder}
                teamId={selectedTeam.id}
                teamBalance={teamBalances[selectedTeam.id]}
                onPlaceBid={handlePlaceBid}
                disabled={!isCaptain || currentBidder === selectedTeam.id}
              />
            )}
          </div>
          
          {/* Right column - Auction History */}
          <div className="lg:w-1/4 space-y-4">
            <AuctionHistory
              history={auctionHistory}
              teams={tournamentData?.teams || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionRoom;