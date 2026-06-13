import React from 'react';
import { SubPageHeader } from './SubPageHeader';
import { BottomNav } from './BottomNav';
import { Wrench } from 'lucide-react';
interface PlaceholderProps {
  title: string;
  showBottomNav?: boolean;
}
export const PlaceholderScreen = ({
  title,
  showBottomNav = false
}: PlaceholderProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SubPageHeader title={title} />

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <Wrench size={32} className="text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Under Construction
        </h2>
        <p className="text-gray-500">
          The <strong>{title}</strong> screen is currently being built. Check
          back soon!
        </p>
      </div>

      {showBottomNav && <BottomNav />}
    </div>);

};