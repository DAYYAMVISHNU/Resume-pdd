import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileSearch } from 'lucide-react';
export const SplashScreen = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding/1');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center text-white p-6">
      <motion.div
        initial={{
          scale: 0.8,
          opacity: 0
        }}
        animate={{
          scale: 1,
          opacity: 1
        }}
        transition={{
          duration: 0.5,
          ease: 'easeOut'
        }}
        className="flex flex-col items-center">
        
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-6">
          <FileSearch size={48} className="text-indigo-600" />
        </div>
        <motion.h1
          initial={{
            y: 20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.3,
            duration: 0.5
          }}
          className="text-3xl font-bold mb-2 tracking-tight">
          
          Resume Analysis
        </motion.h1>
        <motion.p
          initial={{
            y: 20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.4,
            duration: 0.5
          }}
          className="text-indigo-200 text-lg font-medium">
          
          AI-Powered Resume Analysis
        </motion.p>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        transition={{
          delay: 1,
          duration: 0.5
        }}
        className="absolute bottom-12">
        
        <div className="flex space-x-2">
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{
              animationDelay: '0ms'
            }} />
          
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{
              animationDelay: '150ms'
            }} />
          
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{
              animationDelay: '300ms'
            }} />
          
        </div>
      </motion.div>
    </div>);

};