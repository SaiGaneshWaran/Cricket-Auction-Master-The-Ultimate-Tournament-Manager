import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Chip, 
  Avatar, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent
} from '@mui/material';
import { motion } from 'framer-motion';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import PersonIcon from '@mui/icons-material/Person';
import BattingIcon from '@mui/icons-material/Timer3';
import BowlingIcon from '@mui/icons-material/Album';
import FlagIcon from '@mui/icons-material/Flag';

// Helper function to get role colors
const getRoleColor = (role) => {
  switch(role?.toLowerCase()) {
    case 'batsman':
      return 'primary';
    case 'bowler':
      return 'success';
    case 'all-rounder':
      return 'secondary';
    case 'wicket-keeper':
      return 'warning';
    default:
      return 'default';
  }
};

const formatStat = (stat) => {
  if (stat === undefined || stat === null) return '-';
  if (typeof stat === 'number') {
    return stat % 1 !== 0 ? stat.toFixed(2) : stat.toString();
  }
  return stat;
};

const PlayerProfile = ({ player }) => {
  if (!player) return null;

  // Extract player stats
  const stats = player.stats || {};
  const battingStats = stats.batting || {};
  const bowlingStats = stats.bowling || {};
  
  const roleColor = getRoleColor(player.role);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          borderRadius: 2,
          background: 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(240,240,240,0.8))',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}
      >
        {/* Player header */}
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Avatar
                sx={{ 
                  width: 100, 
                  height: 100, 
                  border: `3px solid ${roleColor === 'default' ? '#6366f1' : `${roleColor}.main`}`,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  bgcolor: roleColor === 'default' ? '#6366f1' : `${roleColor}.main`
                }}
              >
                {player.profileImage ? (
                  <img 
                    src={player.profileImage} 
                    alt={player.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <PersonIcon sx={{ width: 60, height: 60, color: '#fff' }} />
                )}
              </Avatar>
            </motion.div>
          </Grid>
          
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold">
              {player.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mt: 1 }}>
              <Chip 
                label={player.role || 'Player'} 
                color={roleColor}
                size="medium"
                icon={<SportsCricketIcon />}
                sx={{ mr: 1, mb: 1, fontWeight: 'bold', px: 1 }}
              />
              
              {player.country && (
                <Chip 
                  label={player.country}
                  variant="outlined"
                  size="small"
                  icon={<FlagIcon />}
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
              
              {player.battingStyle && (
                <Chip 
                  label={`${player.battingStyle}`} 
                  variant="outlined"
                  size="small"
                  icon={<BattingIcon />}
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
              
              {player.bowlingStyle && (
                <Chip 
                  label={`${player.bowlingStyle}`} 
                  variant="outlined"
                  size="small"
                  icon={<BowlingIcon />}
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
            </Box>
          </Grid>
          
          <Grid item>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Paper 
                elevation={3}
                sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  borderRadius: 2,
                  minWidth: 120,
                  background: 'linear-gradient(to bottom right, #6366f1, #4f46e5)',
                  color: 'white'
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Base Price
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                  ₹{player.basePrice?.toLocaleString() || '0'}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, borderColor: 'rgba(0,0,0,0.1)' }} />
        
        {/* Player stats */}
        <Grid container spacing={3}>
          {/* Batting Stats */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 2, 
                height: '100%',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.1)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                py: 1.5,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <BattingIcon />
                <Typography variant="h6" fontWeight="medium">
                  Batting Stats
                </Typography>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>Matches</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatStat(battingStats.matches)}
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>Runs</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatStat(battingStats.runs)}
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>Average</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatStat(battingStats.average)}
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>Strike Rate</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatStat(battingStats.strikeRate)}
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>50s / 100s</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatStat(battingStats.fifties)} / {formatStat(battingStats.hundreds)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
          
          {/* Bowling Stats */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 2, 
                height: '100%',
                border: '1px solid rgba(22, 163, 74, 0.2)',
                boxShadow: '0 4px 10px rgba(22, 163, 74, 0.1)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                bgcolor: 'success.main', 
                color: 'white', 
                py: 1.5,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <BowlingIcon />
                <Typography variant="h6" fontWeight="medium">
                  Bowling Stats
                </Typography>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>Wickets</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatStat(bowlingStats.wickets)}
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>Economy</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatStat(bowlingStats.economy)}
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>Average</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatStat(bowlingStats.average)}
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>Strike Rate</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatStat(bowlingStats.strikeRate)}
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>Best Figures</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatStat(bowlingStats.bestFigures)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
          
          {/* Player notes/description if available */}
          {player.description && (
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.1)',
                    background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(245,245,255,0.9))'
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Player Profile
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {player.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          )}
        </Grid>
      </Paper>
    </motion.div>
  );
};

export default PlayerProfile;