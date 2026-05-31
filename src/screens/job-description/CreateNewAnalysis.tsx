import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Users, CheckCircle, ArrowRight } from 'lucide-react';
export const CreateNewAnalysis = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SubPageHeader title="New Analysis" onBack={() => navigate('/home')} />

      <div className="flex-1 p-6 flex flex-col justify-center space-y-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="text-center mb-4">
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            What would you like to do?
          </h2>
          <p className="text-gray-500">
            Choose an analysis type to get started.
          </p>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.1
          }}>
          
          <Card
            hoverable
            className="p-6 border-2 border-transparent hover:border-indigo-600 transition-colors"
            onClick={() => navigate('/job-description/enter')}>
            
            <div className="flex items-start">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0 mr-4">
                <Users size={24} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Rank Resumes
                </h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  Upload a job description and multiple resumes to find the best
                  match.
                </p>
                <div className="flex items-center text-indigo-600 text-sm font-semibold">
                  Start Ranking <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.2
          }}>
          
          <Card
            hoverable
            className="p-6 border-2 border-transparent hover:border-green-500 transition-colors"
            onClick={() => navigate('/ats/upload')}>
            
            <div className="flex items-start">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0 mr-4">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  ATS Score Check
                </h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  Upload a single resume to see how well it passes Applicant
                  Tracking Systems.
                </p>
                <div className="flex items-center text-green-600 text-sm font-semibold">
                  Check Score <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>);

};