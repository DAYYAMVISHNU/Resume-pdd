import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Button } from '../../components/ui/Button';
import { UploadCloud, FileText, X } from 'lucide-react';

export const UploadResumes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  let jdText = location.state?.jdText || '';
  
  // Fallback to localStorage if state is lost
  if (!jdText) {
    jdText = localStorage.getItem('currentJobDescription') || '';
  }
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SubPageHeader title="Upload Resumes" />

      <div className="flex-1 p-4 flex flex-col">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Add Candidates
          </h2>
          <p className="text-sm text-gray-500">
            Upload resumes to compare against the job description.
          </p>
        </div>

        <input
          type="file"
          accept=".pdf,.docx,.txt"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
        />

        <div
          className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-colors cursor-pointer ${isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 bg-white hover:border-indigo-500'}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 pointer-events-none">
            <UploadCloud size={32} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 pointer-events-none">
            Drag & drop files
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6 max-w-[250px] pointer-events-none">
            Supported formats: PDF, DOCX, TXT. Max file size: 10MB.
          </p>
          <Button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            Browse Files
          </Button>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="font-semibold text-gray-700">Selected Files</span>
              <button 
                onClick={() => setFiles([])}
                className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm"
                >
                  <div className="flex items-center overflow-hidden">
                    <FileText size={18} className="text-gray-400 mr-3 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFile(i)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors ml-2 shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <Button 
          fullWidth 
          size="lg" 
          disabled={files.length === 0}
          onClick={() => navigate('/upload/progress', { state: { files, jdText } })}
        >
          Continue with {files.length} file{files.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
};