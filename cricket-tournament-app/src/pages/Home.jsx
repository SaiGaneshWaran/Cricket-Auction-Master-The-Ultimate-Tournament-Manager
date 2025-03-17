import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HomeScreen from '../components/home/HomeScreen';
import CreateTournament from '../components/home/CreateTournament';
import JoinOptions from '../components/home/JoinOptions';

const Home = () => {
  const [view, setView] = useState('home'); // 'home', 'create', 'join-captain', 'join-viewer'

  const handleViewChange = (newView) => {
    setView(newView);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 z-0" />
      
      {/* Animated cricket ball decoration */}
      <motion.div 
        className="absolute top-[-5%] right-[-5%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-br from-red-500 to-red-700 opacity-30 blur-xl"
        animate={{
          x: [0, 20, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      {/* Animated cricket stumps decoration */}
      <motion.div 
        className="absolute bottom-[-10%] left-[10%] w-[40vw] h-[40vh] rounded-full bg-blue-400 opacity-10 blur-xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      {/* Main content container */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* App title with animation */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white text-center tracking-tight">
              <span className="text-yellow-400">Cricket</span> Auction Master
            </h1>
            <p className="text-blue-200 text-center mt-2">The Ultimate Tournament Manager</p>
          </motion.div>
        </div>
        
        {/* Content panel with view switching */}
        <div className="flex-grow flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={view}
              className="w-full max-w-4xl mx-auto bg-blue-900/30 backdrop-blur-md p-8 rounded-2xl border border-blue-700/50 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {view === 'home' && (
                <HomeScreen onViewChange={handleViewChange} />
              )}
              
              {view === 'create' && (
                <CreateTournament onBack={() => handleViewChange('home')} />
              )}
              
              {view === 'join-captain' && (
                <JoinOptions 
                  type="captain" 
                  onBack={() => handleViewChange('home')} 
                />
              )}
              
              {view === 'join-viewer' && (
                <JoinOptions 
                  type="viewer" 
                  onBack={() => handleViewChange('home')} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <motion.div 
          className="text-center text-sm text-blue-300/70 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <p>Created for cricket enthusiasts everywhere</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;