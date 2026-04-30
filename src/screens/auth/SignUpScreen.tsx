import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, User, Chrome } from 'lucide-react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
export const SignUpScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      navigate('/home');
    }, 1000);
  };
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SubPageHeader title="" />

      <div className="flex-1 flex flex-col px-6 pb-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="mb-8 mt-4">
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create account
          </h1>
          <p className="text-gray-500">Start analyzing resumes in seconds.</p>
        </motion.div>

        <motion.form
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
          }}
          onSubmit={handleSignUp}
          className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                placeholder="John Doe"
                required />
              
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                type="password"
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                placeholder="Create a password"
                required />
              
            </div>
          </div>

          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                required />
              
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-500">
                I agree to the{' '}
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500">
                  
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500">
                  
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>

          <Button
            fullWidth
            size="lg"
            type="submit"
            disabled={isLoading}
            className="mt-6">
            
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </motion.form>

        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          transition={{
            delay: 0.2
          }}
          className="mt-8">
          
          <Button variant="outline" fullWidth icon={<Chrome size={20} />}>
            Sign up with Google
          </Button>
        </motion.div>
      </div>

      <div className="text-center pb-8">
        <p className="text-gray-500 text-sm">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500">
            
            Sign in
          </Link>
        </p>
      </div>
    </div>);

};