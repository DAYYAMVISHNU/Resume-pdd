import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export const UploadProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { files = [], jdText = '' } = location.state || {};
  
  const [progress, setProgress] = useState(0);
  const [fileStatuses, setFileStatuses] = useState<{name: string, status: 'waiting' | 'uploading' | 'done' | 'error', p: number, result?: any}[]>(
    files.map((f: File) => ({ name: f.name, status: 'waiting', p: 0 }))
  );
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (files.length === 0) {
      navigate('/upload');
      return;
    }

    const processFiles = async () => {
      const results: any[] = [];
      let completedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Mark as uploading
        setFileStatuses(prev => {
          const newStatuses = [...prev];
          newStatuses[i] = { ...newStatuses[i], status: 'uploading', p: 50 };
          return newStatuses;
        });

        try {
          const formData = new FormData();
          formData.append("resume", file);
          formData.append("job_desc", jdText || "Generic software engineer requirement");

          const response = await fetch(`http://${window.location.hostname}:5000/analyze`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Backend error");

          const data = await response.json();
          
          results.push({
            id: i + 1,
            name: file.name.split('.')[0].replace(/_/g, ' '),
            score: data.score || 0,
            role: 'Candidate', // Or extract from resume if backend supports it
            match: data.score >= 80 ? 'Excellent' : data.score >= 60 ? 'Good' : 'Fair',
            matched_skills: data.matched_skills || [],
            email: data.email || '',
            phone: data.phone || ''
          });

          setFileStatuses(prev => {
            const newStatuses = [...prev];
            newStatuses[i] = { ...newStatuses[i], status: 'done', p: 100, result: data };
            return newStatuses;
          });
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          setFileStatuses(prev => {
            const newStatuses = [...prev];
            newStatuses[i] = { ...newStatuses[i], status: 'error', p: 0 };
            return newStatuses;
          });
        }

        completedCount++;
        setProgress((completedCount / files.length) * 100);
      }

      setIsProcessing(false);
      
      // Sort results by score
      results.sort((a, b) => b.score - a.score);

      // Save to localStorage
      const topScore = results.length > 0 ? results[0].score : 0;
      const newAnalysis = {
        id: Date.now(),
        role: jdText ? 'Job Match Analysis' : 'Resume Scan',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        count: files.length,
        topScore: topScore,
        status: 'Completed'
      };
      
      const existingAnalyses = JSON.parse(localStorage.getItem('myAnalyses') || '[]');
      localStorage.setItem('myAnalyses', JSON.stringify([newAnalysis, ...existingAnalyses]));
      
      setTimeout(() => {
        navigate('/ranking/overview', { state: { candidates: results } });
      }, 1000);
    };

    processFiles();
  }, [files, jdText, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SubPageHeader title={isProcessing ? "Uploading..." : "Complete!"} />

      <div className="flex-1 p-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center mb-6">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-200 stroke-current"
                strokeWidth="8"
                cx="50"
                cy="50"
                r="40"
                fill="transparent">
              </circle>
              <circle
                className={`${isProcessing ? 'text-indigo-600' : 'text-green-500'} stroke-current transition-all duration-300 ease-out`}
                strokeWidth="8"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                strokeDasharray={`${progress * 2.51} 251.2`}
                transform="rotate(-90 50 50)">
              </circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <h3 className="font-bold text-gray-900">
            {isProcessing ? "Processing Resumes" : "Analysis Complete"}
          </h3>
          <p className="text-sm text-gray-500">
            {isProcessing ? "Extracting text and analyzing formatting..." : "Redirecting to results..."}
          </p>
        </div>

        <div className="space-y-3">
          {fileStatuses.map((file, i) =>
            <div
              key={i}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center overflow-hidden">
                  <FileText size={16} className="text-gray-400 mr-2 shrink-0" />
                  <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                    {file.name}
                  </span>
                </div>
                {file.status === 'done' ? (
                  <div className="flex items-center text-green-500 text-xs font-semibold">
                    <CheckCircle2 size={16} className="mr-1" />
                    {file.result?.score}%
                  </div>
                ) : file.status === 'error' ? (
                  <AlertCircle size={16} className="text-red-500" />
                ) : file.status === 'uploading' ? (
                  <Loader2 size={16} className="text-indigo-600 animate-spin" />
                ) : (
                  <span className="text-xs text-gray-400">Waiting</span>
                )}
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${file.status === 'done' ? 'bg-green-500' : file.status === 'error' ? 'bg-red-500' : 'bg-indigo-600'}`}
                  style={{
                    width: `${Math.min(100, Math.max(0, file.p))}%`
                  }}
                >
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};