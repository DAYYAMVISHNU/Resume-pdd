import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../../components/layout/BottomNav';
import { Card } from '../../components/ui/Card';
import {
  Settings,
  CreditCard,
  HelpCircle,
  Info,
  ChevronRight,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const menuItems = [
    {
      icon: Settings,
      label: 'Account Settings',
      path: '/settings'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      path: '/help'
    },
    {
      icon: Info,
      label: 'About & Legal',
      path: '/about'
    }
  ];

  const userName = localStorage.getItem('userName') || 'Demo User';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  const userEmail = localStorage.getItem('userEmail') || 'demo@resumeanalysis.ai';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-indigo-600 px-6 pt-12 pb-20 rounded-b-[2rem] shadow-sm text-center relative">
        <h1 className="text-xl font-bold text-white mb-6">Profile</h1>
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
            <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600">
              {initials}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-16 px-4 text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{userName}</h2>
        <p className="text-gray-500 text-sm">{userEmail}</p>
        <div className="mt-2 inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
          Pro Plan
        </div>
      </div>

      <div className="px-4 space-y-2">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <Card
              key={i}
              hoverable
              padding="sm"
              onClick={() => navigate(item.path)}
              className="flex items-center justify-between p-4">
              
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mr-4">
                  <Icon size={20} className="text-gray-600" />
                </div>
                <span className="font-semibold text-gray-900">
                  {item.label}
                </span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </Card>);

        })}

        <Card
          hoverable
          padding="sm"
          onClick={toggleTheme}
          className="flex items-center justify-between p-4 mt-2">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mr-4">
              {theme === 'dark' ? <Sun size={20} className="text-indigo-600" /> : <Moon size={20} className="text-indigo-600" />}
            </div>
            <span className="font-semibold text-gray-900">
              {theme === 'dark' ? 'Light Theme Mode' : 'Dark Theme Mode'}
            </span>
          </div>
          <div className="w-10 h-6 bg-slate-200 rounded-full p-0.5 flex items-center cursor-pointer justify-start dark:bg-indigo-600 relative">
            <div 
              className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} 
            />
          </div>
        </Card>

        <Card
          hoverable
          padding="sm"
          onClick={() => navigate('/login')}
          className="flex items-center justify-between p-4 mt-4 border-red-100">
          
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-4">
              <LogOut size={20} className="text-red-600" />
            </div>
            <span className="font-semibold text-red-600">Log Out</span>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>);

};