// src/pages/Auction.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuction } from '../contexts/AuctionContext';
import AuctionRoom from '../components/auction/AuctionRoom';
import WaitingLobby from '../components/auction/WaitingLobby';
import TeamBalanceCard from '../components/auction/TeamBalanceCard';
import OtherTeamsTable from '../components/auction/OtherTeamsTable';
import PlayerProfile from '../components/auction/PlayerProfile';
import BiddingControls from '../components/auction/BiddingControls.jsx';
import AuctionHistory from '../components/auction/AuctionHistory.jsx';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal.jsx';
import { getAuctionById, joinAuctionAsCaptain } from '../services/auctionService';
import { getFromStorage } from '../utils/storage.js';

const Auction = () => {
  const { id, role, code } = useParams();
  const navigate = useNavigate();
  const { 
    auction, 
    setAuction, 
    currentTeam, 
    setCurrentTeam,
    loading,
    setLoading,
    error,
    setError
  } = useAuction();

  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isViewer, setIsViewer] = useState(false);

  // Initialization and connection
  useEffect(() => {
    const initializeAuction = async () => {
      setLoading(true);
      try {
        // If we have an ID, try to load directly
        if (id) {
          const auctionData = getAuctionById(id);
          if (!auctionData) {
            throw new Error('Auction not found');
          }
          setAuction(auctionData);
          
          // Check if we already have a team selection in local storage
          const savedTeam = getFromStorage(`auction_team_${id}`);
          if (savedTeam) {
            setCurrentTeam(savedTeam);
          }
          
        } 
        // If we have a code, try to join as captain or viewer
        else if (code) {
          if (role === 'captain') {
            // For captains, we first need to show the team selector
            // Get auction by captain code
            const allAuctions = Object.keys(localStorage)
              .filter(key => key.startsWith('cricket_auction_data'))
              .map(key => JSON.parse(localStorage.getItem(key)));
            
            const targetAuction = allAuctions.find(a => a.captainCode === code);
            
            if (!targetAuction) {
              throw new Error('Invalid captain code');
            }
            
            setAuction(targetAuction);
            
            // Get available (not connected) teams
            const teams = targetAuction.teams.filter(team => !team.connected);
            if (teams.length === 0) {
              throw new Error('All teams are already connected');
            }
            
            setAvailableTeams(teams);
            setShowTeamSelector(true);
          } 
          else if (role === 'viewer') {
            // For viewers, we can directly join
            const allAuctions = Object.keys(localStorage)
              .filter(key => key.startsWith('cricket_auction_data'))
              .map(key => JSON.parse(localStorage.getItem(key)));
            
            const targetAuction = allAuctions.find(a => a.viewerCode === code);
            
            if (!targetAuction) {
              throw new Error('Invalid viewer code');
            }
            
            setAuction(targetAuction);
            setIsViewer(true);
          } else {
            throw new Error('Invalid role');
          }
        } else {
          throw new Error('Missing auction ID or join code');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error initializing auction:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuction();
  }, [id, role, code, setAuction, setLoading, setError]);

  // Join as team captain
  const handleTeamSelect = async () => {
    if (!selectedTeamId) {
      setError('Please select a team');
      return;
    }

    setLoading(true);
    try {
      const updatedAuction = joinAuctionAsCaptain(code, selectedTeamId);
      setAuction(updatedAuction);
      
      const selectedTeam = updatedAuction.teams.find(t => t.id === selectedTeamId);
      setCurrentTeam(selectedTeam);
      
      // Save to local storage
      localStorage.setItem(`auction_team_${updatedAuction.id}`, JSON.stringify(selectedTeam));
      
      // Hide selector and redirect to the auction page with ID
      setShowTeamSelector(false);
      navigate(`/auction/${updatedAuction.id}`);
    } catch (err) {
      setError(err.message);
      console.error('Error joining as captain:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync auction state (would use WebSockets in a real app)
  useEffect(() => {
    if (!auction) return;

    const interval = setInterval(() => {
      const freshData = getAuctionById(auction.id);
      if (freshData) {
        setAuction(freshData);
        
        // Update current team if needed
        if (currentTeam) {
          const updatedTeam = freshData.teams.find(t => t.id === currentTeam.id);
          if (updatedTeam) {
            setCurrentTeam(updatedTeam);
          }
        }
      }
    }, 1000); // Poll every second

    return () => clearInterval(interval);
  }, [auction, currentTeam, setAuction, setCurrentTeam]);

  // Handle auction completion
  useEffect(() => {
    if (auction && auction.status === 'completed') {
      // Navigate to analysis page
      navigate(`/analysis/${auction.tournamentId}`);
    }
  }, [auction, navigate]);

  // Loading state
  if (loading) {
    return <Loader message="Loading auction..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate('/')}
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Team selection modal for captains
  if (showTeamSelector) {
    return (
      <Modal
        isOpen={true}
        title="Select Your Team"
        onClose={() => navigate('/')}
      >
        <div className="p-4">
          <p className="mb-4">Please select the team you want to captain:</p>
          
          <div className="mb-4">
            <select
              className="w-full p-2 border rounded"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
            >
              <option value="">-- Select a Team --</option>
              {availableTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2 hover:bg-gray-400"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleTeamSelect}
              disabled={!selectedTeamId}
            >
              Join Auction
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // Main auction view
  if (auction) {
    // Waiting lobby view when status is 'waiting'
    if (auction.status === 'waiting') {
      return (
        <WaitingLobby 
          auction={auction}
          currentTeam={currentTeam}
          isAdmin={auction.createdBy === currentTeam?.id}
          isViewer={isViewer}
        />
      );
    }
    
    // Active auction view
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">{auction.tournamentName || 'Cricket Auction'}</h1>
            <p className="text-gray-600">
              {auction.status === 'active' ? 'Auction in progress' : 'Auction completed'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left sidebar - Team balance & other teams */}
            <div className="lg:col-span-3 space-y-4">
              {!isViewer && currentTeam && (
                <TeamBalanceCard 
                  team={currentTeam} 
                  auctionId={auction.id} 
                />
              )}
              
              <OtherTeamsTable 
                teams={auction.teams} 
                currentTeamId={currentTeam?.id} 
              />
            </div>
            
            {/* Main auction area */}
            <div className="lg:col-span-6">
              <AuctionRoom 
                auction={auction}
                currentPlayer={auction.currentPlayer}
                isViewer={isViewer}
              />
              
              {auction.currentPlayer && (
                <div className="mt-4">
                  <PlayerProfile 
                    player={auction.currentPlayer}
                    isDetailed={true}
                  />
                </div>
              )}
              
              {!isViewer && currentTeam && auction.status === 'active' && (
                <div className="mt-4">
                  <BiddingControls 
                    auctionId={auction.id}
                    playerId={auction.currentPlayer?.id}
                    teamId={currentTeam.id}
                    currentBid={auction.currentPlayer?.currentBid || 0}
                    maxBudget={currentTeam.budget}
                    timerStart={auction.timerStart}
                    timerDuration={auction.timerDuration}
                  />
                </div>
              )}
            </div>
            
            {/* Right sidebar - Auction history */}
            <div className="lg:col-span-3">
              <AuctionHistory 
                history={auction.history}
                teams={auction.teams}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return <Loader message="Initializing auction..." />;
};

export default Auction;