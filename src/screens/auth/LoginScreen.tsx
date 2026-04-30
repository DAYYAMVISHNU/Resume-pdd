import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, Shield, Chrome } from 'lucide-react';
export const LoginScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simple admin validation
    if (email === 'lvishnu181@gmail.com' && password !== '6302797232@a') {
      setError('Invalid credentials for admin account');
      return;
    }

    // Extract name from email or use a default
    const namePart = email.split('@')[0];
    const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    localStorage.setItem('userName', capitalizedName + ' User');
    localStorage.setItem('userEmail', email);
    
    if (email === 'lvishnu181@gmail.com') {
      localStorage.setItem('isAdmin', 'true');
    } else {
      localStorage.removeItem('isAdmin');
    }

    setIsLoading(true);
    setTimeout(() => {
      navigate('/home');
    }, 1000);
  };

  const handleOAuthLogin = (provider: string) => {
    setIsLoading(true);
    const mockEmail = provider === 'Google' ? 'vishnu@gmail.com' : 'vishnu@github.com';
    const namePart = mockEmail.split('@')[0];
    const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    localStorage.setItem('userName', capitalizedName + ' User');
    localStorage.setItem('userEmail', mockEmail);

    setTimeout(() => {
      navigate('/home');
    }, 1000);
  };

  const handleAdminLogin = () => {
    const adminEmail = window.prompt("Enter admin email:");
    if (adminEmail !== 'lvishnu181@gmail.com') {
      setError('Unauthorized access');
      return;
    }

    const adminPassword = window.prompt("Enter admin password:");
    if (adminPassword !== '6302797232@a') {
      setError('Invalid admin credentials');
      return;
    }

    setIsLoading(true);
    localStorage.setItem('userName', 'Admin User');
    localStorage.setItem('userEmail', 'lvishnu181@gmail.com');
    localStorage.setItem('isAdmin', 'true');

    setTimeout(() => {
      navigate('/home');
    }, 1000);
  };
  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="mb-10">
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-500">
            Enter your details to access your account.
          </p>
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
          onSubmit={handleLogin}
          className="space-y-5">
          
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required />
              
            </div>
            <div className="flex justify-end mt-2">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          <Button
            fullWidth
            size="lg"
            type="submit"
            disabled={isLoading}
            className="mt-6">
            
            {isLoading ? 'Signing in...' : 'Sign In'}
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
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button variant="outline" icon={<Chrome size={20} />} onClick={() => handleOAuthLogin('Google')} disabled={isLoading}>
              Google
            </Button>
            <Button variant="outline" icon={<Shield size={20} />} onClick={handleAdminLogin} disabled={isLoading}>
              Admin
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="text-center pb-8">
        <p className="text-gray-500 text-sm">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-indigo-600 hover:text-indigo-500">
            
            Sign up
          </Link>
        </p>
      </div>
    </div>);

};