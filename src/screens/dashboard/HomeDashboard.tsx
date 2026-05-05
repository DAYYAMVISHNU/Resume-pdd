import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BottomNav } from '../../components/layout/BottomNav';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Bell,
  Plus,
  FileText,
  Users,
  CheckCircle,
  ChevronRight } from
'lucide-react';
export const HomeDashboard = () => {
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [realStats, setRealStats] = React.useState({
    totalAnalyses: 0,
    resumesScanned: 0,
    avgScore: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/analytics`);
        if (response.ok) {
          const data = await response.json();
          let avgScore = 0;
          if (data.score_history && data.score_history.length > 0) {
             const sum = data.score_history.reduce((acc: any, curr: any) => acc + curr.score, 0);
             avgScore = Math.round(sum / data.score_history.length);
          }
          setRealStats({
            totalAnalyses: data.total_analyses,
            resumesScanned: data.total_candidates,
            avgScore: avgScore
          });
          setRecentActivity((data.recent_analyses || []).slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch real stats", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
  {
    label: 'Total Analyses',
    value: realStats.totalAnalyses.toString(),
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    label: 'Resumes Scanned',
    value: realStats.resumesScanned.toString(),
    icon: Users,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50'
  },
  {
    label: 'Avg Match Score',
    value: realStats.avgScore + '%',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50'
  }];

  const userName = localStorage.getItem('userName') || 'Demo User';
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-indigo-600 px-6 pt-12 pb-6 rounded-b-[2rem] shadow-sm relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-indigo-100 text-sm font-medium mb-1">
              {getGreeting()}
            </p>
            <h1 className="text-2xl font-bold text-white">{userName}</h1>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white relative">
            
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border-2 border-indigo-600"></span>
          </button>
        </div>

        <Card
          padding="none"
          className="bg-white/10 border-white/20 backdrop-blur-md overflow-hidden">
          
          <div className="p-5 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">New Analysis</h3>
              <p className="text-indigo-100 text-sm">
                Rank candidates or check ATS score
              </p>
            </div>
            <button
              onClick={() => navigate('/new-analysis')}
              className="w-12 h-12 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              
              <Plus size={24} />
            </button>
          </div>
        </Card>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: i * 0.1
                }}>
                
                <Card
                  padding="sm"
                  className="flex flex-col items-center text-center h-full">
                  
                  <div
                    className={`w-10 h-10 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-2`}>
                    
                    <Icon size={18} />
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {stat.value}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-1">
                    {stat.label}
                  </span>
                </Card>
              </motion.div>);

          })}
        </div>

        {/* Recent Activity */}
        {!isAdmin && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Analyses</h2>
              <button
                onClick={() => navigate('/recent')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                See all
              </button>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}>
                  <Card
                    hoverable
                    padding="sm"
                    onClick={() => navigate('/ranking/overview')}
                    className="flex items-center p-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                      <FileText size={24} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {activity.role}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span>{activity.date}</span>
                        <span className="mx-2">•</span>
                        <span>{activity.count} resumes</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-2">
                      <Badge variant={activity.topScore >= 80 ? 'success' : 'warning'}>
                        Top: {activity.topScore}%
                      </Badge>
                      <ChevronRight size={16} className="text-gray-400 mt-2" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>);

};