import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { GraduationCap, Calendar, MapPin } from 'lucide-react';
export const EducationDetails = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Education" />

      <div className="p-4 space-y-4">
        <Card className="p-5">
          <div className="flex items-start mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4 shrink-0">
              <GraduationCap size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                Bachelor of Science in Computer Science
              </h3>
              <p className="text-sm font-medium text-indigo-600">
                University of Technology
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-gray-400" />
              <span>Sept 2013 - May 2017</span>
            </div>
            <div className="flex items-center">
              <MapPin size={16} className="mr-2 text-gray-400" />
              <span>San Jose, CA</span>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              GPA
            </span>
            <span className="text-lg font-bold text-gray-900">3.8/4.0</span>
          </div>
        </Card>
      </div>
    </div>);

};