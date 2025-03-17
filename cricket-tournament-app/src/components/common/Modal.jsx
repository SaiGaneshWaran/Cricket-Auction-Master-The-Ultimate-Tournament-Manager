import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  closeOnOutsideClick = true 
}) => {
  const modalRef = useRef(null);
  
  // Size variants
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-full mx-4'
  };
  
  // Get correct size class
  const sizeClass = sizes[size] || sizes.md;
  
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  // Handle outside click
  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.2
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.2,
        delay: 0.1
      }
    }
  };
  
  const modalVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
        duration: 0.2
      }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-blue-900 bg-opacity-30 backdrop-blur-sm"
          onClick={handleOutsideClick}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div 
            ref={modalRef}
            className={`relative w-full ${sizeClass} bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl overflow-hidden`}
            variants={modalVariants}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800">
              <h3 className="text-xl sm:text-2xl font-bold text-white">{title}</h3>
              <button 
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;