import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Divider, 
  LinearProgress, 
  Grid, 
  Tooltip,
  Avatar,
  Paper
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

// Convert crores to actual amount (1 crore = 10,000,000)
const croreToAmount = (crores) => {
  if (typeof crores === 'number') {
    return crores * 10000000;
  }
  return 0;
};

// Format currency with proper null checking
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) {
    return '₹0';
  }
  return `₹${amount.toLocaleString()}`;
};

// Single team balance card
const TeamBalanceItem = ({ team, balance, isHighlighted }) => {
  if (!team) return null;
  
  const teamName = team?.name || 'Unknown Team';
  const teamColor = team?.color || '#6366f1';
  
  // Ensure we have a proper budget - convert from crores if needed
  const teamBudgetInCrores = team?.budget || 0;
  const teamBudget = teamBudgetInCrores > 100 ? teamBudgetInCrores : croreToAmount(teamBudgetInCrores);
  
  // Get budget values, ensuring we use actual numbers not crores
  const totalBudget = balance?.total || teamBudget;
  const spent = balance?.spent || 0;
  const remaining = balance?.remaining || teamBudget;
  
  // Calculate percentage remaining
  const percentRemaining = totalBudget > 0 ? (remaining / totalBudget) * 100 : 0;
  const percentSpent = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
  
  // Determine status color based on percentage remaining
  const getStatusColor = () => {
    if (percentRemaining <= 10) return 'error.main';
    if (percentRemaining <= 25) return 'warning.main';
    if (percentRemaining <= 50) return 'info.main';
    return 'success.main';
  };
  
  return (
    <Paper
      elevation={isHighlighted ? 3 : 1}
      sx={{
        borderRadius: 2,
        border: isHighlighted ? `2px solid ${teamColor}` : '1px solid rgba(0,0,0,0.08)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        }
      }}
    >
      <Box sx={{ 
        p: 1.5, 
        bgcolor: isHighlighted ? `${teamColor}` : 'transparent',
        borderBottom: !isHighlighted ? `2px solid ${teamColor}` : 'none'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{ 
                width: 24, 
                height: 24, 
                bgcolor: isHighlighted ? '#fff' : teamColor,
                color: isHighlighted ? teamColor : '#fff',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}
            >
              {teamName.charAt(0)}
            </Avatar>
          
            <Typography 
              variant="body1" 
              fontWeight="bold"
              sx={{ color: isHighlighted ? '#fff' : 'text.primary' }}
            >
              {teamName}
            </Typography>
          </Box>
          
          <Tooltip title="Remaining Budget" arrow placement="top">
            <Typography 
              variant="body1" 
              fontWeight="bold"
              sx={{ 
                color: isHighlighted ? '#fff' : getStatusColor(),
              }}
            >
              {formatCurrency(remaining)}
            </Typography>
          </Tooltip>
        </Box>
      </Box>
      
      <Box sx={{ p: 1.5 }}>
        {/* Progress bar showing percentage spent vs remaining */}
        <Box sx={{ width: '100%', mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Budget Status
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {percentRemaining.toFixed(0)}% remaining
            </Typography>
          </Box>
          
          <Box sx={{ 
            height: 8, 
            borderRadius: 4, 
            bgcolor: 'rgba(0,0,0,0.05)', 
            overflow: 'hidden',
            display: 'flex'
          }}>
            {/* Spent portion */}
            <Box 
              sx={{ 
                width: `${percentSpent}%`, 
                bgcolor: teamColor,
                transition: 'width 1s ease-in-out'
              }} 
            />
            {/* Remaining portion */}
            <Box 
              sx={{ 
                width: `${percentRemaining}%`, 
                bgcolor: 'transparent',
                transition: 'width 1s ease-in-out'
              }} 
            />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Spent
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {formatCurrency(spent)}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {formatCurrency(totalBudget)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

// Team balances grid
const TeamBalances = ({ teams = [], balances = {}, highlightTeamId = null }) => {
  if (!teams || teams.length === 0) {
    return (
      <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Team Budgets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No teams available
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ 
        p: 2, 
        bgcolor: 'primary.main', 
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <AccountBalanceWalletIcon />
        <Typography variant="h6" fontWeight="medium">
          Team Budgets
        </Typography>
      </Box>
      
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={1.5}>
          {Array.isArray(teams) && teams.map((team) => {
            if (!team || !team.id) return null;
            
            // Create a fallback balance object with proper budget conversion
            const teamBudgetInCrores = team?.budget || 0;
            const teamBudget = teamBudgetInCrores > 100 ? teamBudgetInCrores : croreToAmount(teamBudgetInCrores);
            
            const balance = balances[team.id] || { 
              total: teamBudget, 
              spent: 0, 
              remaining: teamBudget 
            };
            
            return (
              <Grid item xs={12} key={team.id}>
                <TeamBalanceItem 
                  team={team} 
                  balance={balance}
                  isHighlighted={team.id === highlightTeamId}
                />
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TeamBalances;