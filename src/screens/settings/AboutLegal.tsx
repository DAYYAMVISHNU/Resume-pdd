import React, { useState } from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { FileSearch, ChevronDown } from 'lucide-react';

export const AboutLegal = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'terms',
      title: 'Terms of Service',
      content: 'By using Resume Analysis, you agree to our terms. We provide resume analysis "as is" without warranties. You must not misuse our services, attempt to reverse-engineer the AI, or use the platform for unlawful purposes.'
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      content: 'We respect your privacy. Uploaded resumes are processed temporarily for analysis and are not stored permanently unless you explicitly choose to save them. We do not sell your personal data to third parties.'
    },
    {
      id: 'licenses',
      title: 'Open Source Licenses',
      content: 'Resume Analysis is built using incredible open-source software including React, Vite, Tailwind CSS, Lucide Icons, and Framer Motion. We thank the open-source community for their contributions.'
    }
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SubPageHeader title="About & Legal" />

      <div className="p-4 space-y-6">
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileSearch size={40} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Resume Analysis</h2>
          <p className="text-sm text-gray-500 mt-1">
            Version 2.4.1 (Build 492)
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {sections.map((section, index) => (
            <div key={section.id} className={`${index !== sections.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div 
                className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <span className="text-sm font-medium text-gray-900">
                  {section.title}
                </span>
                <ChevronDown 
                  size={18} 
                  className={`text-gray-400 transition-transform duration-200 ${expandedSection === section.id ? 'rotate-180' : ''}`} 
                />
              </div>
              
              {expandedSection === section.id && (
                <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed bg-gray-50/50">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          © 2026 Resume Analysis Inc.
          <br />
          All rights reserved.
        </p>
      </div>
    </div>
  );
};