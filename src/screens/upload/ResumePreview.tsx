import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';
export const ResumePreview = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Resume Preview" />

      <div className="p-4 space-y-4">
        <div className="bg-indigo-50 text-indigo-800 p-3 rounded-xl text-sm text-center">
          This is how our AI parsed the resume.
        </div>

        <Card className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold text-gray-500">
            SS
          </div>
          <h2 className="text-xl font-bold text-gray-900">Sarah Smith</h2>
          <p className="text-gray-500 text-sm mb-4">Senior Frontend Engineer</p>

          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-600">
            <span className="flex items-center">
              <Mail size={12} className="mr-1" /> sarah@email.com
            </span>
            <span className="flex items-center">
              <Phone size={12} className="mr-1" /> (555) 123-4567
            </span>
            <span className="flex items-center">
              <MapPin size={12} className="mr-1" /> San Francisco, CA
            </span>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">
            Skills Extracted
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
            'React',
            'TypeScript',
            'Next.js',
            'Tailwind CSS',
            'GraphQL',
            'Jest',
            'Figma'].
            map((skill) =>
            <Badge key={skill} variant="neutral">
                {skill}
              </Badge>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">
            Experience
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-sm text-gray-900">
                  Senior Frontend Engineer
                </h4>
                <span className="text-xs text-gray-500">2020 - Present</span>
              </div>
              <p className="text-sm text-indigo-600 mb-1">TechCorp Inc.</p>
              <p className="text-xs text-gray-600 line-clamp-2">
                Led a team of 4 developers to rebuild the core customer
                dashboard using React and TypeScript, improving performance by
                40%.
              </p>
            </div>
            <div>
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-sm text-gray-900">
                  Frontend Developer
                </h4>
                <span className="text-xs text-gray-500">2017 - 2020</span>
              </div>
              <p className="text-sm text-indigo-600 mb-1">WebSolutions LLC</p>
            </div>
          </div>
        </Card>
      </div>
    </div>);

};