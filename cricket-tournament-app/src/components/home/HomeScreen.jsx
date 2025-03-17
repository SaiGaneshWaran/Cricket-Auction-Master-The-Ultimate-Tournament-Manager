import { motion } from 'framer-motion';
import Button from '../common/Button';

const HomeScreen = ({ onViewChange }) => {
  const optionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5
      }
    }),
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
          Cricket Auction Pro
        </h1>
        <p className="text-xl md:text-2xl text-blue-200 font-light max-w-2xl mx-auto">
          Create your own IPL-style cricket tournament with dramatic auctions, strategic team building, 
          and immersive match simulations
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <motion.div
          custom={0}
          variants={optionVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className="bg-gradient-to-br from-purple-800 to-purple-900 p-6 rounded-2xl shadow-lg flex flex-col items-center"
        >
          <div className="bg-purple-700 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Create Tournament</h2>
          <p className="text-purple-200 mb-4">Set up teams, players, and budgets for a new tournament</p>
          <Button 
            onClick={() => onViewChange('create')}
            className="mt-auto"
            variant="primary"
          >
            Get Started
          </Button>
        </motion.div>

        <motion.div
          custom={1}
          variants={optionVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className="bg-gradient-to-br from-blue-800 to-blue-900 p-6 rounded-2xl shadow-lg flex flex-col items-center"
        >
          <div className="bg-blue-700 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Join as Captain</h2>
          <p className="text-blue-200 mb-4">Enter an auction room to build your dream team</p>
          <Button 
            onClick={() => onViewChange('join-captain')}
            className="mt-auto"
            variant="secondary"
          >
            Join Now
          </Button>
        </motion.div>

        <motion.div
          custom={2}
          variants={optionVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className="bg-gradient-to-br from-indigo-800 to-indigo-900 p-6 rounded-2xl shadow-lg flex flex-col items-center"
        >
          <div className="bg-indigo-700 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Join as Viewer</h2>
          <p className="text-indigo-200 mb-4">Watch the auction in real-time as a spectator</p>
          <Button 
            onClick={() => onViewChange('join-viewer')}
            className="mt-auto"
            variant="tertiary"
          >
            Watch Live
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center"
      >
        <p className="text-blue-300">
          <span className="text-yellow-400 font-bold">✨ No accounts required</span> • 
          <span className="ml-2">Works on all devices</span> • 
          <span className="ml-2">Zero infrastructure setup</span>
        </p>
      </motion.div>
    </div>
  );
};

export default HomeScreen;