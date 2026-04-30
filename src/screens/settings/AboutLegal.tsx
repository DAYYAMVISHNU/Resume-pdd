import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { FileSearch, ChevronRight } from 'lucide-react';
export const AboutLegal = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="About" />

      <div className="p-4 space-y-6">
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileSearch size={40} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">ResuMatch AI</h2>
          <p className="text-sm text-gray-500 mt-1">
            Version 2.4.1 (Build 492)
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
            <span className="text-sm font-medium text-gray-900">
              Terms of Service
            </span>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          <div className="p-4 flex justify-between items-center border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
            <span className="text-sm font-medium text-gray-900">
              Privacy Policy
            </span>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          <div className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
            <span className="text-sm font-medium text-gray-900">
              Open Source Licenses
            </span>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          © 2023 ResuMatch AI Inc.
          <br />
          All rights reserved.
        </p>
      </div>
    </div>);

};