import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTournament } from '../../contexts/TournamentContext';
import Button from '../common/Button';
import Card from '../common/Card';
import TeamConfig from '../tournament/TeamConfig';
import PlayerPool from '../tournament/PlayerPool';

const steps = [
  { id: 'basics', title: 'Tournament Basics' },
  { id: 'teams', title: 'Team Setup' },
  { id: 'players', title: 'Player Pool' },
  { id: 'review', title: 'Review & Create' }
];

const CreateTournament = ({ onBack }) => {
  const navigate = useNavigate();
  const { createTournament, getTournament } = useTournament();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tournamentData, setTournamentData] = useState({
    name: '',
    numTeams: 6,
    teamBudget: 15,
    teams: [],
    playerPool: {
      batsmen: 25,
      bowlers: 25,
      allRounders: 20,
      wicketKeepers: 10
    }
  });
  const [importCode, setImportCode] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If changing team budget, also update all team budgets
    if (name === 'teamBudget') {
      const newBudget = parseFloat(value);
      
      // Update each team's budget if teams exist
      if (tournamentData.teams.length > 0) {
        const updatedTeams = tournamentData.teams.map(team => ({
          ...team,
          budget: newBudget
        }));
        
        setTournamentData(prev => ({
          ...prev,
          [name]: newBudget,
          teams: updatedTeams
        }));
      } else {
        setTournamentData(prev => ({
          ...prev,
          [name]: newBudget
        }));
      }
    } else {
      setTournamentData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTeamsUpdate = (teams) => {
    // Ensure each team has the correct budget set
    const updatedTeams = teams.map(team => ({
      ...team,
      budget: parseFloat(tournamentData.teamBudget)
    }));
    
    setTournamentData(prev => ({
      ...prev,
      teams: updatedTeams
    }));
    
    console.log('Updated teams with budget:', updatedTeams);
  };

  const handlePlayerPoolUpdate = (playerPool) => {
    setTournamentData(prev => ({
      ...prev,
      playerPool
    }));
  };

  const handleNext = () => {
    if (currentStep === 0 && !tournamentData.name) {
      toast.error('Please enter a tournament name');
      return;
    }
    
    if (currentStep === 1 && tournamentData.teams.length !== parseInt(tournamentData.numTeams)) {
      toast.error('Please configure all teams');
      return;
    }
    
    // If moving to the team setup step, pre-initialize teams with budget
    if (currentStep === 0 && tournamentData.teams.length === 0) {
      // Pre-initialize teams with the budget
      const numTeams = parseInt(tournamentData.numTeams);
      const preInitializedTeams = Array(numTeams).fill(null).map((_, index) => ({
        id: `team-${Date.now()}-${index}`,
        name: `Team ${index + 1}`,
        color: '#1e88e5', // Default blue color
        budget: parseFloat(tournamentData.teamBudget)
      }));
      
      setTournamentData(prev => ({
        ...prev,
        teams: preInitializedTeams
      }));
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onBack && onBack();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Final validation
      if (!tournamentData.name) {
        toast.error('Tournament name is required');
        setIsSubmitting(false);
        return;
      }
      
      if (tournamentData.teams.length !== parseInt(tournamentData.numTeams)) {
        toast.error('Please configure all teams');
        setIsSubmitting(false);
        return;
      }
      
      // Final check to ensure all teams have budgets
      const teamsWithBudgets = tournamentData.teams.map(team => {
        if (!team.budget) {
          return {
            ...team,
            budget: parseFloat(tournamentData.teamBudget)
          };
        }
        return team;
      });
      
      const finalData = {
        ...tournamentData,
        teams: teamsWithBudgets
      };
      
      console.log('Creating tournament with data:', JSON.stringify(finalData));
      
      // Create tournament
      const result = await createTournament(finalData);
      
      console.log('Tournament creation result:', result);
      
      if (!result || !result.tournamentId) {
        throw new Error('Failed to create tournament: Invalid response');
      }
      
      const { tournamentId, captainCode, viewerCode } = result;
      
      // Get full tournament data for export
      const tournament = await getTournament(tournamentId);
      
      // Generate export code for sharing across ports
      const exportCode = btoa(JSON.stringify(tournament));
      
      // Store in sessionStorage for easy access later
      sessionStorage.setItem('lastCreatedTournament', exportCode);
      
      // Show success message with codes and export button
      toast.success(
        <div>
          Tournament created successfully!<br />
          Captain Code: <strong>{captainCode}</strong><br />
          Viewer Code: <strong>{viewerCode}</strong><br />
          <button 
            onClick={() => {
              navigator.clipboard.writeText(exportCode);
              toast.info('Tournament code copied to clipboard! Use the DevTools on another port to import it.');
            }}
            className="mt-2 px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-sm w-full"
          >
            Copy Tournament Code for Import
          </button>
        </div>, 
        { autoClose: false }
      );
      
      // Navigate to tournament page with replace
      navigate(`/tournament/${tournamentId}`, { 
        state: { 
          captainCode, 
          viewerCode,
          isCreator: true,
          exportCode, // Include export code in navigation state
          _timestamp: Date.now() // Add timestamp to ensure unique state
        },
        replace: true
      });
    } catch (error) {
      console.error('Tournament creation error:', error);
      toast.error(`Failed to create tournament: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete handleImport function
  const handleImport = () => {
    try {
      // Validate input
      if (!importCode.trim()) {
        toast.error('Please paste a tournament code first');
        return;
      }
      
      // Decode from base64
      let tournamentData;
      try {
        tournamentData = JSON.parse(atob(importCode.trim()));
      } catch (e) {
        toast.error('Invalid tournament code format');
        return;
      }
      
      // Validate basic structure
      if (!tournamentData.id || !tournamentData.name) {
        toast.error('Invalid tournament data structure');
        return;
      }
      
      // Get existing tournaments from localStorage
      const storageKey = 'cricket_tournaments';
      let storedItem = localStorage.getItem(storageKey);
      let existingData = {};
      
      if (storedItem) {
        try {
          const storageObj = JSON.parse(storedItem);
          existingData = storageObj.data || {};
        } catch (e) {
          console.error('Error parsing existing tournaments', e);
        }
      }
      
      // Check if tournament already exists
      if (existingData[tournamentData.id]) {
        toast.info(`Tournament "${tournamentData.name}" already exists`);
        return;
      }
      
      // Add new tournament
      existingData[tournamentData.id] = tournamentData;
      
      // Save back to localStorage
      const saveObject = {
        data: existingData,
        timestamp: Date.now()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(saveObject));
      
      // Clear input and show success
      setImportCode('');
      toast.success(`Tournament "${tournamentData.name}" imported successfully!`);
      
      // Reload to update state
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import tournament: ' + (error.message || 'Unknown error'));
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-5xl"
    >
      <div className="mb-8 flex items-center justify-between">
        <Button 
          variant="glass" 
          onClick={handleBack}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          }
          iconPosition="left"
        >
          Back
        </Button>
        
        <h2 className="text-3xl font-bold text-center text-white">Create Your Tournament</h2>
        
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${currentStep >= index ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-300'}
                ${currentStep > index ? 'bg-green-500' : ''}
              `}>
                {currentStep > index ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs mt-2 ${currentStep >= index ? 'text-white' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute h-1 bg-gray-700 top-0 left-0 right-0 rounded-full"></div>
          <div 
            className="absolute h-1 bg-gradient-to-r from-yellow-500 to-red-500 top-0 left-0 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      <Card variant="glass" className="mb-8">
        {currentStep === 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Tournament Basics</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Tournament Name</label>
                <input
                  type="text"
                  name="name"
                  value={tournamentData.name}
                  onChange={handleInputChange}
                  placeholder="Weekend Warriors League"
                  className="w-full px-4 py-3 bg-slate-800 rounded-lg border border-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Number of Teams</label>
                <div className="relative">
                  <select
                    name="numTeams"
                    value={tournamentData.numTeams}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800 rounded-lg border border-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition text-white appearance-none"
                  >
                    {[4, 5, 6, 8, 10].map(num => (
                      <option key={num} value={num}>{num} Teams</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Team Budget (in Crore ₹)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    name="teamBudget"
                    min="10"
                    max="80"
                    step="0.5"
                    value={tournamentData.teamBudget}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-blue-900 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-white font-bold">{tournamentData.teamBudget} Cr</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 1 && (
          <TeamConfig 
            numTeams={parseInt(tournamentData.numTeams)}
            teams={tournamentData.teams}
            onTeamsUpdate={handleTeamsUpdate}
            teamBudget={tournamentData.teamBudget} // Pass the team budget to TeamConfig
          />
        )}
        
        {currentStep === 2 && (
          <PlayerPool 
            teamBudget={tournamentData.teamBudget}
            playerPool={tournamentData.playerPool}
            onPlayerPoolUpdate={handlePlayerPoolUpdate}
          />
        )}
        
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Review & Create</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-blue-300 mb-3">Tournament Details</h4>
                <div className="bg-slate-800 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Name:</span>
                    <p className="text-white font-semibold">{tournamentData.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Teams:</span>
                    <p className="text-white font-semibold">{tournamentData.numTeams}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Budget per Team:</span>
                    <p className="text-white font-semibold">{tournamentData.teamBudget} Crore ₹</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-blue-300 mb-3">Player Pool</h4>
                <div className="bg-slate-800 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Batsmen:</span>
                    <p className="text-white font-semibold">{tournamentData.playerPool.batsmen}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Bowlers:</span>
                    <p className="text-white font-semibold">{tournamentData.playerPool.bowlers}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">All-Rounders:</span>
                    <p className="text-white font-semibold">{tournamentData.playerPool.allRounders}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Wicket-Keepers:</span>
                    <p className="text-white font-semibold">{tournamentData.playerPool.wicketKeepers}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-blue-300 mb-3">Teams</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tournamentData.teams.map((team, index) => (
                  <div key={index} className="bg-slate-800 rounded-lg p-4">
                    <div 
                      className="h-3 w-3/4 mb-2 rounded-full" 
                      style={{ backgroundColor: team.color }}
                    ></div>
                    <p className="text-white font-semibold">{team.name}</p>
                    <p className="text-gray-400 text-xs mt-1">Budget: {team.budget} Cr</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg">
              <p className="text-yellow-300 text-sm">
                <span className="font-bold">Note:</span> Once you create the tournament, you'll receive unique codes for captains and viewers to join. These codes will only be shown once, so please save them!
              </p>
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button
          variant="glass"
          onClick={handleBack}
        >
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button
            variant="primary"
            onClick={handleNext}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={isSubmitting}
            icon={
              isSubmitting ? (
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )
            }
            iconPosition="right"
          >
            {isSubmitting ? 'Creating...' : 'Create Tournament'}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default CreateTournament;