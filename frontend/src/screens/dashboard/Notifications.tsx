import React, { useState } from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Analysis Complete',
      message:
        'Your analysis for "Senior Frontend Engineer" is ready. 45 resumes processed.',
      time: '10 mins ago',
      type: 'success',
      read: false
    },
    {
      id: 2,
      title: 'New Feature Available',
      message:
        'Try our new ATS Score Breakdown feature to see exactly why a resume might fail.',
      time: '2 hours ago',
      type: 'info',
      read: false
    },
    {
      id: 3,
      title: 'Processing Error',
      message:
        'One resume in the "Product Manager" batch could not be parsed. Please check the file format.',
      time: 'Yesterday',
      type: 'warning',
      read: true
    },
    {
      id: 4,
      title: 'Weekly Summary',
      message:
        'You scanned 124 resumes this week. Your average match score is up by 12%.',
      time: '3 days ago',
      type: 'info',
      read: true
    }
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'info':
        return <Info size={20} className="text-blue-500" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SubPageHeader
        title="Notifications"
        rightAction={
          <button 
            className="text-xs font-medium text-indigo-600"
            onClick={markAllRead}
          >
            Mark all read
          </button>
        } 
      />
      <div className="divide-y divide-gray-100">
        {notifications.map((notif) =>
        <div
          key={notif.id}
          className={`p-4 flex gap-4 ${notif.read ? 'bg-white' : 'bg-indigo-50/50'}`}>
          
            <div className="mt-1">{getIcon(notif.type)}</div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4
                className={`text-sm font-semibold ${notif.read ? 'text-gray-900' : 'text-indigo-900'}`}>
                
                  {notif.title}
                </h4>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {notif.time}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {notif.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>);

};