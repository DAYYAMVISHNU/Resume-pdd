import React from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { UserPlus, MoreVertical } from 'lucide-react';
export const TeamCollaboration = () => {
  const team = [
  {
    name: 'Alex Morgan',
    role: 'Admin',
    email: 'alex@techcorp.com',
    initial: 'AM',
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    name: 'Jordan Lee',
    role: 'Recruiter',
    email: 'jordan@techcorp.com',
    initial: 'JL',
    color: 'bg-green-100 text-green-600'
  },
  {
    name: 'Taylor Swift',
    role: 'Hiring Manager',
    email: 'taylor@techcorp.com',
    initial: 'TS',
    color: 'bg-blue-100 text-blue-600'
  }];

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Team" />

      <div className="p-4 space-y-6">
        <Button fullWidth icon={<UserPlus size={18} />}>
          Invite Team Member
        </Button>

        <div>
          <h3 className="font-bold text-gray-900 mb-3 px-1">
            Members ({team.length})
          </h3>
          <div className="space-y-3">
            {team.map((member, i) =>
            <Card key={i} padding="sm" className="flex items-center p-3">
                <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 shrink-0 ${member.color}`}>
                
                  {member.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">
                    {member.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {member.email}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 mr-2 bg-gray-100 px-2 py-1 rounded">
                    {member.role}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>);

};