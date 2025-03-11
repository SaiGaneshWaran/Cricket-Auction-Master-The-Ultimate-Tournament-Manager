import { useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/auctionHelper';
import './TeamBalance.module.css';

const TeamBalance = ({ teams = [], currentTeamId = null }) => {
  const [showAllTeams, setShowAllTeams] = useState(false);
  
  // Find current team
  const currentTeam = currentTeamId 
    ? teams.find(team => team.id === currentTeamId) 
    : null;
  
  // Calculate budget percentage for progress bar
  const getBudgetPercentage = (team) => {
    if (!team || !team.budget) return 0;
    return ((team.budget - team.remainingBudget) / team.budget) * 100;
  };
  
  // Calculate slots percentage for progress bar
  const getSlotsPercentage = (team) => {
    if (!team || !team.slots) return 0;
    return ((team.slots.total - team.slots.remaining) / team.slots.total) * 100;
  };
  
  return (
    <div className="team-balance-container">
      {currentTeam && (
        <motion.div 
          className="current-team-balance"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="team-header">
            <h3>{currentTeam.name}</h3>
            <div className="team-icon">{currentTeam.icon}</div>
          </div>
          
          <div className="balance-stats">
            <div className="stat-item">
              <span className="stat-label">Budget</span>
              <div className="stat-value">
                <span className="value-number">{formatCurrency(currentTeam.remainingBudget)}</span>
                <span className="value-total">/ {formatCurrency(currentTeam.budget)}</span>
              </div>
              
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${getBudgetPercentage(currentTeam)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Players</span>
              <div className="stat-value">
                <span className="value-number">
                  {currentTeam.slots.total - currentTeam.slots.remaining}
                </span>
                <span className="value-total">/ {currentTeam.slots.total}</span>
              </div>
              
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${getSlotsPercentage(currentTeam)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="player-breakdown">
            <h4>Team Roster</h4>
            {currentTeam.players.length > 0 ? (
              <ul className="player-list">
                {currentTeam.players.map(player => (
                  <li key={player.id} className="player-item">
                    <div className="player-info">
                      <span className="player-name">{player.name}</span>
                      <span className="player-role">{player.role}</span>
                    </div>
                    <span className="player-price">{formatCurrency(player.purchasePrice)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-players">No players purchased yet</p>
            )}
          </div>
        </motion.div>
      )}
      
      <div className="all-teams-balance">
        <div className="section-header">
          <h3>Team Balances</h3>
          <button 
            className="toggle-button"
            onClick={() => setShowAllTeams(!showAllTeams)}
          >
            {showAllTeams ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        <div className="teams-table-container">
          <table className="teams-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Budget</th>
                <th>Players</th>
                {showAllTeams && <th>Spent</th>}
              </tr>
            </thead>
            <tbody>
              {teams.map(team => (
                <tr 
                  key={team.id} 
                  className={team.id === currentTeamId ? 'current-team-row' : ''}
                >
                  <td className="team-name-cell">
                    <span className="team-icon">{team.icon}</span>
                    <span className="team-name">{team.name}</span>
                  </td>
                  <td>
                    {formatCurrency(team.remainingBudget)}
                  </td>
                  <td>
                    {team.slots.total - team.slots.remaining}/{team.slots.total}
                  </td>
                  {showAllTeams && (
                    <td className="spent-amount">
                      {formatCurrency(team.budget - team.remainingBudget)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

TeamBalance.propTypes = {
  teams: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string,
      budget: PropTypes.number.isRequired,
      remainingBudget: PropTypes.number.isRequired,
      players: PropTypes.array.isRequired,
      slots: PropTypes.shape({
        total: PropTypes.number.isRequired,
        remaining: PropTypes.number.isRequired
      }).isRequired
    })
  ).isRequired,
  currentTeamId: PropTypes.string
};

export default TeamBalance;