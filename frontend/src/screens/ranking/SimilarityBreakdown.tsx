import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const SimilarityBreakdown = () => {
  const data = [
  {
    name: 'Exact Keyword Match',
    value: 45,
    color: '#4F46E5'
  },
  {
    name: 'Semantic Match',
    value: 35,
    color: '#818CF8'
  },
  {
    name: 'Contextual Match',
    value: 12,
    color: '#C7D2FE'
  },
  {
    name: 'Missing',
    value: 8,
    color: '#F3F4F6'
  }];

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Similarity Analysis" />

      <div className="p-4 space-y-4">
        <Card>
          <h3 className="font-bold text-gray-900 mb-4">
            How AI Scored This Resume
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value">
                  
                  {data.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.color} />
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {data.map((item, i) =>
            <div
              key={i}
              className="flex items-center justify-between text-sm">
              
                <div className="flex items-center">
                  <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor: item.color
                  }}>
                </div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}%</span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-900 mb-3">
            Semantic Matches Found
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            The AI understood these terms as equivalent to your requirements:
          </p>
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <span className="text-indigo-600 font-medium">
                "Frontend Architecture"
              </span>{' '}
              matched with requirement{' '}
              <span className="text-gray-900 font-medium">"System Design"</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <span className="text-indigo-600 font-medium">
                "Mentored 3 juniors"
              </span>{' '}
              matched with requirement{' '}
              <span className="text-gray-900 font-medium">
                "Leadership experience"
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>);

};