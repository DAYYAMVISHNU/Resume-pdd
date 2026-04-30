import React from 'react';
import { motion } from 'framer-motion';
export const PageTransition = ({
  children,
  className = ''



}: {children: React.ReactNode;className?: string;}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      exit={{
        opacity: 0,
        y: -10
      }}
      transition={{
        duration: 0.2,
        ease: 'easeOut'
      }}
      className={`min-h-screen pb-20 ${className}`}>
      
      {children}
    </motion.div>);

};