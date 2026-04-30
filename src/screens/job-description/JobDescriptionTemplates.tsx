import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import {
  Code,
  PenTool,
  Database,
  Megaphone,
  Briefcase,
  Server } from
'lucide-react';
export const JobDescriptionTemplates = () => {
  const navigate = useNavigate();
  const templates = [
  {
    id: 1,
    title: 'Software Engineer',
    category: 'Engineering',
    icon: Code,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    id: 2,
    title: 'Product Manager',
    category: 'Product',
    icon: Briefcase,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50'
  },
  {
    id: 3,
    title: 'UX/UI Designer',
    category: 'Design',
    icon: PenTool,
    color: 'text-pink-600',
    bg: 'bg-pink-50'
  },
  {
    id: 4,
    title: 'Data Scientist',
    category: 'Data',
    icon: Database,
    color: 'text-green-600',
    bg: 'bg-green-50'
  },
  {
    id: 5,
    title: 'Marketing Manager',
    category: 'Marketing',
    icon: Megaphone,
    color: 'text-orange-600',
    bg: 'bg-orange-50'
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    category: 'Engineering',
    icon: Server,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  }];

  const handleSelect = () => {
    navigate('/job-description/enter');
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Templates" />

      <div className="p-4">
        <p className="text-sm text-gray-500 mb-6">
          Select a template to pre-fill standard requirements and modify them as
          needed.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.id}
                hoverable
                padding="sm"
                onClick={handleSelect}
                className="flex flex-col items-center text-center p-4">
                
                <div
                  className={`w-12 h-12 rounded-full ${template.bg} ${template.color} flex items-center justify-center mb-3`}>
                  
                  <Icon size={24} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {template.title}
                </h3>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {template.category}
                </span>
              </Card>);

          })}
        </div>
      </div>
    </div>);

};