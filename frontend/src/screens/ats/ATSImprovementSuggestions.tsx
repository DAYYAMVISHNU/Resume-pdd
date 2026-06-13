import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { AlertOctagon, AlertTriangle, Info } from 'lucide-react';
export const ATSImprovementSuggestions = () => {
  const suggestions = [
  {
    type: 'critical',
    title: 'Remove Tables & Columns',
    desc: 'ATS systems read left-to-right, top-to-bottom. Tables scramble this order. Use standard tabs and spacing instead.',
    icon: AlertOctagon,
    color: 'text-red-600',
    bg: 'bg-red-50'
  },
  {
    type: 'warning',
    title: 'Standardize Section Headers',
    desc: 'Change "What I\'ve Done" to "Experience" or "Work History" so the bot knows where to look.',
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50'
  },
  {
    type: 'info',
    title: 'Increase Keyword Density',
    desc: 'Add more industry-standard terms related to your target role to improve searchability.',
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  }];

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="How to Improve" />

      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-500 mb-2">
          Fix these issues to increase your ATS score to 90+.
        </p>

        {suggestions.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="p-4">
              <div className="flex items-start">
                <div
                  className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center mr-3 shrink-0`}>
                  
                  <Icon size={20} className={s.color} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            </Card>);

        })}
      </div>
    </div>);

};