import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Button } from '../../components/ui/Button';
import { Search, X } from 'lucide-react';
export const SearchFilter = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SubPageHeader
        title="Search & Filter"
        rightAction={
          <button onClick={handleBack} className="text-gray-500">
            <X size={24} />
          </button>
        }
      />

      <div className="p-4">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            autoFocus
            className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm"
            placeholder="Search candidates, jobs, or skills..." />
          
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Score Range
            </h3>
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-200">
                90%+
              </button>
              <button className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                80%+
              </button>
              <button className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                70%+
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Date Added</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                Today
              </button>
              <button className="py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-200">
                This Week
              </button>
              <button className="py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                This Month
              </button>
              <button className="py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                All Time
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Status</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Shortlisted
              </span>
              <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                Interviewed
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Rejected
              </span>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 w-full max-w-[430px] p-4 bg-white border-t border-gray-100 pb-safe left-1/2 transform -translate-x-1/2">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              Clear
            </Button>
            <Button className="flex-[2]">Apply Filters</Button>
          </div>
        </div>
      </div>
    </div>);

};