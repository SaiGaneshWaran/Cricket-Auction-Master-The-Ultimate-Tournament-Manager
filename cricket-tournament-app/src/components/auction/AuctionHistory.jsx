// src/components/auction/AuctionHistory.jsx
import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Chip, 
  Divider,
  Paper
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SkipNextIcon from '@mui/icons-material/SkipNext';

// Format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// Get team name by ID
const getTeamName = (teamId, teams = []) => {
  const team = teams.find(t => t?.id === teamId);
  return team?.name || 'Unknown Team';
};

// Get player name safely - checks various properties
const getPlayerName = (event) => {
  if (event.playerName) return event.playerName;
  if (event.player?.name) return event.player.name;
  if (event.player?.fullName) return event.player.fullName;
  if (event.name) return event.name;
  return "Unknown Player";
};

// Get icon and color for event type
const getEventTypeConfig = (type) => {
  switch (type) {
    case 'bid':
      return { icon: <LocalOfferIcon />, color: 'primary' };
    case 'sold':
      return { icon: <CheckCircleIcon />, color: 'success' };
    case 'unsold':
      return { icon: <CancelIcon />, color: 'error' };
    case 'skipped':
      return { icon: <SkipNextIcon />, color: 'warning' };
    default:
      return { icon: null, color: 'default' };
  }
};

// Format event description
const getEventDescription = (event, teams) => {
  const { type, teamId, amount } = event;
  const playerName = getPlayerName(event);
  
  switch (type) {
    case 'bid':
      return `${getTeamName(teamId, teams)} bid ₹${amount?.toLocaleString() || 0} for ${playerName}`;
    case 'sold':
      return `${playerName} sold to ${getTeamName(teamId, teams)} for ₹${amount?.toLocaleString() || 0}`;
    case 'unsold':
      return `${playerName} went unsold`;
    case 'skipped':
      return `${playerName} was skipped`;
    default:
      return 'Unknown event';
  }
};

const AuctionHistory = ({ history = [], teams = [], maxHeight = 300 }) => {
  // Sort history and filter out duplicate consecutive events of the same type for the same player
  const processedHistory = [...history]
    .sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return timeB - timeA;
    })
    // First normalize all player names and add a normalized property for comparison
    .map(event => {
      const playerName = getPlayerName(event);
      return {
        ...event,
        _normalizedPlayerName: playerName.toLowerCase().trim()
      };
    })
    // Then filter out duplicates based on type and normalized player name
    .filter((event, index, array) => {
      // Always keep the first event
      if (index === 0) return true;
      
      const prevEvent = array[index - 1];
      
      // If this is an 'unsold' or 'skipped' event, check if the previous event
      // is of the same type and for the same player
      if ((event.type === 'unsold' || event.type === 'skipped')) {
        if (prevEvent.type === event.type && 
            event._normalizedPlayerName === prevEvent._normalizedPlayerName) {
          return false; // Filter out duplicate consecutive events
        }
      }
      
      return true;
    });
  
  if (processedHistory.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No auction history yet
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box
      sx={{
        maxHeight: maxHeight,
        overflow: 'auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper'
      }}
    >
      <List disablePadding>
        {processedHistory.map((event, index) => {
          const { icon, color } = getEventTypeConfig(event.type);
          
          return (
            <React.Fragment key={event.id || `event-${index}-${event.timestamp || Date.now()}`}>
              {index > 0 && <Divider component="li" />}
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        icon={icon}
                        label={event.type.toUpperCase()}
                        size="small"
                        color={color}
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(event.timestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      component="span"
                      color="text.primary"
                    >
                      {getEventDescription(event, teams)}
                    </Typography>
                  }
                />
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
};

export default AuctionHistory;