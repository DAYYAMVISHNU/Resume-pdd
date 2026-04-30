import React from 'react';
import { motion } from 'framer-motion';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyle =
  'rounded-xl font-medium transition-colors flex items-center justify-center gap-2';
  const variants = {
    primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm',
    secondary:
    'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200',
    outline:
    'border-2 border-gray-200 text-gray-700 hover:border-indigo-600 hover:text-indigo-600',
    ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };
  return (
    <motion.button
      whileTap={{
        scale: 0.97
      }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}>
      
      {icon}
      {children}
    </motion.button>);

};