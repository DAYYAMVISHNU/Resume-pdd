import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { FileText, Clock, ChevronRight } from 'lucide-react';
export const SavedJobDescriptions = () => {
  const navigate = useNavigate();
  const savedJDs = [
  {
    id: 1,
    title: 'Senior Frontend Engineer - React',
    date: 'Updated 2 days ago',
    excerpt:
    'Looking for an experienced frontend engineer with deep knowledge of React, TypeScript...'
  },
  {
    id: 2,
    title: 'Growth Product Manager',
    date: 'Updated 1 week ago',
    excerpt:
    'We need a data-driven PM to lead our growth initiatives and optimize the funnel...'
  },
  {
    id: 3,
    title: 'Backend Developer (Node.js)',
    date: 'Updated 2 weeks ago',
    excerpt:
    'Join our core platform team to build scalable microservices using Node.js and AWS...'
  }];

  const handleSelect = () => {
    navigate('/job-description/enter');
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Saved Descriptions" />

      <div className="p-4 space-y-3">
        {savedJDs.map((jd) =>
        <Card key={jd.id} hoverable onClick={handleSelect} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-gray-900 mb-1">{jd.title}</h3>
                <p className="text-xs text-gray-500 flex items-center mb-2">
                  <Clock size={12} className="mr-1" /> {jd.date}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {jd.excerpt}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center shrink-0">
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>);

};