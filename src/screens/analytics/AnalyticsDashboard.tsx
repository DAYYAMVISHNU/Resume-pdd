import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../../components/layout/BottomNav';
import { Card } from '../../components/ui/Card';
import { getApiUrl } from '../../config/ApiConfig';
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
  
  const [stats, setStats] = useState({
    candidates: 0,
    analyses: 0,
    volumeData: [
      { name: 'Mon', resumes: 0 },
      { name: 'Tue', resumes: 0 },
      { name: 'Wed', resumes: 0 },
      { name: 'Thu', resumes: 0 },
      { name: 'Fri', resumes: 0 },
      { name: 'Sat', resumes: 0 },
      { name: 'Sun', resumes: 0 }
    ],
    scoreData: [] as any[]
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(getApiUrl('/analytics'));
        if (response.ok) {
          const data = await response.json();
          const volumeData = Object.keys(data.volume_by_day).map(key => ({
            name: key,
            resumes: data.volume_by_day[key]
          }));
          setStats({
            candidates: data.total_candidates,
            analyses: data.total_analyses,
            volumeData,
            scoreData: data.score_history
          });
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      }
    };
    
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-indigo-600 px-6 pt-12 pb-8 rounded-b-[2rem] shadow-sm text-white">
        <h1 className="text-2xl font-bold mb-2">Real Analytics Live</h1>
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
            <div className="text-2xl font-bold text-gray-900">{stats.candidates}</div>
            <div className="text-xs text-green-500 flex items-center mt-1">
              <TrendingUp size={12} className="mr-1" /> Live tracking
            </div>
          </Card>
          <Card padding="sm" className="p-4">
            <div className="flex items-center text-gray-500 mb-2">
              <FileText size={16} className="mr-1" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Analyses
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.analyses}</div>
            <div className="text-xs text-green-500 flex items-center mt-1">
              <TrendingUp size={12} className="mr-1" /> Live tracking
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
                data={stats.volumeData}
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
                data={stats.scoreData}
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
            onClick={() => navigate('/help')}
            className="flex items-center justify-between p-4">
            
            <span className="text-sm font-semibold text-gray-900">
              FAQs & Answers
            </span>
            <ChevronRight size={18} className="text-gray-400" />
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>);

};