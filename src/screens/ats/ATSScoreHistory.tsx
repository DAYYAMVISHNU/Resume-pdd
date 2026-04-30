import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
export const ATSScoreHistory = () => {
  const data = [
  {
    name: 'v1',
    score: 42
  },
  {
    name: 'v2',
    score: 55
  },
  {
    name: 'v3',
    score: 68
  },
  {
    name: 'v4',
    score: 85
  },
  {
    name: 'v5',
    score: 92
  }];

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Score History" />

      <div className="p-4 space-y-4">
        <Card>
          <h3 className="font-bold text-gray-900 mb-4">
            Improvement Over Time
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 20,
                  bottom: 5,
                  left: 0
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB" />
                
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6B7280',
                    fontSize: 12
                  }} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6B7280',
                    fontSize: 12
                  }}
                  domain={[0, 100]} />
                
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} />
                
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: '#4F46E5',
                    strokeWidth: 2,
                    stroke: '#fff'
                  }}
                  activeDot={{
                    r: 6
                  }} />
                
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <h3 className="font-bold text-gray-900 mb-2 px-1 mt-6">
          Version History
        </h3>
        <div className="space-y-3">
          {[...data].reverse().map((v, i) =>
          <Card
            key={i}
            padding="sm"
            className="flex items-center justify-between p-4">
            
              <div>
                <h4 className="font-bold text-gray-900">Resume_{v.name}.pdf</h4>
                <p className="text-xs text-gray-500">
                  Uploaded {i === 0 ? 'Today' : `${i * 2} days ago`}
                </p>
              </div>
              <span
              className={`font-bold ${v.score >= 80 ? 'text-green-600' : v.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              
                {v.score}
              </span>
            </Card>
          )}
        </div>
      </div>
    </div>);

};