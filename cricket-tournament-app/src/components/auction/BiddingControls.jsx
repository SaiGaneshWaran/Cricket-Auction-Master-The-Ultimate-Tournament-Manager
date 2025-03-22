import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  InputAdornment, 
  Grid,
  Paper,
  Chip,
  Divider,
  Tooltip,
  IconButton,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// Get default bid increments based on current bid amount
const getBidIncrements = (currentBid) => {
  if (currentBid < 50000) return [5000, 10000, 20000];
  if (currentBid < 100000) return [10000, 20000, 50000];
  if (currentBid < 500000) return [20000, 50000, 100000];
  if (currentBid < 1000000) return [50000, 100000, 200000];
  return [100000, 200000, 500000];
};

const BiddingControls = ({
  currentBid = 0,
  currentBidder = null,
  teams = [],
  isAdmin = false,
  teamId = null,
  onPlaceBid,
  onCompleteBid,
  onSkipPlayer,
  disabled = false,
  remainingBudget = 0
}) => {
  const [bidAmount, setBidAmount] = useState('');
  const [increments, setIncrements] = useState([]);
  const [bidError, setBidError] = useState('');
  const [isCurrentBidder, setIsCurrentBidder] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);
  
  // For test mode - multiple teams bidding
  const [selectedTeamId, setSelectedTeamId] = useState(teamId || null);
  
  // Debug logs ref (to track state changes)
  const debugRef = useRef({
    teamId,
    selectedTeamId: null,
    isAdmin
  });
  
  // Set initial selected team and update when teams change
  useEffect(() => {
    // Always prioritize the teamId prop if it exists (for non-admin users)
    if (teamId && !isAdmin) {
      setSelectedTeamId(teamId);
      return;
    }
    
    // For admin users, use the first team if none is selected
    if (isAdmin && (!selectedTeamId || !teams.find(t => t?.id === selectedTeamId))) {
      if (teams && Array.isArray(teams) && teams.length > 0 && teams[0]?.id) {
        setSelectedTeamId(teams[0].id);
        console.log("Admin mode: Setting default team:", teams[0].id);
      }
    }
    
    // Update debug ref
    debugRef.current = {
      ...debugRef.current,
      teamId,
      selectedTeamId,
      isAdmin
    };
  }, [teams, teamId, isAdmin]);
  
  // Update bid increments and state when current bid changes
  // Update bid increments and state when current bid changes
