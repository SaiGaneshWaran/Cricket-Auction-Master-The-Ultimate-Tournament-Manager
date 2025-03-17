import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useMatch } from '../../contexts/MatchContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';

const MatchScheduler = ({ tournamentId, teams = [] }) => {
  const { createMatch } = useMatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState({ team1: '', team2: '' });
  const [matchDetails, setMatchDetails] = useState({
    venue: 'Home Ground',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    matchType: 'league'
  });
  
  // Match types
  const matchTypes = [
    { id: 'league', label: 'League Match' },
    { id: 'elimination', label: 'Elimination Match' },
    { id: 'semifinal', label: 'Semi Final' },
    { id: 'final', label: 'Final' }
  ];
  
  // Handle team selection
  const handleTeamSelect = (type, teamId) => {
    setSelectedTeams(prev => ({
      ...prev,
      [type]: teamId
    }));
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMatchDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleCreateMatch = async () => {
    if (selectedTeams.team1 === selectedTeams.team2) {
      toast.error('Please select different teams');
      return;
    }
    
    if (!matchDetails.venue || !matchDetails.date || !matchDetails.time) {
      toast.error('Please fill in all match details');
      return;
    }
    
    try {
      // Combine date and time
      const matchDateTime = new Date(`${matchDetails.date}T${matchDetails.time}`);
      
      await createMatch(
        tournamentId, 
        selectedTeams.team1, 
        selectedTeams.team2,
        matchDetails.matchType,
        matchDetails.venue,
        matchDateTime.toISOString()
      );
      
      toast.success('Match created successfully');
      setIsModalOpen(false);
      
      // Reset form
      setSelectedTeams({ team1: '', team2: '' });
      setMatchDetails({
        venue: 'Home Ground',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        matchType: 'league'
      });
    } catch (error) {
      toast.error('Failed to create match: ' + error.message);
    }
  };
  
  return (
    <>
      <Card variant="glass">
        <div className="p-4 border-b border-blue-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Schedule Matches</h2>
          
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            Create Match
          </Button>
        </div>
        
        <div className="p-4">
          <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4 text-center">
            <h3 className="text-white font-medium mb-2">Create Your Tournament Schedule</h3>
            <p className="text-blue-300 text-sm mb-4">
              Schedule matches between teams to determine the tournament champion. 
              You can create individual matches or generate a complete tournament schedule.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="primary"
                onClick={() => setIsModalOpen(true)}
              >
                Schedule Single Match
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => toast.info('This feature will be available soon!')}
              >
                Generate Complete Schedule
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Create Match Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Match"
        size="lg"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Select Teams</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Team 1</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                  {teams.map(team => (
                    <div 
                      key={`team1_${team.id}`}
                      className={`p-2 rounded-lg cursor-pointer flex items-center ${
                        selectedTeams.team1 === team.id 
                          ? 'bg-blue-700' 
                          : 'bg-blue-900 bg-opacity-40 hover:bg-opacity-60'
                      } ${selectedTeams.team2 === team.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (selectedTeams.team2 !== team.id) {
                          handleTeamSelect('team1', team.id);
                        }
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-2"
                        style={{ backgroundColor: team.color }}
                      >
                        {team.name.charAt(0)}
                      </div>
                      <span className="text-white text-sm font-medium truncate">{team.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Team 2</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                  {teams.map(team => (
                    <div 
                      key={`team2_${team.id}`}
                      className={`p-2 rounded-lg cursor-pointer flex items-center ${
                        selectedTeams.team2 === team.id 
                          ? 'bg-blue-700' 
                          : 'bg-blue-900 bg-opacity-40 hover:bg-opacity-60'
                      } ${selectedTeams.team1 === team.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (selectedTeams.team1 !== team.id) {
                          handleTeamSelect('team2', team.id);
                        }
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-2"
                        style={{ backgroundColor: team.color }}
                      >
                        {team.name.charAt(0)}
                      </div>
                      <span className="text-white text-sm font-medium truncate">{team.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Match Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Match Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Match Type</label>
                <select
                  name="matchType"
                  value={matchDetails.matchType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 rounded-lg border border-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
                >
                  {matchTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Venue</label>
                <input
                  type="text"
                  name="venue"
                  value={matchDetails.venue}
                  onChange={handleInputChange}
                  placeholder="Match Venue"
                  className="w-full px-4 py-2 bg-slate-800 rounded-lg border border-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={matchDetails.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 rounded-lg border border-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">Time</label>
                <input
                  type="time"
                  name="time"
                  value={matchDetails.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 rounded-lg border border-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition text-white"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Match Preview */}
        {selectedTeams.team1 && selectedTeams.team2 && (
          <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 rounded-lg">
            <h3 className="text-md font-semibold text-white mb-3">Match Preview</h3>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: teams.find(t => t.id === selectedTeams.team1)?.color }}
                >
                  {teams.find(t => t.id === selectedTeams.team1)?.name.charAt(0)}
                </div>
                <span className="text-white font-medium ml-2">{teams.find(t => t.id === selectedTeams.team1)?.name}</span>
              </div>
              
              <div className="flex items-center justify-center px-3 py-1 rounded-full bg-blue-900 text-blue-300 text-xs mx-2">
                vs
              </div>
              
              <div className="flex items-center">
                <span className="text-white font-medium mr-2">{teams.find(t => t.id === selectedTeams.team2)?.name}</span>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: teams.find(t => t.id === selectedTeams.team2)?.color }}
                >
                  {teams.find(t => t.id === selectedTeams.team2)?.name.charAt(0)}
                </div>
              </div>
            </div>
            
            <div className="mt-2 text-center text-sm text-blue-300">
              <p>{matchDetails.venue} | {new Date(`${matchDetails.date}T${matchDetails.time}`).toLocaleString()}</p>
              <p className="mt-1 text-xs">{matchTypes.find(t => t.id === matchDetails.matchType)?.label}</p>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="glass"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </Button>
          
          <Button
            variant="primary"
            onClick={handleCreateMatch}
            disabled={!selectedTeams.team1 || !selectedTeams.team2}
          >
            Schedule Match
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default MatchScheduler;