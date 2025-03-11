import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/shared/Layout';
import TournamentSetup from './components/setup/TournamentSetup';
import TeamSetup from './components/setup/TeamSetup';
import AuctionRoom from './components/auction/AuctionRoom';
import MatchSimulator from './components/match/MatchSimulator';
import LiveScoreboard from './components/match/LiveScoreboard';
import PointsTable from './components/match/PointsTable';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';

function App() {
  const [tournamentData, setTournamentData] = useLocalStorage('tournamentData', null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={
            tournamentData ? 
              <PointsTable /> : 
              <TournamentSetup setTournamentData={setTournamentData} />
          } />
          <Route path="setup">
            <Route path="tournament" element={<TournamentSetup setTournamentData={setTournamentData} />} />
            <Route path="teams" element={<TeamSetup />} />
          </Route>
          <Route path="auction" element={<AuctionRoom />} />
          <Route path="auction/:roomId" element={<AuctionRoom />} />
          <Route path="match">
            <Route path="simulate" element={<MatchSimulator />} />
            <Route path="scoreboard" element={<LiveScoreboard />} />
            <Route path="points" element={<PointsTable />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;