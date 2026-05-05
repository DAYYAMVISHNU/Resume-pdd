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

        <div className="grid grid-cols-2 gap-3 mb-4">
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

        <Button 
          fullWidth 
          size="lg" 
          onClick={() => navigate('/ats/perfect', { state: data })}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg mb-6 transform transition-all active:scale-[0.98]">
          <div className="flex items-center justify-center">
            <span className="font-bold text-lg">Create Perfect Resume ✨</span>
          </div>
        </Button>



        <Card>
          <h3 className="font-bold text-gray-900 mb-3">Areas for Improvement</h3>
          <ul className="space-y-2 text-sm">
            {data.missing_skills && data.missing_skills.length > 0 && (
              data.missing_skills.map((skill: string, index: number) => (
                <li key={`ms-${index}`} className="flex items-start">
                  <AlertTriangle size={16} className="text-orange-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-600">
                    Missing Skill: <span className="font-semibold capitalize text-gray-800">{skill}</span>
                  </span>
                </li>
              ))
            )}
            {data.missing_keywords && data.missing_keywords.length > 0 && (
              data.missing_keywords.map((keyword: string, index: number) => (
                <li key={`mk-${index}`} className="flex items-start">
                  <AlertTriangle size={16} className="text-yellow-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-600">
                    Missing Keyword: <span className="font-semibold text-gray-800">{keyword}</span>
                  </span>
                </li>
              ))
            )}
            {(!data.missing_skills || data.missing_skills.length === 0) && (!data.missing_keywords || data.missing_keywords.length === 0) && (
              <li className="flex items-start">
                <CheckCircle2 size={16} className="text-green-500 mr-2 mt-0.5 shrink-0" />
                <span className="text-gray-600">
                  Great job! No major missing keywords identified.
                </span>
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
};