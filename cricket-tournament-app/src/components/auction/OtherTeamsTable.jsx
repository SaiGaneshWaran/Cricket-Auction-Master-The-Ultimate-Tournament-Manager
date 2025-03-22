import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
  Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const OtherTeamsTable = ({ teams = [], teamBalances = {}, currentTeam = null, currentBidder = null }) => {
  // Safely handle teams being undefined or not an array
  if (!teams || !Array.isArray(teams) || teams.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
        No team information available
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Team</TableCell>
            <TableCell align="right">Remaining</TableCell>
            <TableCell align="right">Players</TableCell>
            <TableCell align="right">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teams.map((team) => {
            // Skip if team is null/undefined or missing id
            if (!team || !team.id) return null;
            
            const isCurrentTeam = currentTeam && team.id === currentTeam.id;
            const isCurrentBidder = team.id === currentBidder;
            
            // Safely get team balance or default values
            const balance = teamBalances[team.id] || { 
              remaining: team.budget || 0, 
              spent: 0, 
              players: [] 
            };
            
            const playersCount = Array.isArray(balance.players) ? balance.players.length : 0;
            
            return (
              <TableRow 
                key={team.id}
                sx={{ 
                  bgcolor: isCurrentTeam ? 'rgba(25, 118, 210, 0.08)' : undefined,
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        bgcolor: team.color || 'primary.main',
                        fontSize: '0.75rem'
                      }}
                    >
                      {team.name ? team.name.charAt(0) : '?'}
                    </Avatar>
                    <Typography variant="body2" fontWeight={isCurrentBidder ? 'bold' : 'normal'}>
                      {team.name}
                      {isCurrentBidder && (
                        <CheckCircleIcon 
                          color="success" 
                          fontSize="small" 
                          sx={{ ml: 0.5, verticalAlign: 'middle' }} 
                        />
                      )}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography 
                    variant="body2" 
                    fontWeight="medium"
                    color={balance.remaining < 50000 ? 'error' : 'text.primary'}
                  >
                    ₹{balance.remaining?.toLocaleString() || 0}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {playersCount}
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={isCurrentBidder ? "Bidding" : "Waiting"} 
                    color={isCurrentBidder ? "success" : "default"}
                    size="small"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OtherTeamsTable;