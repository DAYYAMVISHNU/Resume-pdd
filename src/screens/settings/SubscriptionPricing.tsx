import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Check } from 'lucide-react';
export const SubscriptionPricing = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Plans & Pricing" />

      <div className="p-4 space-y-4">
        <Card className="border-2 border-indigo-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            CURRENT PLAN
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Pro</h3>
          <div className="flex items-baseline mb-4">
            <span className="text-3xl font-black text-gray-900">$49</span>
            <span className="text-gray-500 ml-1">/month</span>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-sm text-gray-600">
              <Check size={16} className="text-indigo-600 mr-2" /> Up to 500
              resumes/month
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <Check size={16} className="text-indigo-600 mr-2" /> Advanced ATS
              scoring
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <Check size={16} className="text-indigo-600 mr-2" /> Export to
              PDF/CSV
            </li>
          </ul>
          <Button fullWidth variant="outline">
            Manage Subscription
          </Button>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Enterprise</h3>
          <div className="flex items-baseline mb-4">
            <span className="text-3xl font-black text-gray-900">$199</span>
            <span className="text-gray-500 ml-1">/month</span>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-sm text-gray-600">
              <Check size={16} className="text-gray-400 mr-2" /> Unlimited
              resumes
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <Check size={16} className="text-gray-400 mr-2" /> Custom ATS
              rules
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <Check size={16} className="text-gray-400 mr-2" /> API Access
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <Check size={16} className="text-gray-400 mr-2" /> Team
              Collaboration
            </li>
          </ul>
          <Button fullWidth>Upgrade to Enterprise</Button>
        </Card>
      </div>
    </div>);

};