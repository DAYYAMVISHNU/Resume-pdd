import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Check, X, Plus } from 'lucide-react';
export const SkillsMatchAnalysis = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Skills Match" />

      <div className="p-4 space-y-4">
        <Card>
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <Check size={16} className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">Matched Skills (8)</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
            'React',
            'TypeScript',
            'Node.js',
            'HTML/CSS',
            'Git',
            'Agile',
            'Jest',
            'Webpack'].
            map((skill) =>
            <Badge key={skill} variant="success">
                {skill}
              </Badge>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <X size={16} className="text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900">Missing Skills (2)</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['GraphQL', 'AWS'].map((skill) =>
            <Badge key={skill} variant="danger">
                {skill}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            These were required in the JD but not found in the resume.
          </p>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <Plus size={16} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Additional Skills (4)</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Python', 'Docker', 'Figma', 'MongoDB'].map((skill) =>
            <Badge key={skill} variant="info">
                {skill}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Candidate has these skills which might be valuable.
          </p>
        </Card>
      </div>
    </div>);

};