// src/components/auction/AccessCodeCard.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Button,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ShareIcon from '@mui/icons-material/Share';

const AccessCodeCard = ({ captainCode, viewerCode, tournamentName }) => {
  const [isCaptainCopied, setIsCaptainCopied] = useState(false);
  const [isViewerCopied, setIsViewerCopied] = useState(false);
  
  // Copy code to clipboard
  const copyToClipboard = (text, isCaptain = true) => {
    navigator.clipboard.writeText(text).then(
      () => {
        if (isCaptain) {
          setIsCaptainCopied(true);
          setTimeout(() => setIsCaptainCopied(false), 2000);
        } else {
          setIsViewerCopied(true);
          setTimeout(() => setIsViewerCopied(false), 2000);
        }
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };
  
  // Share tournament codes
  const handleShare = () => {
    if (!navigator.share) {
      console.error('Web Share API not supported');
      return;
    }
    
    const shareText = `Join our cricket auction for ${tournamentName}!\n\nCaptain Code: ${captainCode}\nViewer Code: ${viewerCode}\n\nUse these codes to access the auction.`;
    
    navigator.share({
      title: `${tournamentName} - Cricket Auction`,
      text: shareText
    }).catch((error) => console.error('Error sharing:', error));
  };
  
  // Generate join URLs (assumes your app is serving at the same origin)
  const captainUrl = `${window.location.origin}/join/captain/${captainCode}`;
  const viewerUrl = `${window.location.origin}/join/viewer/${viewerCode}`;
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Access Codes
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Share these codes with team captains and viewers to join the auction
      </Typography>
      
      {/* Captain Code */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Captain Code (For Team Captains Only)
        </Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          value={captainCode}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => copyToClipboard(captainCode)}
                  edge="end"
                  aria-label="copy captain code"
                >
                  <ContentCopyIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          URL: <span style={{ fontWeight: 'bold' }}>{captainUrl}</span>
          <IconButton 
            size="small" 
            onClick={() => copyToClipboard(captainUrl)}
            aria-label="copy URL"
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Typography>
      </Box>
      
      {/* Viewer Code */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Viewer Code (For Spectators)
        </Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          value={viewerCode}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => copyToClipboard(viewerCode, false)}
                  edge="end"
                  aria-label="copy viewer code"
                >
                  <ContentCopyIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          URL: <span style={{ fontWeight: 'bold' }}>{viewerUrl}</span>
          <IconButton 
            size="small" 
            onClick={() => copyToClipboard(viewerUrl, false)}
            aria-label="copy URL"
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Share buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
        <Button
          variant="outlined"
          startIcon={<QrCodeIcon />}
          onClick={() => {/* QR Code functionality to be implemented */}}
        >
          QR Codes
        </Button>
        
        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          onClick={handleShare}
          disabled={!navigator.share}
        >
          Share Codes
        </Button>
      </Box>
      
      {/* Copy notifications */}
      <Snackbar 
        open={isCaptainCopied} 
        autoHideDuration={2000} 
        onClose={() => setIsCaptainCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Captain code copied to clipboard!
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={isViewerCopied} 
        autoHideDuration={2000} 
        onClose={() => setIsViewerCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Viewer code copied to clipboard!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AccessCodeCard;