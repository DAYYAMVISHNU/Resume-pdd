import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, User, Chrome } from 'lucide-react';
import { getApiUrl } from '../../config/ApiConfig';
import { localSaveUser } from '../../config/localAuth';

export const SignUpScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateForm = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 1) {
      return 'Please enter your name';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return 'Please enter a valid email address';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return '';
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim(),
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        const emailClean = email.trim().toLowerCase();
        const isAdmin = emailClean === 'lvishnu181@gmail.com';
        // Save credentials locally so login works even if serverless DB resets
        await localSaveUser(emailClean, name.trim(), password, isAdmin);
        localStorage.setItem('token', result.token);
        localStorage.setItem('userName', result.name || name.trim());
        localStorage.setItem('userEmail', emailClean);
        if (isAdmin) {
          localStorage.setItem('isAdmin', 'true');
        } else {
          localStorage.removeItem('isAdmin');
        }
        navigate('/home');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    setError('');
    const mockEmail = window.prompt(`Enter your ${provider} Email to sign up:`);
    if (!mockEmail) return;

    if (!mockEmail.includes('@') || !mockEmail.includes('.')) {
      setError('Invalid email address format');
      return;
    }

    const namePart = mockEmail.split('@')[0];
    const defaultName = namePart.charAt(0).toUpperCase() + namePart.slice(1) + ' User';
    const mockName = window.prompt(`Enter your Full Name (optional):`, defaultName) || defaultName;

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mockEmail,
          name: mockName,
          isOAuth: true,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('userName', result.name);
        localStorage.setItem('userEmail', result.email);
        if (result.email.toLowerCase() === 'lvishnu181@gmail.com') {
          localStorage.setItem('isAdmin', 'true');
        } else {
          localStorage.removeItem('isAdmin');
        }
        navigate('/home');
      } else {
        setError(result.error || `${provider} Signup failed`);
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <button
        type="button"
        onClick={() => navigate('/login')}
        className="-ml-2 mb-4 w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Back to sign in"
      >
        <span aria-hidden="true" className="text-3xl leading-none">&lsaquo;</span>
      </button>

      <div className="flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create account</h1>
          <p className="text-gray-500">Start analyzing resumes in seconds.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSignUp}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                type="password"
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-500">
                I agree to the{' '}
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          <Button fullWidth size="lg" type="submit" disabled={isLoading} className="mt-6">
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Button variant="outline" fullWidth icon={<Chrome size={20} />} onClick={() => handleOAuthLogin('Google')} disabled={isLoading}>
            Sign up with Google
          </Button>
        </motion.div>
      </div>

      <div className="text-center pb-8">
        <p className="text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
