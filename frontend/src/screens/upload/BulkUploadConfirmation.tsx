import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Users, FileText, Zap, Loader2 } from 'lucide-react';
export const BulkUploadConfirmation = () => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const handleStart = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      navigate('/ranking/overview');
    }, 2000);
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SubPageHeader title="Confirm Analysis" />

      <div className="flex-1 p-4 flex flex-col justify-center">
        {isAnalyzing ?
        <div className="text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={40} className="text-indigo-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Analyzing Candidates...
            </h2>
            <p className="text-gray-500 max-w-[250px] mx-auto">
              Our AI is comparing 3 resumes against the Senior Frontend Engineer
              requirements.
            </p>
          </div> :

        <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap size={32} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to Rank
              </h2>
              <p className="text-gray-500">
                Everything looks good. Start the analysis to see who matches
                best.
              </p>
            </div>

            <Card className="mb-8">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center text-gray-700">
                  <FileText size={20} className="mr-3 text-indigo-600" />
                  <span className="font-medium">Job Description</span>
                </div>
                <span className="text-sm text-gray-500">
                  Senior Frontend Eng.
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center text-gray-700">
                  <Users size={20} className="mr-3 text-indigo-600" />
                  <span className="font-medium">Resumes to Analyze</span>
                </div>
                <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  3 Files
                </span>
              </div>
            </Card>

            <Button fullWidth size="lg" onClick={handleStart}>
              Start AI Analysis
            </Button>
            <button
            onClick={() => navigate('/upload/list')}
            className="w-full mt-4 p-3 text-sm font-medium text-gray-500 hover:text-gray-700">
            
              Go Back
            </button>
          </>
        }
      </div>
    </div>);

};