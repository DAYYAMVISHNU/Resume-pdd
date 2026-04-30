import React from 'react';
import { motion } from 'framer-motion';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
export const Card = ({
  children,
  hoverable = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6'
  };
  const baseClasses = `bg-white rounded-2xl border border-gray-100 shadow-sm ${paddings[padding]} ${className}`;
  if (hoverable) {
    return (
      <motion.div
        whileHover={{
          y: -2,
          boxShadow:
          '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)'
        }}
        whileTap={{
          scale: 0.98
        }}
        className={`${baseClasses} cursor-pointer transition-shadow`}
        {...props}>
        
        {children}
      </motion.div>);

  }
  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>);

};