useEffect(() => {
  const currentIncrements = getBidIncrements(currentBid);
  setIncrements(currentIncrements);
  
  // Only set initial bid amount when component first loads or when no custom value exists
  const minIncrement = currentIncrements[0];
  if (currentBid > 0 && (!bidAmount || bidAmount === '')) {
    setBidAmount((currentBid + minIncrement).toString());
  }
  
  // Check if current user's team is the current bidder
  setIsCurrentBidder(teamId === currentBidder);
  
  // Find current bidding team
  if (currentBidder) {
    const team = teams.find(t => t?.id === currentBidder);
    setCurrentTeam(team);
  } else {
    setCurrentTeam(null);
  }
}, [currentBid, currentBidder, teamId, teams]);
  
  // Handle custom bid amount change
  const handleBidAmountChange = (e) => {
    const value = e.target.value;
    setBidAmount(value);
    
    // Validate
    if (value && !isNaN(value)) {
      const numValue = parseInt(value, 10);
      
      if (numValue <= currentBid) {
        setBidError('Bid must be higher than current bid');
      } else if (numValue > remainingBudget && teamId && !isAdmin) {
        setBidError('Bid exceeds your remaining budget');
      } else {
        setBidError('');
      }
    } else {
      setBidError('Please enter a valid amount');
    }
  };
  
  // Handle quick increment bid
  const handleQuickBid = (increment) => {
    const newBid = currentBid + increment;
    setBidAmount(newBid.toString());
    
    // Submit the bid immediately in admin/test mode
    if (isAdmin && selectedTeamId) {
      submitBid(newBid);
    }
  };
  
  // Quick percentage bid (e.g., +5%, +10%, +20%)
  const handlePercentBid = (percentIncrease) => {
    const increment = Math.max(5000, Math.ceil(currentBid * percentIncrease / 100));
    const newBid = currentBid + increment;
    setBidAmount(newBid.toString());
    
    // Submit the bid immediately in admin/test mode
    if (isAdmin && selectedTeamId) {
      submitBid(newBid);
    }
  };
  
  // Submit bid with validation
  const submitBid = (forcedAmount = null) => {
    // Use forced amount or input amount
    const amount = forcedAmount !== null ? forcedAmount : parseInt(bidAmount, 10);
    
    // Validation
    if (!amount || isNaN(amount) || amount <= currentBid) {
      setBidError('Please enter a valid bid amount higher than current bid');
      return;
    }
    
    // Determine which team ID to use based on user role
    const effectiveTeamId = isAdmin ? selectedTeamId : teamId;
    
    // Debug the team IDs
    console.log("Submitting bid with:", {
      amount,
      effectiveTeamId,
      selectedTeamId,
      teamId,
      isAdmin
    });
    
    // Make sure we have a team selected
    if (!effectiveTeamId) {
      setBidError('Please select a team to bid');
      return;
    }
    
    // Call the parent handler with team and amount
    onPlaceBid(amount, effectiveTeamId);
    
    // Clear any error
    setBidError('');
  };
  
  // Change bidding team (admin/test mode only)
  const handleChangeTeam = (newTeamId) => {
    console.log("Team selected:", newTeamId);
    setSelectedTeamId(newTeamId);
    setBidError(''); // Clear any existing error
  };
  
  // Find the currently selected team object
  const selectedTeam = teams.find(t => t?.id === selectedTeamId) || null;
  
  // Get effective budget based on user type
  const effectiveBudget = isAdmin ? 
    (selectedTeam?.budget || 0) : 
    remainingBudget;
  
  // Define percentage options for quick bids
  const percentOptions = [5, 10, 20];
  
  return (
    <Box>
      {/* Current bid display */}
      <Paper 
        variant="outlined" 
        sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Current Bid
            </Typography>
            <Typography variant="h4">
              ₹{currentBid?.toLocaleString() || 0}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Current Bidder
            </Typography>
            {currentTeam ? (
              <Chip 
                label={currentTeam.name} 
                sx={{ 
                  bgcolor: currentTeam.color || 'primary.main',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            ) : (
              <Typography variant="body1" color="text.secondary">
                No bids yet
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Bidding controls */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom color={isAdmin ? "primary" : "textPrimary"}>
          {isAdmin ? "Place Bids (Demo Mode)" : "Place Your Bid"}
          {isCurrentBidder && !isAdmin && (
            <Chip 
              label="Current Highest Bidder" 
              color="success" 
              size="small" 
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        
        {/* Team selection in admin mode */}
        {isAdmin && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Select team to bid as:
            </Typography>
            <Grid container spacing={1} sx={{ mb: 1 }}>
              {Array.isArray(teams) && teams.map((team, idx) => {
                // Skip undefined teams or teams without IDs
                if (!team || !team.id) return null;
                
                const isSelected = selectedTeamId === team.id;
                
                return (
                  <Grid item key={team.id}>
                    <Chip
                      label={team.name}
                      onClick={() => handleChangeTeam(team.id)}
                      sx={{ 
                        bgcolor: isSelected ? team.color || 'primary.main' : undefined,
                        color: isSelected ? 'white' : undefined,
                        border: isSelected ? 'none' : '1px solid',
                        borderColor: 'divider',
                        fontWeight: isSelected ? 'bold' : 'normal',
                        boxShadow: isSelected ? 1 : 0
                      }}
                      icon={isSelected ? <CheckCircleIcon /> : undefined}
                    />
                  </Grid>
                );
              })}
            </Grid>
            
            {selectedTeam && (
              <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
                Selected team: <strong>{selectedTeam.name}</strong> with budget ₹{selectedTeam?.budget?.toLocaleString() || 0}
              </Alert>
            )}
          </Box>
        )}
        
        {/* Budget info */}
        {!isAdmin && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your Remaining Budget: ₹{remainingBudget?.toLocaleString() || 0}
            </Typography>
          </Box>
        )}
        
        {/* Quick percentage-based bids */}
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
          Quick Percentage Bids:
        </Typography>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {percentOptions.map((percent) => {
            const increment = Math.max(5000, Math.ceil(currentBid * percent / 100));
            const newBid = currentBid + increment;
            const isDisabled = disabled || (!isAdmin && isCurrentBidder);
            
            return (
              <Grid item xs={4} key={`percent-${percent}`}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handlePercentBid(percent)}
                  disabled={isDisabled}
                  startIcon={<AddCircleOutlineIcon />}
                >
                  +{percent}% (₹{increment.toLocaleString()})
                </Button>
              </Grid>
            );
          })}
        </Grid>
        
        {/* Quick fixed increment bids */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Quick Fixed Bids:
        </Typography>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {increments.map((increment) => (
            <Grid item xs={4} key={`increment-${increment}`}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleQuickBid(increment)}
                disabled={disabled || (!isAdmin && isCurrentBidder)}
              >
                +₹{increment.toLocaleString()}
              </Button>
            </Grid>
          ))}
        </Grid>
        
        {/* Custom bid form */}
        <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <Grid item xs={7}>
            <TextField
              fullWidth
              label="Custom Bid Amount"
              variant="outlined"
              value={bidAmount}
              onChange={handleBidAmountChange}
              disabled={disabled || (!isAdmin && isCurrentBidder)}
              error={!!bidError}
              helperText={bidError || ' '}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={5}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={() => submitBid()}
              disabled={
                disabled || 
                (!isAdmin && isCurrentBidder) || 
                !!bidError || 
                !bidAmount || 
                parseInt(bidAmount, 10) <= currentBid
              }
              startIcon={<ArrowUpwardIcon />}
            >
              Place Bid
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* Admin controls */}
      {isAdmin && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Tooltip title={currentBidder ? 
                `Sell to ${teams.find(t => t?.id === currentBidder)?.name || 'highest bidder'}` : 
                "No bids placed yet - mark as unsold"}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={onCompleteBid}
                  disabled={disabled}
                  startIcon={<CheckCircleIcon />}
                >
                  {currentBidder ? "Sell to Highest Bidder" : "Mark as Unsold"}
                </Button>
              </Tooltip>
            </Grid>
            
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                size="large"
                onClick={onSkipPlayer}
                disabled={disabled}
                startIcon={<SkipNextIcon />}
              >
                Skip Player
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default BiddingControls;