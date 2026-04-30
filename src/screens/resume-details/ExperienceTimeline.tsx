import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
export const ExperienceTimeline = () => {
  const experiences = [
  {
    role: 'Senior Frontend Engineer',
    company: 'TechCorp Inc.',
    period: 'Jan 2020 - Present',
    duration: '3 yrs 10 mos',
    desc: 'Led a team of 4 developers to rebuild the core customer dashboard using React and TypeScript, improving performance by 40%. Implemented CI/CD pipelines.'
  },
  {
    role: 'Frontend Developer',
    company: 'WebSolutions LLC',
    period: 'Mar 2017 - Dec 2019',
    duration: '2 yrs 10 mos',
    desc: 'Developed responsive web applications for various clients. Collaborated closely with UX designers to implement pixel-perfect interfaces.'
  },
  {
    role: 'Junior Web Developer',
    company: 'StartUp Hub',
    period: 'Jun 2015 - Feb 2017',
    duration: '1 yr 9 mos',
    desc: 'Maintained legacy PHP applications and gradually migrated them to modern JavaScript frameworks.'
  }];

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Experience" />

      <div className="p-4">
        <div className="relative pl-6 border-l-2 border-indigo-200 space-y-6 ml-2">
          {experiences.map((exp, i) =>
          <div key={i} className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 bg-indigo-600 rounded-full border-4 border-gray-50"></div>
              <Card className="p-4">
                <h3 className="font-bold text-gray-900">{exp.role}</h3>
                <p className="text-sm text-indigo-600 font-medium mb-1">
                  {exp.company}
                </p>
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <span>{exp.period}</span>
                  <span className="mx-2">•</span>
                  <span>{exp.duration}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {exp.desc}
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>);

};