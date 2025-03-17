import { motion } from 'framer-motion';

const Loader = ({ size = 'md', color = 'blue', fullScreen = false }) => {
  // Size variants
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  };
  
  // Color variants
  const colors = {
    blue: 'border-blue-500',
    indigo: 'border-indigo-500',
    purple: 'border-purple-500',
    pink: 'border-pink-500',
    red: 'border-red-500',
    orange: 'border-orange-500',
    yellow: 'border-yellow-500',
    green: 'border-green-500',
    teal: 'border-teal-500',
    white: 'border-white'
  };
  
  // Get correct size class
  const sizeClass = sizes[size] || sizes.md;
  
  // Get correct color class
  const colorClass = colors[color] || colors.blue;
  
  // Cricket loader animation - ball moving in a curved path
  const ballVariants = {
    hidden: { 
      opacity: 0,
      scale: 0 
    },
    visible: { 
      opacity: 1,
      scale: [0, 1, 1, 1, 0],
      y: [0, -30, 0, 30, 0],
      x: [0, 30, 0, -30, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  // Stump animation - slight wiggle
  const stumpVariants = {
    hidden: { 
      opacity: 0,
      y: 10 
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  
  // Ball animation
  const Ball = () => (
    <motion.div
      className="absolute rounded-full bg-red-500"
      style={{ width: '25%', height: '25%' }}
      variants={ballVariants}
      initial="hidden"
      animate="visible"
    />
  );
  
  // Stump animation (cricket wicket)
  const Stump = ({ delay = 0, x = 0 }) => (
    <motion.div
      className="absolute bottom-0 bg-white rounded-t-sm"
      style={{ 
        width: '10%', 
        height: '80%', 
        left: `${45 + x}%`,
        transformOrigin: 'bottom'
      }}
      variants={stumpVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    />
  );
  
  // Bail animation (top of the wicket)
  const Bail = ({ delay = 0, x = 0 }) => (
    <motion.div
      className="absolute bg-white rounded-full"
      style={{ 
        width: '20%', 
        height: '5%', 
        left: `${40 + x}%`,
        top: '15%'
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: {
          delay,
          duration: 0.3
        }
      }}
    />
  );
  
  // Full content with cricket-themed loader
  const content = (
    <div className="relative flex items-center justify-center">
      <div className={`relative ${sizeClass}`}>
        {/* Cricket stumps */}
        <Stump delay={0.1} x={-10} />
        <Stump delay={0.2} x={0} />
        <Stump delay={0.3} x={10} />
        
        {/* Bails on top of stumps */}
        <Bail delay={0.4} x={-5} />
        <Bail delay={0.5} x={5} />
        
        {/* Cricket ball */}
        <Ball />
      </div>
      
      {/* Alternative spinner for fallback */}
      <div className={`absolute animate-spin rounded-full border-t-2 border-b-2 ${colorClass} ${sizeClass} opacity-30`}></div>
    </div>
  );
  
  // Return fullscreen or regular loader
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-blue-900 bg-opacity-30 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
};

export default Loader;