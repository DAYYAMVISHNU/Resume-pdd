import React from 'react';
import { useLocation } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';
export const ContactInfoParsed = () => {
  const location = useLocation();
  const candidate = location.state?.candidate || {
    name: 'Sarah Smith',
    email: 'sarah.smith@email.com',
    phone: '+1 (555) 123-4567'
  };
  const initials = candidate.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  const contacts = [
  {
    icon: Mail,
    label: 'Email',
    value: candidate.email || 'Not provided',
    color: 'text-blue-500',
    bg: 'bg-blue-50'
  },
  {
    icon: Phone,
    label: 'Phone',
    value: candidate.phone || 'Not provided',
    color: 'text-green-500',
    bg: 'bg-green-50'
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'San Francisco, CA',
    color: 'text-red-500',
    bg: 'bg-red-50'
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'linkedin.com/in/sarahsmith',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50'
  },

  {
    icon: Globe,
    label: 'Portfolio',
    value: 'sarahsmith.dev',
    color: 'text-purple-500',
    bg: 'bg-purple-50'
  }];

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Contact Info" />

      <div className="p-4">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-indigo-100 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-indigo-600 mb-3">
            {initials}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
        </div>

        <div className="space-y-3">
          {contacts.map((contact, i) => {
            const Icon = contact.icon;
            return (
              <Card key={i} padding="sm" className="flex items-center p-3">
                <div
                  className={`w-10 h-10 rounded-full ${contact.bg} flex items-center justify-center mr-4 shrink-0`}>
                  
                  <Icon size={20} className={contact.color} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-0.5">
                    {contact.label}
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {contact.value}
                  </p>
                </div>
              </Card>);

          })}
        </div>
      </div>
    </div>);

};