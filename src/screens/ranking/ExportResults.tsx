import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, FileSpreadsheet, Mail, Link as LinkIcon } from 'lucide-react';
export const ExportResults = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Export Results" />

      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-500 mb-2">
          Choose how you want to share or save the analysis results.
        </p>

        <Card
          hoverable
          className="flex items-center p-4 border-2 border-transparent hover:border-indigo-600">
          
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mr-4">
            <FileText size={24} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">PDF Report</h3>
            <p className="text-xs text-gray-500">
              Detailed visual report with charts
            </p>
          </div>
        </Card>

        <Card
          hoverable
          className="flex items-center p-4 border-2 border-transparent hover:border-indigo-600">
          
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4">
            <FileSpreadsheet size={24} className="text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">CSV Export</h3>
            <p className="text-xs text-gray-500">Raw data for spreadsheets</p>
          </div>
        </Card>

        <Card
          hoverable
          className="flex items-center p-4 border-2 border-transparent hover:border-indigo-600">
          
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
            <Mail size={24} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Email to Team</h3>
            <p className="text-xs text-gray-500">
              Send directly to hiring managers
            </p>
          </div>
        </Card>

        <Card
          hoverable
          className="flex items-center p-4 border-2 border-transparent hover:border-indigo-600">
          
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
            <LinkIcon size={24} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Share Link</h3>
            <p className="text-xs text-gray-500">
              Generate a secure view-only link
            </p>
          </div>
        </Card>

        <div className="pt-6">
          <Button fullWidth size="lg">
            Generate Export
          </Button>
        </div>
      </div>
    </div>);

};