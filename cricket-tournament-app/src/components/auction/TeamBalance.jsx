import { motion,AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './TeamBalance.module.css';


const TeamBalance = ({ onBid, highestBidder,currentBid }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    selected: {
      scale: 1.05,
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
    }
  };

  useEffect(() => {
    const loadTeams = () => {
      const savedTeams = JSON.parse(localStorage.getItem('teams') || '[]');
      setTeams(savedTeams);
    };

    loadTeams();
    window.addEventListener('storage', loadTeams);
    return () => window.removeEventListener('storage', loadTeams);
  }, []);

  const handleBidSubmit = () => {
    const minBid = calculateNextMinBid(currentBid);
    if (selectedTeam && bidAmount && Number(bidAmount) >= minBid) {
      onBid(selectedTeam, Number(bidAmount));
      setBidAmount('');
    }
  };

  const calculateNextMinBid = (currentBid) => {
    return Math.ceil(currentBid * 1.05); // 5% increment
  };

  return (
    <div className={styles.teamBalance}>
      <h3 className={styles.title}>Team Balances</h3>
      <div className={styles.teamsGrid}>
        <AnimatePresence>
          {teams.map(team => (
            <motion.div
              key={team.id}
              className={`${styles.teamCard} ${selectedTeam === team.id ? styles.selected : ''} ${team.id === highestBidder ? styles.highestBidder : ''}`}
              variants={cardVariants}
              initial="hidden"
              animate={selectedTeam === team.id ? "selected" : "visible"}
              whileHover="selected"
              onClick={() => setSelectedTeam(team.id)}
            >
              <h4>{team.name}</h4>
              <div className={styles.balanceInfo}>
                <p className={styles.budget}>
                  ₹{team.budget.toLocaleString()}
                  <span>Remaining Budget</span>
                </p>
                <p className={styles.players}>
                  {team.players.length}
                  <span>Players</span>
                </p>
                <p className={styles.slots}>
                  {team.maxPlayers - team.players.length}
                  <span>Slots Left</span>
                </p>
              </div>
              
              {selectedTeam === team.id && (
                <motion.div
                  className={styles.bidControls}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p className={styles.minBid}>
                    Minimum bid: ₹{calculateNextMinBid(currentBid).toLocaleString()}
                  </p>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter bid amount"
                    className={styles.bidInput}
                    min={calculateNextMinBid(currentBid)}
                  />
                  <motion.button
                    onClick={handleBidSubmit}
                    className={styles.bidButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={
                      !bidAmount || 
                      Number(bidAmount) < calculateNextMinBid(currentBid) || 
                      team.id === highestBidder
                    }
                  >
                    Place Bid
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

TeamBalance.propTypes = {
  onBid: PropTypes.func.isRequired,
  highestBidder: PropTypes.string,
  currentBid: PropTypes.number.isRequired
};

TeamBalance.defaultProps = {
  highestBidder: null,
  currentBid: 0
};

export default TeamBalance;