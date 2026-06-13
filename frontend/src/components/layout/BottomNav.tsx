import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, CheckCircle, BarChart2, User, Users } from 'lucide-react';
export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  let navItems = [
  {
    path: '/home',
    icon: Home,
    label: 'Home'
  },
  {
    path: '/recent',
    icon: FileText,
    label: 'Analyses'
  },
  {
    path: '/ats',
    icon: CheckCircle,
    label: 'ATS'
  },
  {
    path: '/analytics',
    icon: BarChart2,
    label: 'Analytics'
  },
  {
    path: '/profile',
    icon: User,
    label: 'Profile'
  }];

  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  if (isAdmin) {
    navItems = navItems.filter(item => item.path !== '/recent');
    navItems.splice(3, 0, {
      path: '/admin/users',
      icon: Users,
      label: 'Users'
    });
  }

  return (
    <div className="fixed bottom-0 w-full max-w-[430px] bg-white border-t border-gray-100 pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive =
          location.pathname.startsWith(item.path) ||
          item.path === '/recent' &&
          location.pathname.startsWith('/ranking') ||
          item.path === '/recent' && location.pathname.startsWith('/resume');
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
              
              <Icon
                size={22}
                className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
              
              <span
                className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                
                {item.label}
              </span>
            </button>);

        })}
      </div>
    </div>);

};