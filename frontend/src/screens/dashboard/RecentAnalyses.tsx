import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { BottomNav } from '../../components/layout/BottomNav';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Search, Filter, FileText, MoreVertical } from 'lucide-react';
import { getApiUrl } from '../../config/ApiConfig';

export const RecentAnalyses = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await fetch(getApiUrl('/analytics'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAnalyses(data.recent_analyses || []);
        }
      } catch (err) {
        console.error("Failed to fetch analyses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SubPageHeader
        title="All Analyses"
        rightAction={
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Filter size={20} />
          </button>
        } />
      

      <div className="p-4">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm"
            placeholder="Search by job title..." />
          
        </div>

        <div className="space-y-3">
          {analyses.map((analysis) =>
          <Card
            key={analysis.id}
            hoverable
            padding="sm"
            onClick={() => navigate('/ranking/overview')}
            className="p-4">
            
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mr-3">
                    <FileText size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {analysis.role}
                    </h3>
                    <p className="text-xs text-gray-500">{analysis.date}</p>
                  </div>
                </div>
                <button
                className="text-gray-400 hover:text-gray-600"
                onClick={(e) => e.stopPropagation()}>
                
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex space-x-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Resumes</span>
                    <span className="font-medium text-gray-900">
                      {analysis.count}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Top Match</span>
                    <span
                    className={`font-medium ${analysis.topScore >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                    
                      {analysis.topScore}%
                    </span>
                  </div>
                </div>
                <Badge variant="neutral">{analysis.status}</Badge>
              </div>
            </Card>
          )}
        </div>
      </div>

      <BottomNav />
    </div>);

};