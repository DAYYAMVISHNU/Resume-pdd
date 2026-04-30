import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileText, Trash2, Eye, Plus } from 'lucide-react';
export const ResumeListView = () => {
  const navigate = useNavigate();
  const resumes = [
  {
    id: 1,
    name: 'Sarah Smith',
    filename: 'sarah_smith_cv.pdf',
    status: 'Parsed',
    size: '1.2 MB'
  },
  {
    id: 2,
    name: 'Michael Chen',
    filename: 'michael_chen_resume.docx',
    status: 'Parsed',
    size: '845 KB'
  },
  {
    id: 3,
    name: 'Emily Jones',
    filename: 'emily_jones_2023.pdf',
    status: 'Parsed',
    size: '2.1 MB'
  },
  {
    id: 4,
    name: 'David Wilson',
    filename: 'david_w_resume.pdf',
    status: 'Error',
    size: '4.5 MB'
  }];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      <SubPageHeader
        title="Uploaded Resumes"
        rightAction={
        <button
          onClick={() => navigate('/upload')}
          className="p-2 text-indigo-600">
          
            <Plus size={20} />
          </button>
        } />
      

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-sm font-medium text-gray-500">
            {resumes.length} files total
          </span>
          <span className="text-sm font-medium text-green-600">3 ready</span>
        </div>

        {resumes.map((resume) =>
        <Card key={resume.id} padding="sm" className="flex items-center p-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mr-3 shrink-0">
              <FileText size={20} className="text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {resume.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {resume.filename} • {resume.size}
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Badge
              variant={resume.status === 'Parsed' ? 'success' : 'danger'}>
              
                {resume.status}
              </Badge>
              {resume.status === 'Parsed' &&
            <button
              onClick={() => navigate('/upload/preview')}
              className="p-1.5 text-gray-400 hover:text-indigo-600 bg-gray-50 rounded-md">
              
                  <Eye size={16} />
                </button>
            }
              <button className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 rounded-md">
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        )}
      </div>

      <div className="fixed bottom-0 w-full max-w-[430px] p-4 bg-white border-t border-gray-100 pb-safe">
        <Button fullWidth size="lg" onClick={() => navigate('/upload/confirm')}>
          Review & Confirm
        </Button>
      </div>
    </div>);

};