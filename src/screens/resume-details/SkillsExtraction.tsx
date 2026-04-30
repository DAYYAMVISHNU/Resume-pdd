import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
export const SkillsExtraction = () => {
  const categories = [
  {
    name: 'Languages & Frameworks',
    skills: [
    'React',
    'TypeScript',
    'JavaScript',
    'Node.js',
    'Next.js',
    'HTML5',
    'CSS3']

  },
  {
    name: 'Tools & Technologies',
    skills: [
    'Git',
    'Webpack',
    'Jest',
    'GraphQL',
    'Redux',
    'Tailwind CSS',
    'Docker']

  },
  {
    name: 'Soft Skills',
    skills: ['Team Leadership', 'Agile', 'Mentoring', 'Problem Solving']
  }];

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Extracted Skills" />

      <div className="p-4 space-y-4">
        {categories.map((cat, i) =>
        <Card key={i}>
            <h3 className="font-bold text-gray-900 mb-4">{cat.name}</h3>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill) =>
            <Badge
              key={skill}
              variant="primary"
              className="px-3 py-1 text-sm">
              
                  {skill}
                </Badge>
            )}
            </div>
          </Card>
        )}
      </div>
    </div>);

};