import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const defaultColors = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#84cc16', // lime-500
];

const TeamConfig = ({ numTeams, teams, onTeamsUpdate }) => {
  const [teamsList, setTeamsList] = useState([]);

  useEffect(() => {
    // Initialize teams if not already set
    if (!teams || teams.length === 0) {
      const initialTeams = Array(numTeams).fill().map((_, i) => ({
        name: `Team ${i + 1}`,
        color: defaultColors[i % defaultColors.length],
        logo: null
      }));
      setTeamsList(initialTeams);
      onTeamsUpdate(initialTeams);
    } else if (teams.length !== numTeams) {
      // Adjust team count if needed
      let newTeams = [...teams];
      
      if (teams.length < numTeams) {
        // Add more teams
        for (let i = teams.length; i < numTeams; i++) {
          newTeams.push({
            name: `Team ${i + 1}`,
            color: defaultColors[i % defaultColors.length],
            logo: null
          });
        }
      } else {
        // Remove extra teams
        newTeams = newTeams.slice(0, numTeams);
      }
      
      setTeamsList(newTeams);
      onTeamsUpdate(newTeams);
    } else {
      setTeamsList(teams);
    }
  }, [numTeams, teams, onTeamsUpdate]);

  const updateTeam = (index, field, value) => {
    const updatedTeams = [...teamsList];
    updatedTeams[index] = {
      ...updatedTeams[index],
      [field]: value
    };
    setTeamsList(updatedTeams);
    onTeamsUpdate(updatedTeams);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-6">Configure Teams</h3>
      
      <div className="space-y-6">
        {teamsList.map((team, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800 p-4 rounded-lg border border-slate-700"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: team.color }}
              >
                <span className="text-white font-bold">
                  {team.name.substring(0, 2)}
                </span>
              </div>
              
              <div className="flex-grow">
                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => updateTeam(index, 'name', e.target.value)}
                  placeholder="Team Name"
                  className="w-full px-4 py-2 bg-slate-900 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
                />
              </div>
              
              <div>
                <input
                  type="color"
                  value={team.color}
                  onChange={(e) => updateTeam(index, 'color', e.target.value)}
                  className="w-10 h-10 rounded-full border-2 border-slate-600 cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeamConfig;