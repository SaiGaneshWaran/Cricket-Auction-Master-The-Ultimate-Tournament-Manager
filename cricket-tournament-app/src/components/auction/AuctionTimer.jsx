// src/components/auction/AuctionTimer.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const AuctionTimer = ({ seconds = 15, isRunning = false }) => {
  const [color, setColor] = useState('primary');

  // Update color based on remaining time
  useEffect(() => {
    if (seconds <= 3) {
      setColor('error');
    } else if (seconds <= 7) {
      setColor('warning');
    } else {
      setColor('primary');
    }
  }, [seconds]);

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={((seconds > 15 ? 15 : seconds) / 15) * 100}
        color={color}
        size={60}
        thickness={4}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h6"
          component="div"
          color={isRunning ? 'text.primary' : 'text.disabled'}
        >
          {seconds}
        </Typography>
      </Box>
    </Box>
  );
};

export default AuctionTimer;