import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
export const ATSScoreBreakdown = () => {
  const categories = [
  {
    name: 'File Compatibility',
    score: 100,
    color: 'bg-green-500'
  },
  {
    name: 'Formatting & Layout',
    score: 45,
    color: 'bg-red-500'
  },
  {
    name: 'Section Headings',
    score: 80,
    color: 'bg-green-500'
  },
  {
    name: 'Readability',
    score: 70,
    color: 'bg-yellow-500'
  },
  {
    name: 'Keyword Density',
    score: 60,
    color: 'bg-yellow-500'
  }];

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Score Breakdown" />

      <div className="p-4 space-y-4">
        <Card>
          <h3 className="font-bold text-gray-900 mb-6">Category Scores</h3>
          <div className="space-y-5">
            {categories.map((cat, i) =>
            <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{cat.name}</span>
                  <span className="font-bold text-gray-900">
                    {cat.score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                  className={`h-2 rounded-full ${cat.color}`}
                  style={{
                    width: `${cat.score}%`
                  }}>
                </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-900 mb-3">What this means</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your file format (PDF) is perfect, but the internal layout uses
            complex structures like tables or columns that ATS bots cannot read
            properly. This causes your score to drop significantly in the
            Formatting category.
          </p>
        </Card>
      </div>
    </div>);

};