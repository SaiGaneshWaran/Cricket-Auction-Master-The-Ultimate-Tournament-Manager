// src/components/auction/WaitingLobby.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { useAuction } from '../../contexts/AuctionContext';

import AccessCodeCard from './AccessCodeCard';
import { toast } from 'react-toastify';

const WaitingLobby = ({ tournament, onStart }) => {
  const { currentAuction, startAuction, refreshAuction } = useAuction();
  const [isLoading, setIsLoading] = useState(false);
  const [connectedTeams, setConnectedTeams] = useState([]);
  const [waitingForTeams, setWaitingForTeams] = useState(true);
  
  // Effect to check connected teams
  useEffect(() => {
    if (currentAuction && currentAuction.teams) {
      const connected = currentAuction.teams.filter(team => team.connected);
      setConnectedTeams(connected);
      
      // Auto-start when all teams are connected
      if (connected.length === currentAuction.teams.length && waitingForTeams) {
        setWaitingForTeams(false);
      }
    }
  }, [currentAuction, waitingForTeams]);
  
  // Start the auction
  const handleStartAuction = async () => {
    try {
      setIsLoading(true);
      await startAuction(currentAuction.id);
      if (onStart) onStart();
      toast.success('Auction started successfully!');
    } catch (error) {
      console.error('Error starting auction:', error);
      toast.error(error.message || 'Failed to start auction');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh auction data
  const handleRefresh = () => {
    refreshAuction(currentAuction.id);
  };
  
  if (!currentAuction) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Loading auction data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Waiting Lobby
      </Typography>
      
      <Grid container spacing={3}>
        {/* Access codes section */}
        <Grid item xs={12} md={6}>
          <AccessCodeCard 
            captainCode={currentAuction.captainCode} 
            viewerCode={currentAuction.viewerCode}
            tournamentName={tournament?.name || 'Cricket Tournament'}
          />
        </Grid>
        
        {/* Connected teams status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Team Connection Status
              <Button 
                size="small" 
                variant="outlined" 
                sx={{ ml: 2 }}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Team</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Budget</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentAuction.teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={team.connected ? 'Connected' : 'Waiting'} 
                          color={team.connected ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>₹{team.budget?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Player count summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Player Summary
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{currentAuction.playerPool.length}</Typography>
                <Typography variant="body2" color="text.secondary">Total Players</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4">
                  {currentAuction.playerPool.filter(p => p.status === 'unsold').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Available Players</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4">
                  {currentAuction.playerPool.filter(p => p.status === 'sold').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Pre-Sold Players</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Action buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleStartAuction}
              disabled={isLoading || connectedTeams.length === 0}
            >
              {isLoading ? 'Starting...' : 'Start Auction'}
            </Button>
          </Box>
          
          {connectedTeams.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
              Waiting for teams to connect...
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default WaitingLobby;