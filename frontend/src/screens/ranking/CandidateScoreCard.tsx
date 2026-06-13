import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ChevronRight, Mail, Phone, FileText } from 'lucide-react';

export const CandidateScoreCard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const candidate = location.state?.candidate || {
    name: 'Sarah Smith (Demo)',
    role: 'Senior Frontend Engineer',
    score: 92,
    id: 1,
  };

  const initials = candidate.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  const scores = [
  {
    label: 'Skills Match',
    value: Math.min(100, candidate.score + 3),
    color: 'bg-green-500'
  },
  {
    label: 'Experience',
    value: Math.max(0, candidate.score - 4),
    color: 'bg-indigo-500'
  },
  {
    label: 'Education',
    value: Math.min(100, candidate.score + 8),
    color: 'bg-blue-500'
  },
  {
    label: 'Keywords',
    value: Math.max(0, candidate.score - 7),
    color: 'bg-purple-500'
  }];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SubPageHeader title="Candidate Score" />

      <div className="p-4 space-y-4">
        <Card className="text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-indigo-600"></div>
          <div className="relative z-10 mt-6">
            <div className="w-20 h-20 bg-white rounded-full mx-auto border-4 border-white shadow-sm flex items-center justify-center text-2xl font-bold text-gray-500 mb-3">
              {initials}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{candidate.name}</h2>
            <p className="text-gray-500 text-sm mb-4">
              {candidate.role}
            </p>

            <div className="flex justify-center gap-3 mb-4">
              <button 
                onClick={() => navigate(`/resume/${candidate.id}/contact`, { state: { candidate } })}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                <Mail size={18} />
              </button>
              <button 
                onClick={() => navigate(`/resume/${candidate.id}/contact`, { state: { candidate } })}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                <Phone size={18} />
              </button>
              <button
                onClick={() => navigate(`/resume/${candidate.id}`, { state: { candidate } })}
                className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100">
                
                <FileText size={18} />
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Overall Match</h3>
            <span className={`text-3xl font-black ${candidate.score >= 80 ? 'text-green-500' : candidate.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
              {candidate.score}%
            </span>
          </div>

          <div className="space-y-4">
            {scores.map((score, i) =>
            <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">
                    {score.label}
                  </span>
                  <span className="font-bold text-gray-900">
                    {score.value}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                  className={`h-2 rounded-full ${score.color}`}
                  style={{
                    width: `${score.value}%`
                  }}>
                </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card
            hoverable
            padding="sm"
            onClick={() => navigate('/ranking/skills')}
            className="flex items-center justify-between p-4">
            
            <span className="text-sm font-semibold text-gray-900">
              Skills Analysis
            </span>
            <ChevronRight size={18} className="text-gray-400" />
          </Card>
          <Card
            hoverable
            padding="sm"
            onClick={() => navigate('/ranking/similarity')}
            className="flex items-center justify-between p-4">
            
            <span className="text-sm font-semibold text-gray-900">
              Similarity Analysis
            </span>
            <ChevronRight size={18} className="text-gray-400" />
          </Card>
        </div>
      </div>
    </div>);

};