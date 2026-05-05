import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, FileSpreadsheet, Mail, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

export const ExportResults = () => {
  const location = useLocation();
  let { candidates = [] } = location.state || {};
  
  // Fallback to localStorage if state is lost (e.g. page refresh)
  if (candidates.length === 0) {
    const saved = localStorage.getItem('currentAnalysisCandidates');
    if (saved) {
      try {
        candidates = JSON.parse(saved);
      } catch(e) {}
    }
  }

  const [selected, setSelected] = useState<string>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      if (selected === 'csv') {
        const headers = "Rank,Name,Role,Score,Match Tier,Email,Phone,Matched Skills\n";
        const rows = candidates.map((c: any, index: number) => {
          const skills = (c.matched_skills || []).join('; ');
          return `${index + 1},"${c.name}","${c.role || ''}",${c.score},"${c.match}","${c.email || ''}","${c.phone || ''}","${skills}"`;
        }).join('\n');
        
        const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `resume_analysis_results_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } 
      else if (selected === 'pdf') {
        const doc = new jsPDF();
        
        // Document Header
        doc.setFontSize(22);
        doc.setTextColor(31, 41, 55); // gray-800
        doc.text("Resume Analysis Report", 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(107, 114, 128); // gray-500
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Total Candidates Analyzed: ${candidates.length}`, 14, 36);
        
        // Prepare Table Data
        const tableColumn = ["Rank", "Candidate Name", "Match Tier", "Score", "Top Skills Matched"];
        const tableRows: any[] = [];

        candidates.forEach((c: any, i: number) => {
          const skills = (c.matched_skills || []).slice(0, 4).join(', ');
          const rowData = [
            `#${i + 1}`,
            c.name,
            c.match,
            `${c.score}%`,
            skills || 'None'
          ];
          tableRows.push(rowData);
        });

        // Generate Table
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 45,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 4 },
          headStyles: { fillColor: [79, 70, 229], textColor: 255 }, // indigo-600
          alternateRowStyles: { fillColor: [249, 250, 251] } // gray-50
        });

        doc.save(`resume_analysis_report_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      else if (selected === 'email') {
        const topCandidate = candidates[0];
        const subject = encodeURIComponent("New Resume Analysis Results");
        const body = encodeURIComponent(
          `Hi Team,\n\nI just ran a resume analysis. We have ${candidates.length} candidates.\n\n` +
          `Our top match is ${topCandidate.name} with a score of ${topCandidate.score}%.\n\n` +
          `Please check the dashboard for full details.\n\nBest,`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
      else if (selected === 'link') {
        const mockUrl = `${window.location.origin}/ranking/shared/${Date.now().toString(36)}`;
        navigator.clipboard.writeText(mockUrl).then(() => {
          alert(`Secure link copied to clipboard!\n\n${mockUrl}`);
        }).catch(err => {
          alert("Failed to copy link.");
        });
      }

      setIsExporting(false);
    }, 600); // Small artificial delay for UX
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SubPageHeader title="Export Results" />

      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-500 mb-2">
          Choose how you want to share or save the analysis results.
        </p>

        <Card
          hoverable
          onClick={() => setSelected('pdf')}
          className={`flex items-center p-4 border-2 transition-colors ${selected === 'pdf' ? 'border-indigo-600 bg-indigo-50' : 'border-transparent'}`}>
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mr-4 relative">
            <FileText size={24} className="text-red-600" />
            {selected === 'pdf' && <CheckCircle2 size={16} className="absolute -top-1 -right-1 text-indigo-600 bg-white rounded-full" />}
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
          onClick={() => setSelected('csv')}
          className={`flex items-center p-4 border-2 transition-colors ${selected === 'csv' ? 'border-indigo-600 bg-indigo-50' : 'border-transparent'}`}>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4 relative">
            <FileSpreadsheet size={24} className="text-green-600" />
            {selected === 'csv' && <CheckCircle2 size={16} className="absolute -top-1 -right-1 text-indigo-600 bg-white rounded-full" />}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">CSV Export</h3>
            <p className="text-xs text-gray-500">Raw data for spreadsheets</p>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => setSelected('email')}
          className={`flex items-center p-4 border-2 transition-colors ${selected === 'email' ? 'border-indigo-600 bg-indigo-50' : 'border-transparent'}`}>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4 relative">
            <Mail size={24} className="text-blue-600" />
            {selected === 'email' && <CheckCircle2 size={16} className="absolute -top-1 -right-1 text-indigo-600 bg-white rounded-full" />}
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
          onClick={() => setSelected('link')}
          className={`flex items-center p-4 border-2 transition-colors ${selected === 'link' ? 'border-indigo-600 bg-indigo-50' : 'border-transparent'}`}>
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4 relative">
            <LinkIcon size={24} className="text-gray-600" />
            {selected === 'link' && <CheckCircle2 size={16} className="absolute -top-1 -right-1 text-indigo-600 bg-white rounded-full" />}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Share Link</h3>
            <p className="text-xs text-gray-500">
              Generate a secure view-only link
            </p>
          </div>
        </Card>

        <div className="pt-6">
          <Button fullWidth size="lg" onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Generating...' : 'Generate Export'}
          </Button>
        </div>
      </div>
    </div>
  );
};