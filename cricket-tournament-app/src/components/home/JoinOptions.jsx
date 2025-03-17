import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTournament } from '../../contexts/TournamentContext';
import Button from '../common/Button';
import Card from '../common/Card';

const JoinOptions = ({ type, onBack }) => {
  const navigate = useNavigate();
  const { joinTournament } = useTournament();
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isViewerMode = type === 'viewer';

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setAccessCode(value);
  };

  const handleJoin = async () => {
    if (accessCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const { tournamentId, tournamentData } = await joinTournament(accessCode, isViewerMode);
      
      if (isViewerMode) {
        navigate(`/tournament/${tournamentId}`, { 
          state: { isViewer: true, tournamentData } 
        });
      } else {
        // For captains, go to team selection view
        navigate(`/auction/${tournamentId}`, { 
          state: { isCaptain: true, tournamentData } 
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to join tournament');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xl"
    >
      <div className="mb-8 flex items-center justify-between">
        <Button 
          variant="glass" 
          onClick={onBack}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          }
          iconPosition="left"
        >
          Back
        </Button>
        
        <h2 className="text-3xl font-bold text-center text-white">
          Join as {isViewerMode ? 'Viewer' : 'Captain'}
        </h2>
        
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      <Card variant="glass" className="p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-indigo-900 flex items-center justify-center mb-6">
            {isViewerMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          
          <h3 className="text-2xl font-bold mb-2 text-white">
            {isViewerMode ? 'Watch the Action Unfold' : 'Build Your Dream Team'}
          </h3>
          
          <p className="text-blue-200 mb-8">
            {isViewerMode 
              ? 'Enter the 6-digit viewer code to watch the auction without bidding rights.'
              : 'Enter the 6-digit captain code to join the auction and bid for players.'
            }
          </p>
          
          <div className="w-full mb-8">
            <label className="block text-sm font-medium text-blue-300 mb-2 text-left">
              {isViewerMode ? 'Viewer Code' : 'Captain Code'}
            </label>
            
            <div className="flex space-x-4">
              <input
                type="text"
                value={accessCode}
                onChange={handleCodeChange}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 bg-slate-800 rounded-lg border border-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition text-white text-center text-2xl tracking-wider"
                maxLength={6}
              />
            </div>
          </div>
          
          <Button
            variant={isViewerMode ? 'tertiary' : 'secondary'}
            onClick={handleJoin}
            loading={isLoading}
            fullWidth
            size="lg"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            }
            iconPosition="right"
          >
            {isViewerMode ? 'Watch as Viewer' : 'Join as Captain'}
          </Button>
        </div>
      </Card>
      
      <div className="mt-6 text-center">
        <p className="text-blue-300 text-sm">
          Need a code? Ask the tournament organizer to share a {isViewerMode ? 'viewer' : 'captain'} code with you.
        </p>
      </div>
    </motion.div>
  );
};

export default JoinOptions;