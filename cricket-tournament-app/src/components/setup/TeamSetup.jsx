import {  motion,AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './TeamSetup.module.css';


const TeamSetup = ({ numberOfTeams, onTeamsSubmit }) => {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize teams array based on numberOfTeams
    const initialTeams = Array(numberOfTeams).fill().map((_, index) => ({
      id: `team-${index + 1}`,
      name: '',
      shortName: '',
      budget: 10000000, // 10 Crore default budget
      captain: '',
      logo: null
    }));
    setTeams(initialTeams);
  }, [numberOfTeams]);

  const handleInputChange = (index, field, value) => {
    setTeams(prevTeams => {
      const newTeams = [...prevTeams];
      newTeams[index] = {
        ...newTeams[index],
        [field]: value
      };
      return newTeams;
    });
    setError('');
  };

  const handleLogoUpload = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange(index, 'logo', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateTeams = () => {
    for (const team of teams) {
      if (!team.name || !team.shortName || !team.captain) {
        setError('Please fill in all required fields for all teams');
        return false;
      }
      if (team.name.length < 3) {
        setError('Team names must be at least 3 characters long');
        return false;
      }
      if (team.shortName.length !== 3) {
        setError('Team short names must be exactly 3 characters');
        return false;
      }
    }
    
    const teamNames = teams.map(team => team.name.toLowerCase());
    if (new Set(teamNames).size !== teamNames.length) {
      setError('Team names must be unique');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateTeams()) {
      onTeamsSubmit(teams);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const teamVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <motion.div
      className={styles.teamSetup}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className={styles.title}>Team Setup</h2>
      
      {error && (
        <motion.div 
          className={styles.error}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        <AnimatePresence>
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              className={styles.teamCard}
              variants={teamVariants}
            >
              <h3>Team {index + 1}</h3>
              
              <div className={styles.inputGroup}>
                <label htmlFor={`name-${index}`}>Team Name</label>
                <input
                  id={`name-${index}`}
                  type="text"
                  value={team.name}
                  onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                  placeholder="Enter team name"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor={`shortName-${index}`}>Short Name (3 chars)</label>
                <input
                  id={`shortName-${index}`}
                  type="text"
                  value={team.shortName}
                  onChange={(e) => handleInputChange(index, 'shortName', e.target.value.toUpperCase().slice(0, 3))}
                  placeholder="XXX"
                  maxLength={3}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor={`captain-${index}`}>Captain Name</label>
                <input
                  id={`captain-${index}`}
                  type="text"
                  value={team.captain}
                  onChange={(e) => handleInputChange(index, 'captain', e.target.value)}
                  placeholder="Enter captain name"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor={`budget-${index}`}>Budget (₹)</label>
                <input
                  id={`budget-${index}`}
                  type="number"
                  value={team.budget}
                  onChange={(e) => handleInputChange(index, 'budget', Number(e.target.value))}
                  min="1000000"
                  max="100000000"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor={`logo-${index}`}>Team Logo</label>
                <input
                  id={`logo-${index}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(index, e.target.files[0])}
                />
                {team.logo && (
                  <img
                    src={team.logo}
                    alt={`${team.name} logo`}
                    className={styles.logoPreview}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          type="submit"
          className={styles.submitButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue to Player Setup
        </motion.button>
      </form>
    </motion.div>
  );
};

TeamSetup.propTypes = {
  numberOfTeams: PropTypes.number.isRequired,
  onTeamsSubmit: PropTypes.func.isRequired
};

export default TeamSetup;