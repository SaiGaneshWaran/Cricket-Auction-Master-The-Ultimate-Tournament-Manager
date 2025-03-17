import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  variant = 'default',
  className = '',
  animate = false,
  ...props 
}) => {
  const variants = {
    default: 'bg-slate-800 border border-slate-700',
    glass: 'bg-blue-900/30 backdrop-blur-md border border-blue-700/50',
    primary: 'bg-gradient-to-br from-blue-800/80 to-indigo-900/80 border border-blue-600/30',
  };

  const baseClass = `
    rounded-xl shadow-lg p-6
    ${variants[variant] || variants.default}
    ${className}
  `;

  if (animate) {
    return (
      <motion.div
        className={baseClass}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClass} {...props}>
      {children}
    </div>
  );
};

export default Card;