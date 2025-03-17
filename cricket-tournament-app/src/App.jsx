import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { TournamentProvider } from './contexts/TournamentContext.jsx';
import { AuctionProvider } from './contexts/AuctionContext.jsx';
import { MatchProvider } from './contexts/MatchContext.jsx';

// Pages
import Home from './pages/Home';
import Tournament from './pages/Tournament';
import Auction from './pages/Auction';
import Analysis from './pages/Analysis';
import Matches from './pages/Matches';
import Dashboard from './pages/Dashboard';

// Components
import Loader from './components/common/Loader';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    
      <TournamentProvider>
        <AuctionProvider>
          <MatchProvider>
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tournament/:tournamentId" element={<Tournament />} />
                  <Route path="/auction/:auctionId" element={<Auction />} />
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
            </div>
          </MatchProvider>
        </AuctionProvider>
      </TournamentProvider>
    
  );
}

export default App;