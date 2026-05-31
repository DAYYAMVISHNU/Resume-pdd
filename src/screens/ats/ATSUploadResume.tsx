import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Button } from '../../components/ui/Button';
import { UploadCloud, Loader2, FileText, X } from 'lucide-react';

import { getApiUrl } from '../../config/ApiConfig';

export const ATSUploadResume = () => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      // Use XMLHttpRequest instead of fetch to bypass Android WebView FormData hang bug
      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", getApiUrl('/ats_check'), true);
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token') || ''}`);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject(new Error("Invalid JSON response"));
            }
          } else {
            reject(new Error(`Server error: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.timeout = 60000; // 60 seconds timeout for Render cold start
        xhr.ontimeout = () => reject(new Error("Request timed out after 60s"));
        xhr.send(formData);
      });

      console.log("Backend Result:", data);
      navigate('/ats/results', { state: data });

    } catch (error: any) {
      console.error("Backend connection error:", error);
      alert(`Backend connection failed: ${error?.message || 'Unknown error'}\nPlease ensure your internet is connected.`);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SubPageHeader title="Upload for ATS" onBack={() => navigate('/new-analysis')} />

      <div className="flex-1 p-4 flex flex-col justify-center">
        {isAnalyzing ? (
          <div className="text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={40} className="text-indigo-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Analyzing Format...
            </h2>
            <p className="text-gray-500 max-w-[250px] mx-auto">
              Connecting to backend...<br/>
              <span className="text-xs text-indigo-500 font-medium">(First request may take up to 60 seconds to wake up the server)</span>
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Select a Resume
              </h2>
              <p className="text-sm text-gray-500">
                Upload a PDF or DOCX file to check its ATS compatibility.
              </p>
            </div>

            <input
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
            />

            {!selectedFile ? (
              <div 
                className="border-2 border-dashed border-gray-300 bg-white rounded-2xl flex flex-col items-center justify-center p-8 mb-8 cursor-pointer hover:border-indigo-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud size={32} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Tap to browse or drag and drop
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  PDF, DOCX, TXT. Max file size: 5MB
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mr-4">
                    <FileText size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            <Button fullWidth size="lg" onClick={handleUpload} disabled={!selectedFile}>
              Analyze Resume
            </Button>
          </>
        )}
      </div>
    </div>
  );
};