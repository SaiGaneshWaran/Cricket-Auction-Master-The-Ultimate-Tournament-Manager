
import { useState } from 'react';
import TeamSetup from './TeamSetup';
import styles from './TournamentSetup.module.css';

const TournamentSetup = () => {
  const [step, setStep] = useState(1);
  const [tournamentData, setTournamentData] = useState({
    name: '',
    format: 'T20',
    numberOfTeams: 8,
    playersPerTeam: 15,
    maxOversPerInnings: 20
  });

  const handleInputChange = (field, value) => {
    setTournamentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInitialSetup = (e) => {
    e.preventDefault();
    if (validateInitialSetup()) {
      setStep(2);
    }
  };

  const validateInitialSetup = () => {
    return (
      tournamentData.name.length >= 3 &&
      tournamentData.numberOfTeams >= 4 &&
      tournamentData.numberOfTeams <= 16 &&
      tournamentData.playersPerTeam >= 11
    );
  };

  const handleTeamsSubmit = (teams) => {
    // Save tournament and teams data to localStorage
    const tournamentConfig = {
      ...tournamentData,
      teams,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('tournamentConfig', JSON.stringify(tournamentConfig));
    
    // Navigate to auction page
    window.location.href = '/auction';
  };

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {step === 1 ? (
          <form onSubmit={handleInitialSetup} className={styles.setupForm}>
            <h1>Tournament Setup</h1>
            
            <div className={styles.formGroup}>
              <label htmlFor="tournamentName">Tournament Name</label>
              <input
                id="tournamentName"
                type="text"
                value={tournamentData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter tournament name"
                required
                minLength={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="format">Format</label>
              <select
                id="format"
                value={tournamentData.format}
                onChange={(e) => handleInputChange('format', e.target.value)}
              >
                <option value="T20">T20</option>
                <option value="ODI">ODI</option>
                <option value="Test">Test</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="numberOfTeams">Number of Teams</label>
              <input
                id="numberOfTeams"
                type="number"
                value={tournamentData.numberOfTeams}
                onChange={(e) => handleInputChange('numberOfTeams', parseInt(e.target.value))}
                min={4}
                max={16}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="playersPerTeam">Players per Team</label>
              <input
                id="playersPerTeam"
                type="number"
                value={tournamentData.playersPerTeam}
                onChange={(e) => handleInputChange('playersPerTeam', parseInt(e.target.value))}
                min={11}
                max={25}
                required
              />
            </div>

            <motion.button
              type="submit"
              className={styles.submitButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!validateInitialSetup()}
            >
              Continue to Team Setup
            </motion.button>
          </form>
        ) : (
          <TeamSetup
            numberOfTeams={tournamentData.numberOfTeams}
            onTeamsSubmit={handleTeamsSubmit}
          />
        )}
      </motion.div>
    </div>
  );
};

export default TournamentSetup;