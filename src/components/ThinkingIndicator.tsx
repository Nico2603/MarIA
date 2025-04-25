import React from 'react';
import { motion } from 'framer-motion';

const ThinkingIndicator: React.FC = () => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const dotVariants = {
    initial: { y: '0%', opacity: 0.5 },
    animate: {
      y: ['0%', '-50%', '0%'],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="flex items-end justify-start mb-4">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mr-3">
        <svg className="h-5 w-5 text-primary-600 dark:text-primary-400 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.25 18.75l.813-2.846a4.5 4.5 0 0 0 3.09-3.09L24.75 12l-2.846-.813a4.5 4.5 0 0 0-3.09-3.09L17.187 5.25l-.813 2.846a4.5 4.5 0 0 0-3.09 3.09L10.25 12l2.846.813a4.5 4.5 0 0 0 3.09 3.09l.813 2.846Z" />
        </svg>
      </div>
      <motion.div
        className="relative flex space-x-1.5 bg-white dark:bg-neutral-800 px-4 py-3 rounded-lg rounded-bl-none shadow-md"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.span
          variants={dotVariants}
          className="block w-2 h-2 bg-neutral-500 dark:bg-neutral-400 rounded-full"
        />
        <motion.span
          variants={dotVariants}
          className="block w-2 h-2 bg-neutral-500 dark:bg-neutral-400 rounded-full"
        />
        <motion.span
          variants={dotVariants}
          className="block w-2 h-2 bg-neutral-500 dark:bg-neutral-400 rounded-full"
        />
      </motion.div>
    </div>
  );
};

export default ThinkingIndicator; 