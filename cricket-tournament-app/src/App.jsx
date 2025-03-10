import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/shared/Layout';
import AuctionRoom from './components/auction/AuctionRoom';
import TournamentSetup from './components/setup/TournamentSetup';
import TeamSetup from './components/setup/TeamSetup';
import LiveScoreboard from './components/match/LiveScoreboard';
import MatchSimulator from './components/match/MatchSimulator';
import PointsTable from './components/match/PointsTable';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<TournamentSetup />} />
          <Route path="/setup/teams" element={<TeamSetup />} />
          <Route path="/auction" element={<AuctionRoom />} />
          <Route path="/matches">
            <Route index element={<PointsTable />} />
            <Route path="live/:matchId" element={<LiveScoreboard />} />
            <Route path="simulate/:matchId" element={<MatchSimulator />} />
          </Route>
          <Route path="*" element={
            <div className="not-found">
              <h2>404 - Page Not Found</h2>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;