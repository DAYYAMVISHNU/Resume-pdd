import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Mail, CheckCircle, Lock } from 'lucide-react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { getApiUrl } from '../../config/ApiConfig';
import { localSaveUser } from '../../config/localAuth';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl('/api/forgot-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        // Also save in local credential store
        const emailClean = email.trim().toLowerCase();
        const isAdmin = emailClean === 'lvishnu181@gmail.com';
        const namePart = emailClean.split('@')[0];
        const name = namePart.charAt(0).toUpperCase() + namePart.slice(1) + ' User';
        await localSaveUser(emailClean, name, password, isAdmin);
        
        setIsSubmitted(true);
      } else {
        setError(result.error || 'Password reset request failed');
      }
    } catch (err) {
      setError('Connection to backend failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SubPageHeader title="Reset Password" onBack={() => navigate('/login')} />

      <div className="flex-1 flex flex-col px-6 pt-8">
        {!isSubmitted ? (
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Reset your password
            </h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Enter your email address and new password below to reset your password and update your account.
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium">
                  {error}
                </div>
              )}

              <Button fullWidth size="lg" type="submit" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            className="flex flex-col items-center text-center pt-12"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Password Reset Successfully
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Your password has been successfully updated. You can now log in with your new credentials.
            </p>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/login')}
            >
              Return to Login
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};