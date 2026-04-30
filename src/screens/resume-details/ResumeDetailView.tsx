import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  ChevronRight } from
'lucide-react';
export const ResumeDetailView = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <SubPageHeader title="Parsed Resume" />

      <div className="p-4 space-y-4">
        <Card
          hoverable
          onClick={() => navigate('/resume/1/contact')}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-white border-indigo-100">
          
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
              <User size={24} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Sarah Smith</h2>
              <p className="text-sm text-gray-500">Senior Frontend Engineer</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/resume/1/skills')}
          className="p-4">
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Code size={18} className="text-gray-500 mr-2" />
              <h3 className="font-bold text-gray-900">Top Skills</h3>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Node.js', 'GraphQL'].map((skill) =>
            <Badge key={skill} variant="neutral">
                {skill}
              </Badge>
            )}
            <Badge variant="neutral">+{8} more</Badge>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/resume/1/experience')}
          className="p-4">
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Briefcase size={18} className="text-gray-500 mr-2" />
              <h3 className="font-bold text-gray-900">Experience</h3>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Senior Frontend Engineer
              </h4>
              <p className="text-xs text-indigo-600">
                TechCorp • 2020 - Present
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Frontend Developer
              </h4>
              <p className="text-xs text-indigo-600">
                WebSolutions • 2017 - 2020
              </p>
            </div>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/resume/1/education')}
          className="p-4">
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <GraduationCap size={18} className="text-gray-500 mr-2" />
              <h3 className="font-bold text-gray-900">Education</h3>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              BS Computer Science
            </h4>
            <p className="text-xs text-gray-500">
              University of Technology • 2013 - 2017
            </p>
          </div>
        </Card>
      </div>
    </div>);

};