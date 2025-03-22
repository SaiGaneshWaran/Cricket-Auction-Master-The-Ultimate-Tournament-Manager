import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { HexColorPicker } from 'react-colorful';
import { Popover } from '@headlessui/react';

const TeamConfig = ({ numTeams, teams = [], onTeamsUpdate, teamBudget }) => {
  const [localTeams, setLocalTeams] = useState([]);

  // Initialize teams if they don't exist yet
  useEffect(() => {
    if (teams.length === numTeams) {
      // Teams are already configured, just make sure they have budgets
      const updatedTeams = teams.map(team => ({
        ...team,
        budget: team.budget || parseFloat(teamBudget) // Ensure budget is set
      }));
      setLocalTeams(updatedTeams);
    } else {
      // Create default teams
      const newTeams = Array(numTeams).fill(null).map((_, index) => {
        // Use existing team if available, otherwise create new
        const existingTeam = teams[index];
        if (existingTeam) {
          return {
            ...existingTeam,
            budget: existingTeam.budget || parseFloat(teamBudget)
          };
        }
        
        return {
          id: `team-${Date.now()}-${index}`,
          name: `Team ${index + 1}`,
          color: getRandomColor(),
          budget: parseFloat(teamBudget) // Set the budget from the prop
        };
      });
      setLocalTeams(newTeams);
      onTeamsUpdate(newTeams); // Update parent state immediately
    }
  }, [numTeams, teams, teamBudget]);

  // Generate a random color
  const getRandomColor = () => {
    const colors = [
      '#f44336', // Red
      '#e91e63', // Pink
      '#9c27b0', // Purple
      '#673ab7', // Deep Purple
      '#3f51b5', // Indigo
      '#2196f3', // Blue
      '#03a9f4', // Light Blue
      '#00bcd4', // Cyan
      '#009688', // Teal
      '#4caf50', // Green
      '#8bc34a', // Light Green
      '#cddc39', // Lime
      '#ffc107', // Amber
      '#ff9800', // Orange
      '#ff5722'  // Deep Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handle team updates
  const handleTeamUpdate = (index, field, value) => {
    const updatedTeams = [...localTeams];
    updatedTeams[index] = {
      ...updatedTeams[index],
      [field]: value,
      budget: parseFloat(teamBudget) // Ensure budget is always set
    };
    setLocalTeams(updatedTeams);
    onTeamsUpdate(updatedTeams);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Configure Your Teams</h3>
      <div className="space-y-4">
        {localTeams.map((team, index) => (
          <div 
            key={index} 
            className="p-4 bg-slate-800 rounded-lg border border-slate-700 transition-all hover:border-blue-500"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Color picker */}
              <div className="w-full md:w-1/6">
                <label className="block text-sm font-medium text-blue-300 mb-2">Team Color</label>
                <Popover className="relative">
                  <Popover.Button className="w-full h-12 rounded cursor-pointer border-2 border-white"
                    style={{ backgroundColor: team.color }}
                  />
                  
                  <Popover.Panel className="absolute z-10 mt-2">
                    <HexColorPicker 
                      color={team.color} 
                      onChange={(color) => handleTeamUpdate(index, 'color', color)} 
                    />
                  </Popover.Panel>
                </Popover>
              </div>
              
              {/* Team name */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-blue-300 mb-2">Team Name</label>
                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => handleTeamUpdate(index, 'name', e.target.value)}
                  placeholder="Team Name"
                  className="w-full px-4 py-3 bg-slate-900 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
                />
              </div>
              
              {/* Team Budget (display only) */}
              <div className="w-full md:w-1/4">
                <label className="block text-sm font-medium text-blue-300 mb-2">Team Budget</label>
                <input
                  type="text"
                  value={`₹${team.budget} Cr`}
                  disabled
                  className="w-full px-4 py-3 bg-slate-900 rounded-lg border border-slate-700 text-white opacity-70"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-800 rounded-lg">
        <p className="text-blue-300 text-sm">
          <span className="font-bold">Tip:</span> Give your teams distinctive colors and meaningful names to make your tournament more engaging!
        </p>
      </div>
    </div>
  );
};

export default TeamConfig;