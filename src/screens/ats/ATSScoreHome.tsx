import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../../components/layout/BottomNav';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CheckCircle, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
export const ATSScoreHome = () => {
  const navigate = useNavigate();
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
          {[
          {
            name: 'john_doe_v2.pdf',
            score: 85,
            date: 'Today'
          },
          {
            name: 'sarah_smith_cv.docx',
            score: 42,
            date: 'Yesterday'
          }].
          map((item, i) =>
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
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500">{item.date}</p>
              </div>
              <div className="flex items-center">
                <span
                className={`text-lg font-bold mr-2 ${item.score >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                
                  {item.score}
                </span>
                <ArrowRight size={16} className="text-gray-400" />
              </div>
            </Card>
          )}
        </div>
      </div>

      <BottomNav />
    </div>);

};