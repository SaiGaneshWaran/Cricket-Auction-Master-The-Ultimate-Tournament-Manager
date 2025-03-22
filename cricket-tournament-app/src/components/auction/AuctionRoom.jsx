import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Divider, 
  CircularProgress,
  Button,
  Chip,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Stack,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Switch,
  FormControlLabel
} from '@mui/material';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useAuction } from '../../contexts/AuctionContext';
import PlayerProfile from './PlayerProfile';
import BiddingControls from './BiddingControls';
import TeamBalances from './TeamBalanceCard';
import OtherTeamsTable from './OtherTeamsTable';
import AuctionHistory from './AuctionHistory';
import { 
  GavelRounded, 
  AccessTimeRounded, 
  EmojiEventsRounded, 
  Refresh,
  Groups as TeamsIcon,
  History as HistoryIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon
} from '@mui/icons-material';

const AuctionRoom = ({ tournament, isAdmin = false, teamId = null }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { 
    currentAuction, 
    currentPlayer,
    currentBid,
    currentBidder,
    isAuctionActive,
    refreshAuction,
    completeBid,
    skipPlayer,
    placeBid,
    auctionHistory,
    teamBalances,
    toggleAuctionStatus // Add this function to your AuctionContext
  } = useAuction();
  
  // Essential state variables
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [autoDemoBidding, setAutoDemoBidding] = useState(false);
  const [rightColumnTab, setRightColumnTab] = useState(0);
  
  // Local state to track auction status for immediate UI feedback
  const [localAuctionActive, setLocalAuctionActive] = useState(Boolean(isAuctionActive));
  
  // Keep track of active timers to prevent conflicts
  const timerRef = useRef(null);
  const autoDemoRef = useRef(null);
  const initialRenderRef = useRef(true);
  
  // Update local state when context changes
  useEffect(() => {
    setLocalAuctionActive(Boolean(isAuctionActive));
  }, [isAuctionActive]);
  
  // Test mode detection
  const isTestMode = tournament?.isTestMode || window.location.search.includes('testMode=true');
  const effectiveIsAdmin = isAdmin || isTestMode;
  
  // Get current bidder team info
  const currentBidderTeam = currentBidder ? 
    (currentAuction?.teams || []).find(t => t?.id === currentBidder) : null;
  
  // Get current user team (for team view)
  const currentTeam = teamId ? 
    (currentAuction?.teams || []).find(t => t?.id === teamId) : null;
    
  // TIMER FUNCTIONALITY
  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const activeStatus = Boolean(isAuctionActive);
    
    // Only start a new timer if auction is active and player exists
    if (activeStatus && currentPlayer && !isSubmitting) {
      console.log("Starting timer - auction is active:", activeStatus);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            
            // Auto-complete when timer hits zero (admin only)
            if (effectiveIsAdmin) {
              handleCompleteBid();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      console.log("Not starting timer - auction active:", activeStatus, ", player:", Boolean(currentPlayer), ", submitting:", isSubmitting);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAuctionActive, currentPlayer, isSubmitting, effectiveIsAdmin]);
  
  // Reset timer when player changes or new bid is placed
  useEffect(() => {
    // Don't reset on initial render
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    
    if (Boolean(isAuctionActive) && currentPlayer) {
      setTimeLeft(15);
    }
  }, [currentPlayer?.id, currentBid, currentBidder, isAuctionActive]);
  
  // AUTO DEMO BIDDING
  useEffect(() => {
    // Clear existing auto-demo timer
    if (autoDemoRef.current) {
      clearTimeout(autoDemoRef.current);
      autoDemoRef.current = null;
    }
    
    if (!autoDemoBidding || !effectiveIsAdmin || !isAuctionActive || !currentPlayer || isSubmitting) {
      return;
    }
    
    const scheduleNextBid = () => {
      autoDemoRef.current = setTimeout(() => {
        try {
          // Only place bid if time is within range
          if (timeLeft < 10 && timeLeft > 2 && !isSubmitting) {
            // Need to have teams defined
            const availableTeams = Array.isArray(currentAuction?.teams) ? 
              currentAuction.teams.filter(team => {
                if (!team || team.id === currentBidder) return false;
                
                // Check team's budget
                const teamBudget = teamBalances?.[team.id]?.remaining || 0;
                const minBidAmount = Math.max(
                  Math.ceil((currentBid || 0) * 1.05), 
                  (currentBid || 0) + 5000
                );
                
                return teamBudget >= minBidAmount;
              }) : [];
            
            if (availableTeams.length > 0) {
              // Randomly select a team
              const randomTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
              
              // Calculate bid amount
              const randomPercent = 5 + Math.floor(Math.random() * 11); // 5-15%
              const bidAmount = Math.max(
                Math.ceil((currentBid || 0) * (1 + randomPercent/100)), 
                (currentBid || 0) + 5000
              );
              
              handlePlaceBid(bidAmount, randomTeam.id);
            }
          }
        } catch (error) {
          console.error("Error in auto-bidding:", error);
        }
        
        // Schedule next attempt if still enabled
        if (autoDemoBidding && !isSubmitting && isAuctionActive) {
          scheduleNextBid();
        }
      }, 1500 + Math.random() * 1000); // Random timing for more natural feel
    };
    
    // Start the scheduling
    scheduleNextBid();
    
    return () => {
      if (autoDemoRef.current) {
        clearTimeout(autoDemoRef.current);
        autoDemoRef.current = null;
      }
    };
  }, [
    autoDemoBidding, 
    timeLeft, 
    currentBid, 
    currentBidder, 
    isSubmitting, 
    currentPlayer,
    effectiveIsAdmin,
    isAuctionActive,
    currentAuction?.teams,
    teamBalances
  ]);
  
  // Refresh auction data periodically
  useEffect(() => {
    if (!currentAuction?.id) return;
    
    const refreshInterval = setInterval(() => {
      refreshAuction(currentAuction.id).catch(console.error);
    }, 5000);
    
    return () => clearInterval(refreshInterval);
  }, [currentAuction?.id, refreshAuction]);
  
  // Handle manual refresh
  const handleRefresh = async () => {
    if (!currentAuction?.id) return;
    
    setIsRefreshing(true);
    try {
      await refreshAuction(currentAuction.id);
      toast.info("Auction data refreshed");
    } catch (error) {
      console.error("Error refreshing auction:", error);
      toast.error("Failed to refresh auction data");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle toggling auction active state
  const handleToggleAuctionStatus = async () => {
    if (!effectiveIsAdmin || !currentAuction?.id) return;
    
    setIsSubmitting(true);
    try {
      // Update local state immediately for UI responsiveness
      setLocalAuctionActive(prev => !prev);
      
      // Call context function to update backend
      if (toggleAuctionStatus) {
        await toggleAuctionStatus(currentAuction.id);
        toast.success(`Auction ${!isAuctionActive ? 'started' : 'paused'} successfully`);
      }
    } catch (error) {
      console.error("Error toggling auction status:", error);
      toast.error("Failed to update auction status");
      
      // Revert local state if operation failed
      setLocalAuctionActive(Boolean(isAuctionActive));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle completing the auction for current player
 // Update the handleCompleteBid function in AuctionRoom.jsx
const handleCompleteBid = async () => {
  if (!effectiveIsAdmin || !currentPlayer || isSubmitting) return;
  
  // Clear timers
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
  
  setIsSubmitting(true);
  try {
    // Make sure current player data is complete before calling completeBid
    const playerName = currentPlayer?.name || currentPlayer?.fullName || "Unknown Player";
    
    // Add player name to toast message for verification
    if (currentBidder) {
      toast.success(`${playerName} sold to ${currentBidderTeam?.name || 'team'} for ₹${currentBid?.toLocaleString()}!`);
    } else {
      toast.info(`${playerName} marked as unsold`);
    }
    
    // Pass completeBid with current player information
    await completeBid();
    
    // Reset timer for next player
    setTimeLeft(15);
  } catch (error) {
    console.error('Error completing bid:', error);
    toast.error(error.message || 'Failed to complete auction');
  } finally {
    setIsSubmitting(false);
  }
};
  
  // Handle skipping the current player
  const handleSkipPlayer = async () => {
    if (!effectiveIsAdmin || isSubmitting) return;
    
    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsSubmitting(true);
    try {
      await skipPlayer();
      toast.info(`Skipped player: ${currentPlayer?.name || 'Current player'}`);
      
      // Reset timer for next player
      setTimeLeft(15);
    } catch (error) {
      console.error('Error skipping player:', error);
      toast.error(error.message || 'Failed to skip player');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle placing a bid
  const handlePlaceBid = async (amount, teamIdToUse = null) => {
    if (isSubmitting) return;
    
    // Determine team ID to use
    const effectiveTeamId = teamIdToUse || 
      teamId || 
      (isTestMode && Array.isArray(currentAuction?.teams) && currentAuction.teams.length > 0 
        ? currentAuction.teams[0]?.id 
        : null);
    
    if (!effectiveTeamId) {
      toast.error('No team selected for bidding');
      return;
    }
    
    if (!amount || isNaN(amount) || amount <= currentBid) {
      toast.error('Please enter a valid bid amount higher than current bid');
      return;
    }
    
    // Don't allow bidding if you're already highest bidder (unless admin)
    if (effectiveTeamId === currentBidder && !effectiveIsAdmin) {
      toast.info("You are already the highest bidder");
      return;
    }
    
    // Check if team has enough budget
    const teamBalance = teamBalances?.[effectiveTeamId]?.remaining || 0;
    if (amount > teamBalance && !effectiveIsAdmin) {
      toast.error(`Insufficient funds. Your budget: ₹${teamBalance.toLocaleString()}`);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const bidTeam = Array.isArray(currentAuction?.teams) 
        ? currentAuction.teams.find(t => t?.id === effectiveTeamId) 
        : null;
      
      // Stop the timer while placing bid
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      await placeBid(effectiveTeamId, amount);
      
      toast.success(`${bidTeam?.name || 'Team'} bid ₹${amount.toLocaleString()}`);
      
      // Reset timer to 15s after a successful bid
      setTimeLeft(15);
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error(error.message || 'Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle auto demo bidding
  const toggleAutoDemoBidding = () => {
    const newState = !autoDemoBidding;
    setAutoDemoBidding(newState);
    
    // Clear any existing auto-bidding timer when turning off
    if (!newState && autoDemoRef.current) {
      clearTimeout(autoDemoRef.current);
      autoDemoRef.current = null;
      toast.info("Automatic demo bidding disabled");
      return;
    }
    
    // Check if auto-bidding can actually start
    if (newState) {
      if (!displayAuctionActive) {
        toast.warning("Auto-bidding enabled, but auction is currently paused. Resume the auction to start bidding.");
        return;
      }
      
      if (!currentPlayer) {
        toast.warning("Auto-bidding enabled, but there's no player up for auction yet.");
        return;
      }
      
      // Convert crores to actual amount (1 crore = 10,000,000)
      const croreToAmount = (crores) => {
        if (typeof crores === 'number') {
          return crores * 10000000;
        }
        return 0;
      };
      
      // Find eligible teams that can place bids
      const eligibleTeams = teams.filter(team => {
        if (!team || !team.id || team.id === currentBidder) return false;
        
        // Get team budget - either from balances or from team budget property
        const teamBalance = teamBalances?.[team.id];
        
        // If we have balance info, use remaining, otherwise convert from crores
        let effectiveBudget = 0;
        if (teamBalance && typeof teamBalance.remaining === 'number') {
          effectiveBudget = teamBalance.remaining;
        } else {
          // Get budget from team object and convert if needed
          const teamBudgetInCrores = team?.budget || 0;
          effectiveBudget = teamBudgetInCrores > 100 
            ? teamBudgetInCrores  // Already in rupees
            : croreToAmount(teamBudgetInCrores); // Convert from crores
        }
        
        // Calculate minimum bid
        const minBidAmount = Math.max(
          Math.ceil((currentBid || 0) * 1.05), 
          (currentBid || 0) + 5000
        );
        
        console.log(`Team ${team.name} budget: ₹${effectiveBudget.toLocaleString()}, min bid: ₹${minBidAmount.toLocaleString()}`);
        
        return effectiveBudget >= minBidAmount;
      });
      
      if (eligibleTeams.length === 0) {
        toast.info("Auto-bidding enabled, but no teams have enough budget to place bids right now.");
      } else {
        const bidderCount = eligibleTeams.length;
        
        toast.success(`Auto-bidding started with ${bidderCount} eligible teams!`, {
          autoClose: 3000
        });
        
        // Immediately schedule first bid with slight delay
        setTimeout(() => {
          if (autoDemoBidding && displayAuctionActive && !isSubmitting) {
            // Choose a random team
            const randomTeam = eligibleTeams[Math.floor(Math.random() * eligibleTeams.length)];
            
            // Calculate a bid amount (5-15% higher than current)
            const randomPercent = 5 + Math.floor(Math.random() * 11);
            const bidAmount = Math.max(
              Math.ceil((currentBid || 0) * (1 + randomPercent/100)),
              (currentBid || 0) + 10000
            );
            
            console.log(`Auto-bidding: ${randomTeam.name} placing bid of ₹${bidAmount.toLocaleString()}`);
            
            // Place the bid
            handlePlaceBid(bidAmount, randomTeam.id);
          }
        }, 800);
      }
    }
  };
  
  // Handle changing right column tab
  const handleRightColumnTabChange = (event, newValue) => {
    setRightColumnTab(newValue);
  };
  
  // Loading state
  if (!currentAuction || !currentAuction.id) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading auction data...
        </Typography>
      </Box>
    );
  }
  
  // Get timer color based on time left
  const getTimerColor = () => {
    if (timeLeft > 10) return 'success.main';
    if (timeLeft > 5) return 'warning.main';
    return 'error.main';
  };
  
  // Safely get the teams array
  const teams = Array.isArray(currentAuction?.teams) ? currentAuction.teams : [];
  
  // Use both local and context state for UI display to ensure responsiveness
  const displayAuctionActive = localAuctionActive;
  
  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* Test mode banner */}
     
      
      {/* Main auction interface */}
      <Grid container spacing={2}>
        {/* Header with auction info */}
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                {tournament?.name || 'Cricket Tournament'} - Auction
              </Typography>
              
              {effectiveIsAdmin && (
                <FormControlLabel 
                  control={
                    <Switch
                      checked={displayAuctionActive}
                      onChange={handleToggleAuctionStatus}
                      disabled={isSubmitting}
                      color="success"
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      {displayAuctionActive ? "Auction Active" : "Auction Paused"}
                    </Typography>
                  }
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                icon={displayAuctionActive ? <PlayIcon /> : <PauseIcon />}
                label={displayAuctionActive ? 'Active' : 'Paused'} 
                color={displayAuctionActive ? 'success' : 'warning'} 
                size="small"
                sx={{ fontWeight: 'medium' }}
              />
              
              <IconButton 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                color="primary"
                size="small"
              >
                <Refresh />
              </IconButton>
            </Box>
          </Paper>
        </Grid>
        
        {/* Left column - Current player */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={3}
            sx={{ 
              p: { xs: 2, md: 3 }, 
              borderRadius: 2,
              height: '100%',
              boxShadow: 3
            }}
          >
            {!displayAuctionActive && effectiveIsAdmin && (
              <Alert 
                severity="warning" 
                sx={{ mb: 3 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={handleToggleAuctionStatus}
                  >
                    Resume Auction
                  </Button>
                }
              >
                Auction is currently paused. No bidding is allowed until resumed.
              </Alert>
            )}
            
            {currentPlayer ? (
              <>
                {/* Timer and bid information */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GavelRounded color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Current Player</Typography>
                  </Box>
                  
                  {/* Countdown timer */}
                  <Box 
                    component={motion.div}
                    animate={{ scale: timeLeft <= 3 && displayAuctionActive ? [1, 1.1, 1] : 1 }}
                    transition={{ 
                      repeat: timeLeft <= 3 && displayAuctionActive ? Infinity : 0, 
                      duration: 0.5 
                    }}
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      opacity: displayAuctionActive ? 1 : 0.6
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeRounded sx={{ color: displayAuctionActive ? getTimerColor() : 'text.disabled' }} />
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 'bold', 
                          color: displayAuctionActive ? getTimerColor() : 'text.disabled' 
                        }}
                      >
                        {displayAuctionActive ? `${timeLeft}s` : "PAUSED"}
                      </Typography>
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={displayAuctionActive ? (timeLeft / 15) * 100 : 0} 
                      sx={{ 
                        width: '100%', 
                        mt: 1,
                        height: 8,
                        borderRadius: 2,
                        bgcolor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: displayAuctionActive ? getTimerColor() : 'text.disabled'
                        }
                      }}
                    />
                  </Box>
                </Box>
                
                {/* Player profile */}
                <PlayerProfile player={currentPlayer} />
                
                <Divider sx={{ my: 3 }} />
                
             
                
                {/* INTEGRATED BIDDING CONTROLS */}
                <BiddingControls 
                  currentBid={currentBid || 0}
                  currentBidder={currentBidder}
                  teams={teams}
                  isAdmin={effectiveIsAdmin}
                  teamId={teamId}
                  onPlaceBid={handlePlaceBid}
                  onCompleteBid={handleCompleteBid}
                  onSkipPlayer={handleSkipPlayer}
                  disabled={isSubmitting || !displayAuctionActive}
                  remainingBudget={teamId ? teamBalances?.[teamId]?.remaining || 0 : 0}
                />
                
                {/* Auto-bidding toggle (only in admin/test mode) */}
                {effectiveIsAdmin && (
                  <Paper
                    variant="outlined"
                    sx={{ 
                      p: 2, 
                      mt: 3, 
                      borderRadius: 2,
                      borderColor: 'secondary.main',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom color="secondary">
                          Viva Demonstration Mode
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Auto-generate bids from random teams to simulate auction
                        </Typography>
                      </Box>
                      
                      <Button
                        variant={autoDemoBidding ? "contained" : "outlined"}
                        color={autoDemoBidding ? "secondary" : "primary"}
                        onClick={toggleAutoDemoBidding}
                        disabled={isSubmitting || !displayAuctionActive}
                      >
                        {autoDemoBidding ? "Turn Off Auto-Bids" : "Turn On Auto-Bids"}
                      </Button>
                    </Box>
                  </Paper>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography variant="h6" color="text.secondary">
                  No player currently up for auction
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Right column - Team balances and auction history */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
            {/* Tabs for mobile view */}
            {isMobile && (
              <Tabs 
                value={rightColumnTab} 
                onChange={handleRightColumnTabChange}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab icon={<TeamsIcon />} label="Teams" />
                <Tab icon={<HistoryIcon />} label="History" />
              </Tabs>
            )}
            
            {/* Content based on selected tab or desktop view */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
              {/* Team balances - show always on desktop, or when teams tab selected on mobile */}
              {(!isMobile || rightColumnTab === 0) && (
                <>
                  {/* Enhanced Team Balances Card */}
                  <TeamBalances 
                    teams={teams} 
                    balances={teamBalances || {}}
                    highlightTeamId={currentBidder || teamId}
                  />
                  
                  {/* Integrated OtherTeamsTable */}
                  <Card sx={{ borderRadius: 2, overflow: 'hidden', mt: 2 }}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'info.dark',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <TeamsIcon />
                      <Typography variant="h6">Teams Overview</Typography>
                    </Box>
                    <CardContent sx={{ p: 1 }}>
                      <OtherTeamsTable
                        teams={teams}
                        teamBalances={teamBalances || {}}
                        currentTeam={currentTeam}
                        currentBidder={currentBidder}
                      />
                    </CardContent>
                  </Card>
                </>
              )}
              
              {/* Auction history - show always on desktop, or when history tab selected on mobile */}
              {(!isMobile || rightColumnTab === 1) && (
                <Card sx={{ borderRadius: 2, overflow: 'hidden', mt: 2 }}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'primary.main', 
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <EmojiEventsRounded />
                    <Typography variant="h6">
                      Auction History
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
                    <AuctionHistory 
                      history={auctionHistory || []} 
                      teams={teams}
                      maxHeight={350}
                    />
                  </CardContent>
                </Card>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuctionRoom;