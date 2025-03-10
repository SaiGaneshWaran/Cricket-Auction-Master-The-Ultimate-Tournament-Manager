import {  AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './PointsTable.module.css';

const PointsTable = ({ matches }) => {
  const [tableData, setTableData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'points',
    direction: 'desc'
  });

  useEffect(() => {
    calculatePoints();
  }, [matches]);

  const calculatePoints = () => {
    const pointsMap = new Map();

    matches.forEach(match => {
      if (match.status !== 'COMPLETED') return;

      const winner = match.winner;
      const loser = match.winner === match.team1 ? match.team2 : match.team1;

      // Initialize team data if not exists
      if (!pointsMap.has(winner)) {
        pointsMap.set(winner, createInitialTeamStats());
      }
      if (!pointsMap.has(loser)) {
        pointsMap.set(loser, createInitialTeamStats());
      }

      // Update winner stats
      const winnerStats = pointsMap.get(winner);
      winnerStats.matches++;
      winnerStats.wins++;
      winnerStats.points += 2;
      updateNRR(winnerStats, match, winner);

      // Update loser stats
      const loserStats = pointsMap.get(loser);
      loserStats.matches++;
      loserStats.losses++;
      updateNRR(loserStats, match, loser);
    });

    const sortedData = Array.from(pointsMap.entries()).map(([team, stats]) => ({
      team,
      ...stats
    }));

    sortData(sortedData);
  };

  const createInitialTeamStats = () => ({
    matches: 0,
    wins: 0,
    losses: 0,
    nrr: 0,
    points: 0
  });

  const updateNRR = (stats, match, team) => {
    const isTeam1 = team === match.team1;
    const runsScored = isTeam1 ? match.team1Score.runs : match.team2Score.runs;
    const oversPlayed = isTeam1 ? match.team1Score.overs : match.team2Score.overs;
    const runsConceded = isTeam1 ? match.team2Score.runs : match.team1Score.runs;
    const oversBowled = isTeam1 ? match.team2Score.overs : match.team1Score.overs;

    stats.nrr = ((runsScored / oversPlayed) - (runsConceded / oversBowled)).toFixed(3);
  };

  const sortData = (data) => {
    const sorted = [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setTableData(sorted);
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className={styles.pointsTableContainer}>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.title}
      >
        Points Table
      </motion.h2>

      <motion.table
        className={styles.pointsTable}
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        <thead>
          <tr>
            <th onClick={() => handleSort('team')}>Team</th>
            <th onClick={() => handleSort('matches')}>M</th>
            <th onClick={() => handleSort('wins')}>W</th>
            <th onClick={() => handleSort('losses')}>L</th>
            <th onClick={() => handleSort('nrr')}>NRR</th>
            <th onClick={() => handleSort('points')}>Pts</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {tableData.map((team, index) => (
              <motion.tr
                key={team.team}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: 20 }}
                className={index < 4 ? styles.qualifyingTeam : ''}
              >
                <td>{team.team}</td>
                <td>{team.matches}</td>
                <td>{team.wins}</td>
                <td>{team.losses}</td>
                <td>{team.nrr}</td>
                <td>{team.points}</td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </motion.table>
    </div>
  );
};

PointsTable.propTypes = {
  matches: PropTypes.arrayOf(
    PropTypes.shape({
      team1: PropTypes.string.isRequired,
      team2: PropTypes.string.isRequired,
      winner: PropTypes.string,
      status: PropTypes.string.isRequired,
      team1Score: PropTypes.shape({
        runs: PropTypes.number.isRequired,
        overs: PropTypes.number.isRequired
      }),
      team2Score: PropTypes.shape({
        runs: PropTypes.number.isRequired,
        overs: PropTypes.number.isRequired
      })
    })
  ).isRequired
};

export default PointsTable;