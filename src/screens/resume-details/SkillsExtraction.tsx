import React from 'react';
import { useLocation } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const SkillsExtraction = () => {
  const location = useLocation();
  const candidate = location.state?.candidate || {
    name: 'Sarah Smith',
    matched_skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Next.js', 'HTML5', 'CSS3']
  };

  const matched = candidate.matched_skills && candidate.matched_skills.length > 0
    ? candidate.matched_skills
    : ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Next.js'];

  const unmatched = candidate.missing_skills && candidate.missing_skills.length > 0
    ? candidate.missing_skills
    : ['Git', 'Webpack', 'Jest', 'GraphQL', 'Redux', 'Tailwind CSS', 'Docker'];

  const categories = [
    {
      name: 'Matched Core Skills',
      skills: matched
    },
    {
      name: 'Unmatched / Additional Skills',
      skills: unmatched
    },
    {
      name: 'Soft Skills & Others',
      skills: ['Team Leadership', 'Agile', 'Problem Solving']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Extracted Skills" />

      <div className="p-4 space-y-4">
        {categories.map((cat, i) => (
          <Card key={i}>
            <h3 className="font-bold text-gray-900 mb-4">{cat.name}</h3>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill: string) => (
                <Badge
                  key={skill}
                  variant="primary"
                  className="px-3 py-1 text-sm"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};