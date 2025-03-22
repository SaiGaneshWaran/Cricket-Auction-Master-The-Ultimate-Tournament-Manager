// Add all necessary imports
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import providers
import { TournamentProvider } from './contexts/TournamentContext';
import { AuctionProvider } from './contexts/AuctionContext';
import { AuthProvider } from './contexts/AuthContext';
import { MatchProvider } from './contexts/MatchContext';

// Import components
import Home from './pages/Home';
import Tournament from './pages/Tournament';
import Auction from './pages/Auction';
import Analysis from './pages/Analysis';
import Matches from './pages/Matches';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/common/ErrorBoundary';
import DevTools from './components/dev/DevTools';

function App() {
  return (
    <TournamentProvider>
      <AuctionProvider>
        <AuthProvider>
          <MatchProvider>
            <ErrorBoundary>
              <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/tournament/:tournamentId" element={<Tournament />} />
                    <Route path="/auction/:tournamentId" element={<Auction />} />
                    <Route path="/analysis/:tournamentId" element={<Analysis />} />
                    <Route path="/matches/:tournamentId" element={<Matches />} />
                    <Route path="/dashboard/:tournamentId" element={<Dashboard />} />
                  </Routes>
                </AnimatePresence>
                <ToastContainer 
                  position="bottom-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
                />
                {process.env.NODE_ENV === 'development' && <DevTools />}
              </div>
            </ErrorBoundary>
          </MatchProvider>
        </AuthProvider>
      </AuctionProvider>
    </TournamentProvider>
  );
}

export default App;