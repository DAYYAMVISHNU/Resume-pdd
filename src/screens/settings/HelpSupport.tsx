import React, { useState, useEffect } from 'react';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MessageCircle, Mail, ChevronDown, X, Send, ArrowLeft } from 'lucide-react';

import { getApiUrl } from '../../config/ApiConfig';

export const HelpSupport = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationEmail, setActiveConversationEmail] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const currentUserEmail = localStorage.getItem('userEmail');

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does the AI rank resumes?',
      a: "Our AI analyzes semantic overlap between the job description and the candidate's experience, focusing on key skills and context rather than just keyword matching."
    },
    {
      q: 'What file formats are supported?',
      a: 'Currently, we support PDF, DOCX, and TXT files for resume uploads.'
    },
    {
      q: 'Is my data secure?',
      a: 'Yes, all resumes are processed securely. We do not store personal data longer than necessary for the session unless you explicitly save the analysis.'
    },
    {
      q: 'How accurate is the ATS score?',
      a: 'The ATS score closely mirrors standard enterprise Applicant Tracking Systems, giving you a reliable benchmark of how a resume will perform.'
    }
  ];

  const handleChatClick = () => {
    setIsChatOpen(true);
    setActiveConversationEmail(isAdmin ? null : currentUserEmail);
  };

  useEffect(() => {
    if (!isChatOpen) return;

    const fetchChatData = async () => {
      try {
        if (isAdmin && !activeConversationEmail) {
          const res = await fetch(getApiUrl('/chat/conversations'));
          if (res.ok) setConversations(await res.json());
        } else if (activeConversationEmail) {
          const res = await fetch(getApiUrl(`/chat/messages?email=${activeConversationEmail}`));
          if (res.ok) setChatHistory(await res.json());
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchChatData();
    const interval = setInterval(fetchChatData, 3000);
    return () => clearInterval(interval);
  }, [isChatOpen, isAdmin, activeConversationEmail]);

  const sendMessage = async () => {
    if (!chatMessage.trim() || !activeConversationEmail) return;
    
    // Optimistic update
    const newMsg = { sender: isAdmin ? 'admin' : 'user', text: chatMessage, time: 'Just now' };
    setChatHistory(prev => [...prev, newMsg]);
    const messageText = chatMessage;
    setChatMessage('');

    try {
      await fetch(getApiUrl('/chat/send'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: isAdmin ? 'admin' : currentUserEmail,
          target_user: activeConversationEmail,
          text: messageText
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader title="Help & Support" />

      <div className="p-4 space-y-6">
        <div className={`grid ${isAdmin ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
          <div onClick={handleChatClick}>
            <Card
              hoverable
              className="flex flex-col items-center justify-center p-6 text-center cursor-pointer h-full">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                <MessageCircle size={24} className="text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Live Chat</h3>
              <p className="text-xs text-gray-500 mt-1">Usually replies in 5m</p>
            </Card>
          </div>
          {!isAdmin && (
            <div onClick={() => window.location.href = 'mailto:lvishnu181@gmail.com'}>
              <Card
                hoverable
                className="flex flex-col items-center justify-center p-6 text-center cursor-pointer h-full">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                  <Mail size={24} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Email Us</h3>
                <p className="text-xs text-gray-500 mt-1">lvishnu181@gmail.com</p>
              </Card>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-3 px-1">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col cursor-pointer"
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{faq.q}</span>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFaqIndex === i ? 'rotate-180' : ''}`} />
                </div>
                {openFaqIndex === i && (
                  <div className="mt-3 pt-3 border-t border-gray-50 text-sm text-gray-500 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>


      </div>

      {/* Live Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              {isAdmin && activeConversationEmail ? (
                <button onClick={() => setActiveConversationEmail(null)} className="p-2 text-gray-400 hover:text-gray-600">
                  <ArrowLeft size={20} />
                </button>
              ) : (
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <MessageCircle size={20} className="text-indigo-600" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900">
                  {isAdmin ? (activeConversationEmail ? activeConversationEmail : 'Admin Support Inbox') : 'Admin Support'}
                </h3>
                <p className="text-xs text-green-500 font-medium">Online</p>
              </div>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          
          {isAdmin && !activeConversationEmail ? (
            <div className="flex-1 p-4 bg-gray-50 flex flex-col gap-3 overflow-y-auto">
               <p className="text-xs text-gray-500 font-medium px-2 uppercase tracking-wider mb-2">Active Conversations</p>
               {conversations.length === 0 ? (
                 <p className="text-sm text-gray-500 text-center mt-10">No active conversations yet.</p>
               ) : (
                 conversations.map((conv, i) => (
                   <Card key={i} hoverable onClick={() => setActiveConversationEmail(conv.email)} className="p-3 flex items-center gap-3 cursor-pointer">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold uppercase">
                         {conv.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center mb-1">
                            <span className={`text-sm ${conv.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{conv.name}</span>
                            <span className="text-[10px] text-gray-400">{conv.time}</span>
                         </div>
                         <p className={`text-xs truncate ${conv.unread ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{conv.last_message}</p>
                      </div>
                      {conv.unread && <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>}
                   </Card>
                 ))
               )}
            </div>
          ) : (
            <>
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                {chatHistory.length === 0 && !isAdmin && (
                  <p className="text-sm text-gray-500 text-center mt-10">Send a message to start chatting with support.</p>
                )}
                {chatHistory.map((msg, idx) => {
                  const isOwnMessage = isAdmin ? msg.sender === 'admin' : msg.sender === 'user';
                  return (
                    <div 
                      key={idx} 
                      className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        isOwnMessage
                          ? 'bg-indigo-600 text-white self-end rounded-br-none' 
                          : 'bg-white text-gray-800 border border-gray-100 self-start rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage();
                  }}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
                <button 
                  onClick={sendMessage}
                  className="p-2 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};