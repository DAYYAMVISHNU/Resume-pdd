import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Button } from '../../components/ui/Button';
export const AccountSettings = () => {
  const userName = localStorage.getItem('userName') || 'Demo User';
  const userEmail = localStorage.getItem('userEmail') || 'demo@resumatch.ai';

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Account Settings" />

      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Personal Info
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <label className="block text-xs text-gray-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={userName}
                className="w-full text-sm font-medium text-gray-900 border-none p-0 focus:ring-0" />
              
            </div>
            <div className="p-4 border-b border-gray-100">
              <label className="block text-xs text-gray-500 mb-1">
                Email Address
              </label>
              <input
                type="email"
                defaultValue={userEmail}
                className="w-full text-sm font-medium text-gray-900 border-none p-0 focus:ring-0" />
              
            </div>
            <div className="p-4">
              <label className="block text-xs text-gray-500 mb-1">
                Company
              </label>
              <input
                type="text"
                defaultValue="TechCorp Inc."
                className="w-full text-sm font-medium text-gray-900 border-none p-0 focus:ring-0" />
              
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Security
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Change Password
                </p>
                <p className="text-xs text-gray-500">
                  Last changed 3 months ago
                </p>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Two-Factor Auth
                </p>
                <p className="text-xs text-gray-500">Currently disabled</p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            variant="danger"
            fullWidth
            className="bg-white border border-red-200">
            
            Delete Account
          </Button>
        </div>
      </div>
    </div>);

};