import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Mail, CheckCircle } from 'lucide-react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
export const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SubPageHeader title="Reset Password" />

      <div className="flex-1 flex flex-col px-6 pt-8">
        {!isSubmitted ?
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}>
          
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Forgot your password?
            </h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Enter the email address associated with your account and we'll
              send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={20} className="text-gray-400" />
                  </div>
                  <input
                  type="email"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required />
                
                </div>
              </div>

              <Button fullWidth size="lg" type="submit">
                Send Reset Link
              </Button>
            </form>
          </motion.div> :

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          className="flex flex-col items-center text-center pt-12">
          
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Check your email
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              We've sent password reset instructions to your email address.
            </p>
            <Button
            variant="secondary"
            fullWidth
            onClick={() => window.history.back()}>
            
              Return to Login
            </Button>
          </motion.div>
        }
      </div>
    </div>);

};