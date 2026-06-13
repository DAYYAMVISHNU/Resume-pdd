import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../../components/layout/BottomNav';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CheckCircle, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import { getApiUrl } from '../../config/ApiConfig';

export const ATSScoreHome = () => {
  const navigate = useNavigate();
  const [recentChecks, setRecentChecks] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await fetch(getApiUrl('/analytics'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Filter for ATS compatibility checks or just take all recent analyses
          const atsChecks = (data.recent_analyses || []).filter((a: any) => a.role === 'ATS Compatibility Check' || a.role === 'Resume Scan');
          setRecentChecks(atsChecks.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to fetch analyses", err);
      }
    };
    fetchAnalyses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-indigo-600 px-6 pt-12 pb-8 rounded-b-[2rem] shadow-sm text-white">
        <h1 className="text-2xl font-bold mb-2">ATS Checker</h1>
        <p className="text-indigo-100 text-sm">
          Ensure your resumes can be read by Applicant Tracking Systems.
        </p>
      </div>

      <div className="p-4 -mt-6">
        <Card className="mb-6 shadow-md">
          <div className="flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-full mx-auto mb-4">
            <CheckCircle size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
            Check a Resume
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Upload a single resume to get a comprehensive ATS compatibility
            score and improvement suggestions.
          </p>
          <Button fullWidth size="lg" onClick={() => navigate('/ats/upload')}>
            Upload Resume
          </Button>
        </Card>

        <h3 className="font-bold text-gray-900 mb-3 px-1">Recent Checks</h3>
        <div className="space-y-3">
          {recentChecks.length > 0 ? (
            recentChecks.map((item, i) =>
            <Card
              key={i}
              hoverable
              padding="sm"
              onClick={() => navigate('/ats/results')}
              className="flex items-center p-3">
              
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <FileText size={20} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">
                    {item.role || 'Recent Scan'}
                  </h4>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
                <div className="flex items-center">
                  <span
                  className={`text-lg font-bold mr-2 ${item.topScore >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                  
                    {item.topScore}
                  </span>
                  <ArrowRight size={16} className="text-gray-400" />
                </div>
              </Card>
            )
          ) : (
            <p className="text-sm text-gray-500 px-1">No recent checks yet. Upload a resume to get started!</p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>);

};