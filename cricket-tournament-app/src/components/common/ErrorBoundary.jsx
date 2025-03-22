import React, { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    console.log('Caught error:', error, errorInfo);
  }

  handleReset = () => {
    // Clear local storage (potential source of errors)
    try {
      localStorage.removeItem('cricket_auctions');
    } catch (e) {
      console.error("Couldn't clear localStorage:", e);
    }
    
    // Reload the page
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          sx={{ 
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            bgcolor: '#121212'
          }}
        >
          <Paper 
            sx={{ 
              maxWidth: 600,
              width: '100%',
              p: 4,
              borderRadius: 2,
              bgcolor: '#1e1e1e',
              color: '#fff'
            }}
          >
            <Typography variant="h4" gutterBottom color="error">
              Something went wrong
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              An error occurred in the application. Please try refreshing the page.
              If the problem persists, contact support.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained"
                color="primary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              
              <Button 
                variant="outlined"
                color="error"
                onClick={this.handleReset}
              >
                Reset & Go Home
              </Button>
            </Box>
            
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Error Details (Development Only)
                </Typography>
                <Typography variant="caption" component="pre" sx={{ 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  color: '#aaa'
                }}>
                  {this.state.error && this.state.error.toString()}
                </Typography>
                
                <Typography variant="caption" component="pre" sx={{ 
                  mt: 2,
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  color: '#888'
                }}>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;