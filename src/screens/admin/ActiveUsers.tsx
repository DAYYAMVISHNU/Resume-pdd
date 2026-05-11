import React, { useState, useEffect } from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { BottomNav } from '../../components/layout/BottomNav';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { User, Activity, Clock } from 'lucide-react';

import { getApiUrl } from '../../config/ApiConfig';

export const ActiveUsers = () => {
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(getApiUrl('/active_users'));
        if (response.ok) {
          const data = await response.json();
          const mappedData = data.map((u: any, idx: number) => ({
             id: idx,
             name: u.name,
             email: u.email,
             status: u.status,
             lastActive: 'Just now',
             activity: 'Active on platform'
          }));
          setActiveUsers(mappedData);
        }
      } catch (error) {
        console.error("Failed to fetch active users", error);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SubPageHeader title="Active Users" />

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
              <Activity size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Total Active</h2>
              <p className="text-xs text-gray-500">Currently online</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-indigo-600">{activeUsers.filter(u => u.status === 'online').length}</span>
        </div>

        <h3 className="font-bold text-gray-900 px-1 mt-6 mb-2">User List</h3>
        <div className="space-y-3">
          {activeUsers.map(user => (
            <Card key={user.id} padding="sm" className="flex items-center p-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-500" />
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${getStatusColor(user.status)}`}></div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-gray-900">{user.name}</h4>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} /> {user.lastActive}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{user.email}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    {user.activity}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
