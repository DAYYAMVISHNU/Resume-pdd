import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

export const ATSScoreResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || { score: 68, matched_skills: [], message: "" };
  const score = data.score || 0;
  const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'F';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SubPageHeader title="ATS Score" />

      <div className="p-4 space-y-4">
        <Card className="text-center py-8">
          <div className="relative w-40 h-40 mx-auto mb-4">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-100 stroke-current"
                strokeWidth="10"
                cx="50"
                cy="50"
                r="40"
                fill="transparent">
              </circle>
              <circle
                className={`stroke-current ${score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}
                strokeWidth="10"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                strokeDasharray={`${score * 2.51} 251.2`}
                transform="rotate(-90 50 50)">
              </circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-gray-900">{score}</span>
              <span className={`text-xs font-bold uppercase tracking-wider ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                Grade {grade}
              </span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {score >= 80 ? 'Excellent Match' : score >= 60 ? 'Needs Improvement' : 'Poor Match'}
          </h2>
          <p className="text-sm text-gray-500 max-w-[250px] mx-auto">
            {data.message || "Analyzed against typical ATS criteria."}
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card
            hoverable
            padding="sm"
            onClick={() => navigate('/ats/breakdown', { state: data })}
            className="flex items-center justify-between p-4 bg-white">
            
            <div className="flex items-center">
              <CheckCircle2 size={20} className="text-indigo-600 mr-2" />
              <span className="text-sm font-semibold text-gray-900">
                Breakdown
              </span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Card>
          <Card
            hoverable
            padding="sm"
            onClick={() => navigate('/ats/suggestions', { state: data })}
            className="flex items-center justify-between p-4 bg-yellow-50 border-yellow-100">
            
            <div className="flex items-center">
              <AlertTriangle size={20} className="text-yellow-600 mr-2" />
              <span className="text-sm font-semibold text-yellow-900">
                Fix Issues
              </span>
            </div>
            <ChevronRight size={18} className="text-yellow-600" />
          </Card>
        </div>

        <Card>
          <h3 className="font-bold text-gray-900 mb-3">Quick Summary</h3>
          <ul className="space-y-2 text-sm">
            {data.matched_skills && data.matched_skills.length > 0 ? (
              data.matched_skills.map((skill: string, index: number) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2
                    size={16}
                    className="text-green-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-600 capitalize">
                    Matched Skill: {skill}
                  </span>
                </li>
              ))
            ) : (
              <li className="flex items-start">
                <AlertTriangle
                  size={16}
                  className="text-yellow-500 mr-2 mt-0.5 shrink-0" />
                <span className="text-gray-600">
                  No key skills matched the job description.
                </span>
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
};