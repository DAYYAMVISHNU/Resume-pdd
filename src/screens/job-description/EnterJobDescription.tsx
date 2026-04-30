import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Button } from '../../components/ui/Button';
import { FileText, LayoutTemplate, Save } from 'lucide-react';
export const EnterJobDescription = () => {
  const navigate = useNavigate();
  const [jdText, setJdText] = useState('');
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SubPageHeader title="Job Description" />

      <div className="flex-1 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Paste or Type JD
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/job-description/saved')}
              className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
              title="Saved JDs">
              
              <Save size={18} />
            </button>
            <button
              onClick={() => navigate('/job-description/templates')}
              className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
              title="Templates">
              
              <LayoutTemplate size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col mb-6">
          <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center space-x-3">
            <FileText size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Job Title (e.g. Senior Frontend Engineer)"
              className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full p-0" />
            
          </div>
          <textarea
            className="flex-1 w-full p-4 resize-none border-none focus:ring-0 text-sm text-gray-700 leading-relaxed"
            placeholder="Paste the full job description here... Include responsibilities, requirements, and nice-to-haves."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)} />
          
        </div>

        <Button
          fullWidth
          size="lg"
          disabled={jdText.length < 50}
          onClick={() => navigate('/job-description/preview', { state: { jdText } })}>
          
          Analyze Description
        </Button>
      </div>
    </div>);

};