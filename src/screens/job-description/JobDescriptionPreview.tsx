import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle2, Briefcase, GraduationCap, Edit2 } from 'lucide-react';

export const JobDescriptionPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jdText = location.state?.jdText || '';
  
  const ALL_SKILLS = [
    'React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'System Design', 'Agile',
    'Python', 'Java', 'SQL', 'MongoDB', 'UI', 'UX', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Science'
  ];

  let skills = ALL_SKILLS.filter(s => jdText.toLowerCase().includes(s.toLowerCase()));
  if (skills.length === 0) {
    skills = ['General Software Engineering'];
  }

  // Simple heuristic for experience
  let expText = "General professional experience";
  const expMatch = jdText.match(/(\d+)\+?\s*years?/i);
  if (expMatch) {
    expText = `${expMatch[1]}+ years of relevant experience`;
  }

  // Simple heuristic for education
  let eduText = "Relevant degree or equivalent experience";
  if (jdText.toLowerCase().includes("bachelor") || jdText.toLowerCase().includes("bs") || jdText.toLowerCase().includes("b.s")) {
    eduText = "Bachelor's degree in Computer Science or related field";
  } else if (jdText.toLowerCase().includes("master") || jdText.toLowerCase().includes("ms") || jdText.toLowerCase().includes("m.s")) {
    eduText = "Master's degree in Computer Science or related field";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      <SubPageHeader
        title="Parsed Requirements"
        rightAction={
          <button
            onClick={() => navigate('/job-description/enter')}
            className="p-2 text-indigo-600">
            <Edit2 size={18} />
          </button>
        } 
      />

      <div className="p-4 space-y-4">
        <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl text-sm flex items-start">
          <CheckCircle2 size={20} className="mr-3 shrink-0 mt-0.5" />
          <p>
            We've extracted the key requirements from your job description. Review them before uploading resumes.
          </p>
        </div>

        <Card>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <Briefcase size={18} className="mr-2 text-gray-500" />
            Experience & Role
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 mr-2 shrink-0" />{' '}
              {expText}
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 mr-2 shrink-0" />{' '}
              Familiarity with modern software development practices
            </li>
          </ul>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle2 size={18} className="mr-2 text-gray-500" />
            Required Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) =>
              <Badge key={skill} variant="primary">
                {skill}
              </Badge>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <GraduationCap size={18} className="mr-2 text-gray-500" />
            Education
          </h3>
          <p className="text-sm text-gray-600">
            {eduText}
          </p>
        </Card>
      </div>

      <div className="fixed bottom-0 w-full max-w-[430px] p-4 bg-white border-t border-gray-100 pb-safe">
        <Button fullWidth size="lg" onClick={() => navigate('/upload', { state: { jdText } })}>
          Confirm & Upload Resumes
        </Button>
      </div>
    </div>
  );
};