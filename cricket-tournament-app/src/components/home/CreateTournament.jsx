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
  const { createTournament } = useTournament();
  const [currentStep, setCurrentStep] = useState(0);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTournamentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamsUpdate = (teams) => {
    setTournamentData(prev => ({
      ...prev,
      teams
    }));
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
    
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onBack();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    try {
      const { tournamentId, captainCode, viewerCode } = createTournament(tournamentData);
      
      // Show success message with codes
      toast.success('Tournament created successfully!');
      
      // Navigate to tournament page
      navigate(`/tournament/${tournamentId}`, { 
        state: { 
          captainCode, 
          viewerCode,
          isCreator: true
        } 
      });
    } catch (error) {
      toast.error('Failed to create tournament: ' + error.message);
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
                    max="20"
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
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            }
            iconPosition="right"
          >
            Create Tournament
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default CreateTournament;