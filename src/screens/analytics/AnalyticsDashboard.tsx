import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../../components/layout/BottomNav';
import { Card } from '../../components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line } from
'recharts';
import { ChevronRight, TrendingUp, Users, FileText } from 'lucide-react';
export const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const volumeData = [
  {
    name: 'Mon',
    resumes: 12
  },
  {
    name: 'Tue',
    resumes: 19
  },
  {
    name: 'Wed',
    resumes: 15
  },
  {
    name: 'Thu',
    resumes: 22
  },
  {
    name: 'Fri',
    resumes: 30
  },
  {
    name: 'Sat',
    resumes: 5
  },
  {
    name: 'Sun',
    resumes: 8
  }];

  const scoreData = [
  {
    name: 'Week 1',
    score: 65
  },
  {
    name: 'Week 2',
    score: 68
  },
  {
    name: 'Week 3',
    score: 74
  },
  {
    name: 'Week 4',
    score: 76
  }];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-indigo-600 px-6 pt-12 pb-8 rounded-b-[2rem] shadow-sm text-white">
        <h1 className="text-2xl font-bold mb-2">Analytics</h1>
        <p className="text-indigo-100 text-sm">
          Insights from your resume processing.
        </p>
      </div>

      <div className="p-4 -mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card padding="sm" className="p-4">
            <div className="flex items-center text-gray-500 mb-2">
              <Users size={16} className="mr-1" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Candidates
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">1,492</div>
            <div className="text-xs text-green-500 flex items-center mt-1">
              <TrendingUp size={12} className="mr-1" /> +12% this week
            </div>
          </Card>
          <Card padding="sm" className="p-4">
            <div className="flex items-center text-gray-500 mb-2">
              <FileText size={16} className="mr-1" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Analyses
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">124</div>
            <div className="text-xs text-green-500 flex items-center mt-1">
              <TrendingUp size={12} className="mr-1" /> +5% this week
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Resume Volume</h3>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeData}
                margin={{
                  top: 0,
                  right: 0,
                  left: -20,
                  bottom: 0
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
                    fontSize: 10
                  }} />
                
                <Tooltip
                  cursor={{
                    fill: '#F3F4F6'
                  }} />
                
                <Bar dataKey="resumes" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Avg. Match Score</h3>
            <span className="text-xs text-gray-500">This Month</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={scoreData}
                margin={{
                  top: 5,
                  right: 5,
                  left: -20,
                  bottom: 0
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
                    fontSize: 10
                  }}
                  domain={[0, 100]} />
                
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: '#10B981',
                    strokeWidth: 2,
                    stroke: '#fff'
                  }} />
                
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card
            hoverable
            padding="sm"
            onClick={() => navigate('/analytics/skills')}
            className="flex items-center justify-between p-4">
            
            <span className="text-sm font-semibold text-gray-900">
              Skills Trends
            </span>
            <ChevronRight size={18} className="text-gray-400" />
          </Card>
          <Card
            hoverable
            padding="sm"
            onClick={() => navigate('/analytics/funnel')}
            className="flex items-center justify-between p-4">
            
            <span className="text-sm font-semibold text-gray-900">
              Hiring Funnel
            </span>
            <ChevronRight size={18} className="text-gray-400" />
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>);

};