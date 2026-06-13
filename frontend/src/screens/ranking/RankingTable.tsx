import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export const RankingTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { candidates = [] } = location.state || {};

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SubPageHeader
        title="Full Ranking"
        rightAction={
          <button className="p-2 text-gray-600">
            <Filter size={20} />
          </button>
        } 
      />

      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm"
            placeholder="Search candidates..." 
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <th className="p-3 font-medium">Rank</th>
              <th className="p-3 font-medium">Candidate</th>
              <th className="p-3 font-medium flex items-center cursor-pointer hover:text-gray-700">
                Overall <ArrowUpDown size={12} className="ml-1" />
              </th>
              <th className="p-3 font-medium">Skills</th>
              <th className="p-3 font-medium">Exp.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {candidates.length > 0 ? (
              candidates.map((c: any, i: number) => (
                <tr
                  key={c.id || i}
                  onClick={() => navigate(`/ranking/candidate/${c.id}`, { state: { candidate: c } })}
                  className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="p-3 text-sm text-gray-500 font-medium text-center">
                    #{i + 1}
                  </td>
                  <td className="p-3">
                    <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                      {c.name}
                    </p>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold ${c.score >= 80 ? 'bg-green-100 text-green-700' : c.score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {c.score}%
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{c.skills || c.score}%</td>
                  <td className="p-3 text-sm text-gray-600">{c.exp || c.score}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">
                  No candidates found. Please upload resumes first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};