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
  Legend,
  ResponsiveContainer } from
'recharts';
export const ATSScoreComparison = () => {
  const data = [
  {
    name: 'Formatting',
    v1: 45,
    v2: 90
  },
  {
    name: 'Keywords',
    v1: 60,
    v2: 85
  },
  {
    name: 'Sections',
    v1: 80,
    v2: 100
  },
  {
    name: 'Readability',
    v1: 70,
    v2: 95
  }];

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Compare Versions" />

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-sm font-medium text-gray-500">
            v1 (Original)
          </span>
          <span className="text-sm font-bold text-indigo-600">vs</span>
          <span className="text-sm font-medium text-gray-900">
            v2 (Current)
          </span>
        </div>

        <Card>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 0,
                  left: -20,
                  bottom: 5
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
                    fontSize: 10
                  }} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6B7280',
                    fontSize: 12
                  }} />
                
                <Tooltip
                  cursor={{
                    fill: '#F3F4F6'
                  }} />
                
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '12px'
                  }} />
                
                <Bar
                  dataKey="v1"
                  name="Original"
                  fill="#9CA3AF"
                  radius={[4, 4, 0, 0]}
                  barSize={20} />
                
                <Bar
                  dataKey="v2"
                  name="Current"
                  fill="#4F46E5"
                  radius={[4, 4, 0, 0]}
                  barSize={20} />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-indigo-50 border-indigo-100">
          <h3 className="font-bold text-indigo-900 mb-2">Great Progress!</h3>
          <p className="text-sm text-indigo-700">
            By removing the tables and standardizing your section headers, your
            formatting score increased by 45 points.
          </p>
        </Card>
      </div>
    </div>);

};