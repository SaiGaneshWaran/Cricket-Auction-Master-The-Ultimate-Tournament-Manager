// src/utils/animations.js
// Animation variants for Framer Motion

/**
 * Basic fade animation
 */
export const fadeAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

/**
 * Slide in from the bottom
 */
export const slideUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { 
    type: 'spring', 
    stiffness: 500, 
    damping: 30,
    mass: 1
  }
};

/**
 * Scale up animation
 */
export const scaleAnimation = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { type: 'spring', stiffness: 500, damping: 30 }
};

/**
 * Bounce animation for attention-grabbing elements
 */
export const bounceAnimation = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.05, 1] },
  transition: { 
    duration: 0.5,
    times: [0, 0.5, 1],
    repeat: 0
  }
};

/**
 * Staggered children animation
 * @param {number} staggerTime - Stagger time between children
 * @returns {Object} Staggered animation config
 */
export const staggeredContainer = (staggerTime = 0.1) => ({
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      staggerChildren: staggerTime
    }
  }
});

/**
 * Child item for staggered animations
 */
export const staggeredItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 24 }
};

/**
 * Auction bid animation
 */
export const bidAnimation = {
  initial: { 
    scale: 1.5, 
    opacity: 0 
  },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 500, 
      damping: 30 
    }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: { duration: 0.2 } 
  }
};

/**
 * Player card animation for auction
 */
export const playerCardAnimation = {
  initial: { 
    y: 50, 
    opacity: 0, 
    rotateY: 90 
  },
  animate: { 
    y: 0, 
    opacity: 1, 
    rotateY: 0,
    transition: { 
      type: 'spring', 
      stiffness: 100, 
      damping: 20, 
      delay: 0.2 
    }
  },
  exit: { 
    y: -50, 
    opacity: 0,
    rotateY: -90, 
    transition: { duration: 0.3 } 
  }
};

/**
 * Timer animation that pulses when time is low
 * @param {number} timeLeft - Seconds left on timer
 * @returns {Object} Timer animation based on time left
 */
export const timerAnimation = (timeLeft) => {
  if (timeLeft <= 5) {
    return {
      animate: { 
        scale: [1, 1.1, 1],
        color: '#ef4444' // Red for urgency
      },
      transition: { 
        duration: 0.5,
        repeat: Infinity,
        repeatType: 'loop'
      }
    };
  }
  
  if (timeLeft <= 10) {
    return {
      animate: { color: '#f59e0b' }, // Amber for warning
      transition: { duration: 0.2 }
    };
  }
  
  return {
    animate: { color: '#10b981' }, // Green for plenty of time
    transition: { duration: 0.2 }
  };
};

/**
 * Animation for auction sold notification
 */
export const soldAnimation = {
  initial: { 
    scale: 0.5, 
    opacity: 0,
    rotate: -10
  },
  animate: { 
    scale: 1, 
    opacity: 1,
    rotate: 0,
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 20 
    }
  },
  exit: { 
    scale: 1.5, 
    opacity: 0,
    transition: { duration: 0.3 } 
  }
};

/**
 * Run scored animation for match simulation
 * @param {number} runs - Runs scored on the ball
 * @returns {Object} Animation based on runs scored
 */
export const runsAnimation = (runs) => {
  // Bigger animation for boundaries
  if (runs === 4 || runs === 6) {
    return {
      initial: { 
        scale: 0.5, 
        opacity: 0,
        y: 20
      },
      animate: { 
        scale: 1.2, 
        opacity: 1,
        y: 0,
        transition: { 
          type: 'spring', 
          stiffness: 400, 
          damping: 15 
        }
      },
      exit: { 
        scale: 1.5, 
        opacity: 0,
        y: -20,
        transition: { duration: 0.4 } 
      }
    };
  }
  
  // Standard animation for other runs
  return {
    initial: { 
      scale: 0.8, 
      opacity: 0,
      y: 10
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 20 
      }
    },
    exit: { 
      scale: 1.1, 
      opacity: 0,
      y: -10,
      transition: { duration: 0.3 } 
    }
  };
};

/**
 * Wicket animation for match simulation
 */
export const wicketAnimation = {
  initial: { 
    scale: 0.5, 
    opacity: 0,
    rotate: -5
  },
  animate: { 
    scale: [1, 1.2, 1],
    opacity: 1,
    rotate: [5, -5, 0],
    transition: { 
      duration: 0.6,
      times: [0, 0.6, 1]
    }
  },
  exit: { 
    scale: 1.5, 
    opacity: 0,
    transition: { duration: 0.4 } 
  }
};

/**
 * Commentary animation
 * @param {string} type - Type of commentary (wicket, boundary, regular)
 * @returns {Object} Animation based on commentary type
 */
export const commentaryAnimation = (type) => {
  switch (type) {
    case 'wicket':
      return {
        initial: { x: -20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        transition: { type: 'spring', stiffness: 500, damping: 30 }
      };
    case 'boundary':
      return {
        initial: { y: -20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { type: 'spring', stiffness: 500, damping: 30 }
      };
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3 }
      };
  }
};

/**
 * Route transition animation
 */
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};