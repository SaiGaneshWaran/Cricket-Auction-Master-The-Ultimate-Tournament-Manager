import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../utils/helpers';
import Card from '../common/Card';

const CommentaryFeed = ({ 
  commentary = [], 
  maxItems = 50,
  autoScroll = true,
  className = ''
}) => {
  const scrollRef = useRef(null);
  
  // Auto-scroll on new commentary
  useEffect(() => {
    if (autoScroll && scrollRef.current && commentary.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commentary, autoScroll]);
  
  // Get icon for commentary type
  const getCommentaryIcon = (type) => {
    switch (type) {
      case 'wicket':
        return (
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'boundary':
      case 'four':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'six':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'run':
        return (
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'extra':
      case 'wide':
      case 'noBall':
      case 'bye':
      case 'legBye':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'overEnd':
        return (
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'result':
      case 'inningsEnd':
        return (
          <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };
  
  // Get background color for commentary item based on type
  const getCommentaryBgColor = (type) => {
    switch (type) {
      case 'wicket':
        return 'bg-red-600 bg-opacity-10 border-red-600';
      case 'boundary':
      case 'four':
        return 'bg-blue-600 bg-opacity-10 border-blue-600';
      case 'six':
        return 'bg-purple-600 bg-opacity-10 border-purple-600';
      case 'run':
        return 'bg-green-600 bg-opacity-10 border-green-600';
      case 'extra':
      case 'wide':
      case 'noBall':
      case 'bye':
      case 'legBye':
        return 'bg-yellow-600 bg-opacity-10 border-yellow-600';
      case 'overEnd':
        return 'bg-indigo-600 bg-opacity-10 border-indigo-600';
      case 'result':
      case 'inningsEnd':
        return 'bg-pink-600 bg-opacity-10 border-pink-600';
      default:
        return 'bg-blue-900 bg-opacity-30 border-blue-800';
    }
  };
  
  // Limit commentary items to the most recent
  const limitedCommentary = commentary.slice(-maxItems);
  
  return (
    <Card variant="glass" className={`p-4 ${className}`}>
      <h3 className="text-lg font-bold text-white mb-4">Live Commentary</h3>
      
      <div 
        ref={scrollRef}
        className="space-y-3 max-h-96 overflow-y-auto pr-2"
      >
        <AnimatePresence initial={false}>
          {limitedCommentary.length > 0 ? (
            limitedCommentary.map(comment => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-lg border border-opacity-20 ${getCommentaryBgColor(comment.type)}`}
              >
                <div className="flex">
                  <div className="mr-3 flex-shrink-0">
                    {getCommentaryIcon(comment.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white">{comment.text}</p>
                    <p className="text-xs text-blue-300 mt-1">{formatDate(comment.timestamp)}</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-blue-300">No commentary yet</p>
              <p className="text-sm text-blue-400 mt-2">Commentary will appear here when the match starts</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default CommentaryFeed;