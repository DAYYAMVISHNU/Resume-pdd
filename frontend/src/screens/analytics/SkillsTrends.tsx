import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
export const SkillsTrends = () => {
  const data = [
  {
    name: 'React',
    count: 120
  },
  {
    name: 'TypeScript',
    count: 98
  },
  {
    name: 'Node.js',
    count: 85
  },
  {
    name: 'Python',
    count: 72
  },
  {
    name: 'AWS',
    count: 65
  },
  {
    name: 'Docker',
    count: 45
  }];

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Skills Trends" />

      <div className="p-4 space-y-4">
        <Card>
          <h3 className="font-bold text-gray-900 mb-2">
            Most Requested Skills
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Based on your last 50 job descriptions
          </p>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{
                  top: 0,
                  right: 0,
                  left: 20,
                  bottom: 0
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#E5E7EB" />
                
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#4B5563',
                    fontSize: 12,
                    fontWeight: 500
                  }} />
                
                <Tooltip
                  cursor={{
                    fill: '#F3F4F6'
                  }} />
                
                <Bar
                  dataKey="count"
                  fill="#4F46E5"
                  radius={[0, 4, 4, 0]}
                  barSize={24} />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-indigo-50 border-indigo-100">
          <h3 className="font-bold text-indigo-900 mb-2">Insight</h3>
          <p className="text-sm text-indigo-700">
            Demand for <strong>TypeScript</strong> has increased by 24% in your
            job descriptions over the last quarter, surpassing Node.js.
          </p>
        </Card>
      </div>
    </div>);

};