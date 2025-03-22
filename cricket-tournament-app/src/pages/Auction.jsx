import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Alert
} from '@mui/material';
import { toast } from 'react-toastify';

import { useTournament } from '../contexts/TournamentContext';
import { useAuction } from '../contexts/AuctionContext';
import { useAuth } from '../contexts/AuthContext';

import WaitingLobby from '../components/auction/WaitingLobby';
import AuctionRoom from '../components/auction/AuctionRoom';

const Auction = () => {
  // FIX #1: Explicitly extract tournamentId from params
  const { tournamentId } = useParams();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { getTournament } = useTournament();
  const { 
    currentAuction, 
    initializeAuctionState, 
    isInitialized,
    loading: auctionLoading
  } = useAuction();
  
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);
  const [error, setError] = useState(null);
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [userRole, setUserRole] = useState('viewer');
  const [userTeamId, setUserTeamId] = useState(null);
  
  // Test mode detection
  const inTestMode = location.state?.isTestMode || false;
  const searchParams = new URLSearchParams(location.search);
  const queryTestMode = searchParams.get('testMode') === 'true';
  const effectiveTestMode = inTestMode || queryTestMode;

  // Debug logging
  useEffect(() => {
    console.log('Auction component parameters:', {
      tournamentId,
      pathname: location.pathname,
      testMode: effectiveTestMode
    });
  }, [tournamentId, location.pathname, effectiveTestMode]);

  // Load tournament
  useEffect(() => {
    const loadTournament = async () => {
      try {
        if (!tournamentId) {
          console.error('No tournament ID in URL parameters');
          setError('No tournament ID found. Please go back to tournaments.');
          setLoading(false);
          return;
        }

        setLoading(true);
        const tournamentData = await getTournament(tournamentId);
        
        if (!tournamentData) {
          setError(`Tournament with ID ${tournamentId} not found`);
          setLoading(false);
          return;
        }

        console.log('Tournament loaded:', tournamentData.name);
        
        // Set tournament with test mode flag
        setTournament({
          ...tournamentData,
          isTestMode: effectiveTestMode
        });
        
        // Set user role
        if (effectiveTestMode) {
          setUserRole('admin');
        } else if (tournamentData.creator === currentUser?.uid) {
          setUserRole('admin');
        } else {
          setUserRole('viewer');
        }
        
        // Initialize auction
        try {
          const auctionData = await initializeAuctionState(tournamentData);
          console.log('Auction initialized:', auctionData?.id);
          
          // Set auction as started if already active or in test mode
          if (auctionData?.status === 'active' || effectiveTestMode) {
            setAuctionStarted(true);
          }
        } catch (error) {
          console.error('Error initializing auction:', error);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading tournament:', err);
        setError(err.message || 'Failed to load tournament');
        setLoading(false);
      }
    };
    
    loadTournament();
  }, [tournamentId, getTournament, initializeAuctionState, effectiveTestMode, currentUser]);
  
  // Handle auction start
  const handleAuctionStart = () => {
    setAuctionStarted(true);
    toast.success('Auction has started!');
  };
  
  // Debug function to clear data
  const handleClearStorage = () => {
    if (window.confirm('Clear all auction data and reload?')) {
      localStorage.removeItem('cricket_auctions');
      window.location.reload();
    }
  };

  // Loading state
  if (loading || auctionLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography variant="h6">
            Loading auction...
          </Typography>
          
          <Paper sx={{ p: 2, mt: 2, width: '100%' }}>
            <Typography variant="subtitle2" gutterBottom>Debug Information:</Typography>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              <li>Tournament ID: {tournamentId || '❌ Missing'}</li>
              <li>URL Path: {location.pathname}</li>
              <li>Test Mode: {effectiveTestMode ? 'ON' : 'OFF'}</li>
            </ul>
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined"
                size="small"
                onClick={() => navigate('/tournaments')}
              >
                Back to Tournaments
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/tournaments')}>
          Back to Tournaments
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Tournament header */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {tournament?.name || 'Tournament'}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {tournament?.teams?.length || 0} Teams • {tournament?.players?.length || 0} Players
          </Typography>
          
          <Button variant="outlined" onClick={() => navigate(`/tournament/${tournamentId}`)}>
            Tournament Details
          </Button>
        </Box>
      </Paper>
      
      {/* Test mode indicator */}
      {effectiveTestMode && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.dark' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="white">
              🧪 Running in TEST MODE - Captain validation is bypassed
            </Typography>
            
            <Button 
              variant="outlined" 
              color="inherit"
              size="small"
              onClick={handleClearStorage}
            >
              Clear Auction Data
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Auction content */}
      <Box sx={{ mb: 4 }}>
        {!isInitialized ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : !auctionStarted ? (
          <WaitingLobby 
            tournament={tournament}
            onStart={handleAuctionStart}
            isTestMode={effectiveTestMode}
          />
        ) : (
          <AuctionRoom 
            tournament={tournament}
            isAdmin={userRole === 'admin' || effectiveTestMode}
            teamId={userTeamId}
          />
        )}
      </Box>
    </Container>
  );
};

export default Auction;