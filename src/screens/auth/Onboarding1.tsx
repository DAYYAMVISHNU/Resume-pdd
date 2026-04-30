import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Trophy } from 'lucide-react';
export const Onboarding1 = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{
            scale: 0.9,
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          className="w-64 h-64 bg-indigo-50 rounded-full flex items-center justify-center mb-12 relative">
          
          <div className="absolute inset-0 bg-indigo-100 rounded-full animate-pulse opacity-50" />
          <Trophy size={100} className="text-indigo-600 relative z-10" />
        </motion.div>

        <motion.div
          initial={{
            y: 20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.2
          }}
          className="text-center">
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Rank Resumes Instantly
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Stop reading hundreds of resumes. Let our AI analyze and rank
            candidates in seconds.
          </p>
        </motion.div>
      </div>

      <div className="p-8 pb-12">
        <div className="flex justify-center space-x-2 mb-8">
          <div className="w-8 h-2 bg-indigo-600 rounded-full" />
          <div className="w-2 h-2 bg-gray-200 rounded-full" />
          <div className="w-2 h-2 bg-gray-200 rounded-full" />
        </div>
        <Button fullWidth size="lg" onClick={() => navigate('/onboarding/2')}>
          Next
        </Button>
        <button
          onClick={() => navigate('/login')}
          className="w-full text-center mt-4 text-gray-500 font-medium p-2">
          
          Skip
        </button>
      </div>
    </div>);

};