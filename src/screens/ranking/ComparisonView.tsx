import React from 'react';
import { useLocation } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';

export const ComparisonView = () => {
  const location = useLocation();
  const passedCandidates = location.state?.candidates || [];

  const candidatesToCompare = passedCandidates.length > 0 
    ? passedCandidates.slice(0, 2).map((c: any) => ({
        name: c.name,
        score: c.score,
        skills: c.matched_skills && c.matched_skills.length > 0 
          ? c.matched_skills.slice(0, 4).join(', ') + (c.matched_skills.length > 4 ? '...' : '') 
          : 'Extracted Skills',
        exp: c.exp || 'Extracted Experience',
        edu: c.edu || 'Extracted Education'
      }))
    : [
        {
          name: 'Sarah Smith (Demo)',
          score: 92,
          skills: 'React, TS, Node',
          exp: '5 yrs',
          edu: 'BS Comp Sci'
        },
        {
          name: 'Michael Chen (Demo)',
          score: 85,
          skills: 'React, JS, Python',
          exp: '3 yrs',
          edu: 'MS Soft Eng'
        }
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Compare Candidates" />

      <div className="p-4">
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Labels Column */}
          <div className="w-1/3 bg-gray-50 border-r border-gray-200 py-4">
            <div className="h-16 flex items-center px-3 border-b border-gray-200 font-semibold text-sm text-gray-500">
              Candidate
            </div>
            <div className="h-12 flex items-center px-3 border-b border-gray-200 font-semibold text-sm text-gray-500">
              Match
            </div>
            <div className="h-20 flex items-center px-3 border-b border-gray-200 font-semibold text-sm text-gray-500">
              Top Skills
            </div>
            <div className="h-12 flex items-center px-3 border-b border-gray-200 font-semibold text-sm text-gray-500">
              Experience
            </div>
            <div className="h-16 flex items-center px-3 font-semibold text-sm text-gray-500">
              Education
            </div>
          </div>

          {/* Candidate Columns */}
          {candidatesToCompare.map((c: any, i: number) =>
          <div
            key={i}
            className={`w-1/3 py-4 ${i === 0 ? 'border-r border-gray-200 bg-indigo-50/30' : ''}`}>
            
              <div className="h-16 flex items-center justify-center px-2 border-b border-gray-200 text-center">
                <span className="font-bold text-sm text-gray-900">
                  {c.name}
                </span>
              </div>
              <div className="h-12 flex items-center justify-center px-2 border-b border-gray-200">
                <span
                className={`font-bold ${c.score >= 90 ? 'text-green-600' : 'text-indigo-600'}`}>
                
                  {c.score}%
                </span>
              </div>
              <div className="h-20 flex items-center justify-center px-2 border-b border-gray-200 text-center">
                <span className="text-xs text-gray-600">{c.skills}</span>
              </div>
              <div className="h-12 flex items-center justify-center px-2 border-b border-gray-200">
                <span className="text-sm text-gray-900">{c.exp}</span>
              </div>
              <div className="h-16 flex items-center justify-center px-2 text-center">
                <span className="text-xs text-gray-600">{c.edu}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

};