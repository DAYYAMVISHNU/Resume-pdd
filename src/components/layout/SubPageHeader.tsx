import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
interface SubPageHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
  onBack?: () => void;
}
export const SubPageHeader = ({
  title,
  rightAction,
  onBack
}: SubPageHeaderProps) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };
  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between">
      <button
        onClick={handleBack}
        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
        
        <ChevronLeft size={24} />
      </button>
      <h1 className="text-lg font-semibold text-gray-900 truncate flex-1 text-center px-2">
        {title}
      </h1>
      <div className="w-10 flex justify-end">{rightAction}</div>
    </div>);

};