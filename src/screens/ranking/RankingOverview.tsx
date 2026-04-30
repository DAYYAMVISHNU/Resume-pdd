import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Trophy, ChevronRight, Download, Users } from 'lucide-react';

export const RankingOverview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { candidates = [] } = location.state || {};

  // Fallback to empty state if no candidates
  if (candidates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 flex flex-col">
        <SubPageHeader title="Analysis Results" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Candidates Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            It looks like no resumes were uploaded or analyzed.
          </p>
          <Button onClick={() => navigate('/upload')}>
            Upload Resumes
          </Button>
        </div>
      </div>
    );
  }

  const topCandidate = candidates[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SubPageHeader
        title="Analysis Results"
        rightAction={
          <button
            onClick={() => navigate('/ranking/export')}
            className="p-2 text-indigo-600">
            <Download size={20} />
          </button>
        } 
      />

      <div className="p-4">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Top Match</h2>
            <Trophy size={24} className="text-yellow-400" />
          </div>
          <div className="flex items-end justify-between">
            <div className="flex-1 pr-2">
              <p className="text-3xl font-bold mb-1 truncate">{topCandidate.name}</p>
              <p className="text-indigo-200 text-sm truncate">{topCandidate.role}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-4xl font-black text-yellow-400">
                {topCandidate.score}%
              </div>
              <p className="text-xs text-indigo-200 uppercase tracking-wider mt-1">
                Match Score
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/20 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-white/20 text-white hover:bg-white/30 border-none"
              onClick={() => navigate(`/ranking/candidate/${topCandidate.id}`, { state: { candidate: topCandidate } })}>
              View Details
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900">All Candidates</h3>
          <button
            onClick={() => navigate('/ranking/table', { state: { candidates } })}
            className="text-sm font-medium text-indigo-600 flex items-center">
            View Table <ChevronRight size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {candidates.map((candidate: any, index: number) => (
            <Card
              key={candidate.id || index}
              hoverable
              padding="sm"
              onClick={() => navigate(`/ranking/candidate/${candidate.id}`, { state: { candidate } })}
              className="flex items-center p-3">
              <div className="w-8 font-bold text-gray-400 text-center">
                #{index + 1}
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3 shrink-0 font-bold text-gray-600">
                {candidate.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-sm font-bold text-gray-900 truncate">
                  {candidate.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {candidate.role}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-lg font-bold ${candidate.score >= 80 ? 'text-green-600' : candidate.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {candidate.score}%
                </span>
                <span className="text-[10px] text-gray-400 uppercase">
                  {candidate.match}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {candidates.length > 1 && (
          <div className="mt-6">
            <Button
              fullWidth
              variant="outline"
              onClick={() => navigate('/ranking/compare', { state: { candidates } })}>
              Compare Candidates
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};