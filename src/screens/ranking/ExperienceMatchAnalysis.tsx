import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
export const ExperienceMatchAnalysis = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Experience Match" />

      <div className="p-4 space-y-6">
        <Card>
          <h3 className="font-bold text-gray-900 mb-4">Years of Experience</h3>
          <div className="relative pt-6 pb-2">
            <div className="flex justify-between text-xs text-gray-400 absolute top-0 w-full">
              <span>0</span>
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8+</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 relative">
              {/* Required */}
              <div
                className="absolute top-0 left-0 h-4 bg-gray-300 rounded-full opacity-50"
                style={{
                  width: '62.5%'
                }}>
              </div>
              {/* Actual */}
              <div
                className="absolute top-0 left-0 h-4 bg-indigo-600 rounded-full"
                style={{
                  width: '75%'
                }}>
              </div>
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                <span className="text-gray-600">Required: 5 yrs</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
                <span className="font-bold text-gray-900">Actual: 6 yrs</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="relative pl-4 border-l-2 border-indigo-100 space-y-6 ml-2">
          <div className="relative">
            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white"></div>
            <h4 className="font-bold text-gray-900 text-sm">
              Senior Frontend Engineer
            </h4>
            <p className="text-xs text-indigo-600 mb-2">
              TechCorp • 2020 - Present (3 yrs)
            </p>
            <div className="bg-green-50 text-green-800 text-xs p-2 rounded border border-green-100">
              Highly relevant: Matches "Senior" title and "Frontend" focus.
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-indigo-400 rounded-full border-2 border-white"></div>
            <h4 className="font-bold text-gray-900 text-sm">
              Frontend Developer
            </h4>
            <p className="text-xs text-indigo-600 mb-2">
              WebSolutions • 2017 - 2020 (3 yrs)
            </p>
            <div className="bg-blue-50 text-blue-800 text-xs p-2 rounded border border-blue-100">
              Relevant: Builds foundational experience required for the role.
            </div>
          </div>
        </div>
      </div>
    </div>);

};