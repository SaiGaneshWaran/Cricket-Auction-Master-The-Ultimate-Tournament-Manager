
import { useState, useEffect } from 'react';

const TeamBalance = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  useEffect(() => {
    // Load teams from localStorage
    const savedTeams = JSON.parse(localStorage.getItem('teams') || '[]');
    setTeams(savedTeams);
  }, []);

  return (
    <div className="team-balance-container">
      <h3>Team Balances</h3>
      <div className="teams-grid">
        {teams.map(team => (
          <motion.div
            key={team.id}
            className={`team-card ${selectedTeam === team.id ? 'selected' : ''}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedTeam(team.id)}
          >
            <h4>{team.name}</h4>
            <div className="balance-info">
              <p>Remaining Budget: ₹{team.budget}</p>
              <p>Players: {team.players.length}</p>
              <p>Slots Left: {team.maxPlayers - team.players.length}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeamBalance;