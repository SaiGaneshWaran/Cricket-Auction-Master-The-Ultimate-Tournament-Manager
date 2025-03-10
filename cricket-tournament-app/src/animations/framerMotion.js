export const pageVariants = {
    initial: {
      opacity: 0,
      x: -20
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2
      }
    }
  };
  
  export const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };
  
  export const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };
  
  export const cardVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95
    }
  };
  
  export const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };
  
  export const fadeInVariants = {
    hidden: { 
      opacity: 0 
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  
  export const slideInVariants = {
    hidden: (direction) => ({
      x: direction === 'left' ? -100 : 100,
      opacity: 0
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };
  
  export const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95
    },
    disabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  };