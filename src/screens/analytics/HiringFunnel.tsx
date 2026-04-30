import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
export const HiringFunnel = () => {
  const funnel = [
  {
    stage: 'Resumes Uploaded',
    count: 1492,
    percentage: 100,
    color: 'bg-indigo-100'
  },
  {
    stage: 'Parsed Successfully',
    count: 1420,
    percentage: 95,
    color: 'bg-indigo-200'
  },
  {
    stage: 'High Match (>80%)',
    count: 345,
    percentage: 23,
    color: 'bg-indigo-300'
  },
  {
    stage: 'Shortlisted',
    count: 85,
    percentage: 5,
    color: 'bg-indigo-400'
  },
  {
    stage: 'Interviewed',
    count: 32,
    percentage: 2,
    color: 'bg-indigo-500'
  },
  {
    stage: 'Hired',
    count: 8,
    percentage: 0.5,
    color: 'bg-indigo-600'
  }];

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Hiring Funnel" />

      <div className="p-4">
        <Card>
          <h3 className="font-bold text-gray-900 mb-6 text-center">
            Conversion Rates
          </h3>

          <div className="space-y-2 flex flex-col items-center">
            {funnel.map((step, i) => {
              // Calculate width based on percentage, but keep a minimum width for visibility
              const width = Math.max(step.percentage, 20);
              return (
                <div
                  key={i}
                  className="w-full flex flex-col items-center group">
                  
                  <div
                    className={`${step.color} h-12 flex items-center justify-between px-4 rounded-lg transition-all duration-300 group-hover:scale-[1.02]`}
                    style={{
                      width: `${width}%`
                    }}>
                    
                    <span
                      className={`text-xs font-bold ${i > 3 ? 'text-white' : 'text-indigo-900'} truncate mr-2`}>
                      
                      {step.stage}
                    </span>
                    <span
                      className={`text-sm font-black ${i > 3 ? 'text-white' : 'text-indigo-900'}`}>
                      
                      {step.count}
                    </span>
                  </div>
                  {i < funnel.length - 1 &&
                  <div className="h-4 w-px bg-gray-300 my-1"></div>
                  }
                </div>);

            })}
          </div>
        </Card>
      </div>
    </div>);

};