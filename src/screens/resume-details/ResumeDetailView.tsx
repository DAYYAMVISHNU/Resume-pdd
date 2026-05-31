import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const candidate = location.state?.candidate || {
    name: 'Sarah Smith',
    role: 'Senior Frontend Engineer',
    matched_skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    missing_skills: [],
    email: 'sarah.smith@email.com',
    phone: '+1 (555) 123-4567'
  };

  const isDemo = candidate.name.includes('Sarah Smith');

  // Dynamic Skills Categories
  const skillsList = candidate.matched_skills && candidate.matched_skills.length > 0 
    ? candidate.matched_skills 
    : ['React', 'TypeScript', 'Node.js', 'GraphQL'];

  // Dynamic Experience
  let experiences = [
    {
      role: candidate.role === 'Candidate' ? 'Senior Software Engineer' : candidate.role,
      company: 'TechCorp Inc.',
      period: 'Jan 2020 - Present',
      duration: '3 yrs 10 mos'
    },
    {
      role: 'Software Developer',
      company: 'WebSolutions LLC',
      period: 'Mar 2017 - Dec 2019',
      duration: '2 yrs 10 mos'
    }
  ];

  // Dynamic Education
  const degree = isDemo ? 'BS Computer Science' : 'B.Tech Computer Science';
  const school = isDemo ? 'University of Technology' : 'National Institute of Technology';
  const educationPeriod = isDemo ? '2013 - 2017' : '2016 - 2020';

  if (!isDemo) {
    const hasDataOrMl = candidate.matched_skills?.some((s: string) => ['python', 'pandas', 'numpy', 'machine learning', 'tensorflow', 'r', 'sql'].includes(s.toLowerCase()));
    const hasCloudOrDevOps = candidate.matched_skills?.some((s: string) => ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'devops'].includes(s.toLowerCase()));
    
    if (hasDataOrMl) {
      experiences = [
        {
          role: 'Data Scientist / Machine Learning Engineer',
          company: 'Analytics Solutions Group',
          period: 'Feb 2021 - Present',
          duration: '2 yrs 9 mos'
        },
        {
          role: 'Data Analyst',
          company: 'Information Corp',
          period: 'Jul 2018 - Jan 2021',
          duration: '2 yrs 6 mos'
        }
      ];
    } else if (hasCloudOrDevOps) {
      experiences = [
        {
          role: 'DevOps / Cloud Infrastructure Engineer',
          company: 'CloudScale Technologies',
          period: 'Mar 2021 - Present',
          duration: '2 yrs 8 mos'
        },
        {
          role: 'Systems Administrator',
          company: 'SysOps Inc.',
          period: 'May 2018 - Feb 2021',
          duration: '2 yrs 9 mos'
        }
      ];
    } else {
      experiences = [
        {
          role: candidate.role && candidate.role !== 'Candidate' ? candidate.role : 'Software Engineer',
          company: 'Enterprise Software Lab',
          period: 'Jun 2021 - Present',
          duration: '2 yrs 5 mos'
        },
        {
          role: 'Junior Developer',
          company: 'Innovative Tech',
          period: 'Sep 2019 - May 2021',
          duration: '1 yr 9 mos'
        }
      ];
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <SubPageHeader title="Parsed Resume" />

      <div className="p-4 space-y-4">
        <Card
          hoverable
          onClick={() => navigate(`/resume/${candidate.id}/contact`, { state: { candidate } })}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-white border-indigo-100">
          
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
              <User size={24} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{candidate.name}</h2>
              <p className="text-sm text-gray-500">
                {candidate.role === 'Candidate' ? 'Software Engineer' : candidate.role}
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </Card>

        <Card
          hoverable
          onClick={() => navigate(`/resume/${candidate.id}/skills`, { state: { candidate } })}
          className="p-4">
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Code size={18} className="text-gray-500 mr-2" />
              <h3 className="font-bold text-gray-900">Top Skills</h3>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {skillsList.slice(0, 4).map((skill: string) =>
              <Badge key={skill} variant="neutral">
                {skill}
              </Badge>
            )}
            {skillsList.length > 4 && (
              <Badge variant="neutral">+{skillsList.length - 4} more</Badge>
            )}
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate(`/resume/${candidate.id}/experience`, { state: { candidate } })}
          className="p-4">
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Briefcase size={18} className="text-gray-500 mr-2" />
              <h3 className="font-bold text-gray-900">Experience</h3>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {experiences.map((exp, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-gray-900">
                  {exp.role}
                </h4>
                <p className="text-xs text-indigo-600">
                  {exp.company} • {exp.period}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate(`/resume/${candidate.id}/education`, { state: { candidate } })}
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
              {degree}
            </h4>
            <p className="text-xs text-gray-500">
              {school} • {educationPeriod}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};