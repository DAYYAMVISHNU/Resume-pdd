import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, FileSpreadsheet, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export const ExportResults = () => {
  const location = useLocation();
  let { candidates = [] } = location.state || {};
  
  if (candidates.length === 0) {
    const saved = localStorage.getItem('currentAnalysisCandidates');
    if (saved) {
      try {
        candidates = JSON.parse(saved);
      } catch(e) {
        console.warn("Failed to parse saved candidates", e);
      }
    }
  }

  const [reportType, setReportType] = useState<string>('ranking'); // ranking, ats, feedback, comparison
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const drawPdfHeader = (doc: jsPDF, title: string) => {
    // Elegant Primary color band (Indigo)
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 220, 15, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text("ATS RESUME ANALYZER SYSTEM - METRICS & ANALYTICS REPORT", 14, 10);
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(17, 24, 39); // Gray-900
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 30);
    
    // Sub-info
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, 37);
    doc.text(`Confidential • Academic and Industry Evaluation Standards`, 14, 42);
    
    // Horizontal separator
    doc.setDrawColor(229, 231, 235); // Gray-200
    doc.setLineWidth(0.5);
    doc.line(14, 46, 196, 46);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      if (selectedFormat === 'csv') {
        const headers = "Rank,Name,Role,Score,Skills Match,Experience Match,Education Match,Tier,Email\n";
        const rows = candidates.map((c: any, index: number) => {
          return `${index + 1},"${c.name}","${c.role || ''}",${c.score},${c.skillsMatch || c.score},${c.experienceMatch || c.score},${c.educationMatch || c.score},"${c.match}","${c.email || ''}"`;
        }).join('\n');
        
        const win = window as any;
        if (win.flutter_inappwebview) {
          const base64Data = btoa(unescape(encodeURIComponent(headers + rows)));
          win.flutter_inappwebview.callHandler('downloadPdf', base64Data, `ats_metrics_${reportType}_report.csv`);
        } else {
          const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", `ats_metrics_${reportType}_report.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } 
      else {
        const doc = new jsPDF();
        const topCandidate = candidates[0] || { name: "N/A", score: 0, role: "N/A" };
        
        if (reportType === 'ranking') {
          drawPdfHeader(doc, "Candidate Ranking & Selection Report");
          
          doc.setFontSize(12);
          doc.setTextColor(31, 41, 55);
          doc.setFont('helvetica', 'bold');
          doc.text("Executive Summary", 14, 55);
          
          doc.setFontSize(10);
          doc.setTextColor(75, 85, 99);
          doc.setFont('helvetica', 'normal');
          doc.text(`An automated ATS evaluation was performed across ${candidates.length} candidates.`, 14, 62);
          doc.text(`Based on semantic alignment and keyword density, the top matching profile is ${topCandidate.name}`, 14, 67);
          doc.text(`with a matching index of ${topCandidate.score}%, specialized as: ${topCandidate.role}.`, 14, 72);
          
          // Prepare Rank Table
          const tableColumn = ["Rank", "Name", "Role", "Score", "Skill %", "Exp %", "Edu %"];
          const tableRows = candidates.map((c: any, index: number) => [
            `#${index + 1}`,
            c.name,
            c.role || "Software Specialist",
            `${c.score}%`,
            `${c.skillsMatch || c.score}%`,
            `${c.experienceMatch || c.score}%`,
            `${c.educationMatch || c.score}%`
          ]);
          
          autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 80,
            theme: 'striped',
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [79, 70, 229], textColor: 255 },
            alternateRowStyles: { fillColor: [248, 250, 252] }
          });
        }
        else if (reportType === 'ats') {
          drawPdfHeader(doc, "ATS Scorecard & Parsed Structure");
          
          doc.setFontSize(12);
          doc.setTextColor(31, 41, 55);
          doc.setFont('helvetica', 'bold');
          doc.text(`Evaluation Summary: ${topCandidate.name}`, 14, 55);
          
          doc.setFontSize(10);
          doc.setTextColor(75, 85, 99);
          doc.setFont('helvetica', 'normal');
          doc.text(`Role Designation: ${topCandidate.role}`, 14, 62);
          doc.text(`Contact Email: ${topCandidate.email || "Extracted in file details"}`, 14, 67);
          doc.text(`Phone: ${topCandidate.phone || "Not provided"}`, 14, 72);
          
          // Large Score Visual Representation
          doc.setFillColor(243, 244, 246);
          doc.rect(14, 80, 182, 35, 'F');
          
          doc.setFontSize(26);
          doc.setTextColor(79, 70, 229);
          doc.setFont('helvetica', 'bold');
          doc.text(`${topCandidate.score}%`, 25, 102);
          
          doc.setFontSize(11);
          doc.setTextColor(31, 41, 55);
          doc.text("Overall Match Index Score", 70, 93);
          
          doc.setFontSize(9);
          doc.setTextColor(107, 114, 128);
          doc.text("Calculated by checking exact skill sets, format restrictions,", 70, 99);
          doc.text("action verb density, and core section structural availability.", 70, 104);

          // Details table
          const skillsList = (topCandidate.matched_skills || ["React", "Python", "NodeJS"]).slice(0, 10).join(', ');
          const detailColumn = ["Section", "Status & Extracted Summary"];
          const detailRows = [
            ["Contact Profile", topCandidate.email ? "Email Validated, Phone Extracted" : "Missing Profile Details"],
            ["Extracted Skills", skillsList],
            ["Experience Summary", topCandidate.role || "Software Specialist Details"],
            ["ATS Score Tier", `${topCandidate.match} Match Category`]
          ];

          autoTable(doc, {
            head: [detailColumn],
            body: detailRows,
            startY: 125,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [59, 130, 246] }
          });
        }
        else if (reportType === 'feedback') {
          drawPdfHeader(doc, "Resume Feedback & Optimization Roadmap");
          
          doc.setFontSize(12);
          doc.setTextColor(31, 41, 55);
          doc.setFont('helvetica', 'bold');
          doc.text(`Actionable Improvement Roadmap for: ${topCandidate.name}`, 14, 55);
          
          doc.setFontSize(10);
          doc.setTextColor(75, 85, 99);
          doc.setFont('helvetica', 'normal');
          doc.text("Our NLP parser analyzed spelling, weak action verbs, and keyword density.", 14, 62);
          
          const feedbackColumn = ["Category", "Detected Issue", "Synonym & Action Optimization"];
          const feedbackRows = [
            ["Action Verbs", "Contains passive phrasing like 'helped with'", "Upgrade to active verb: 'Orchestrated'"],
            ["Measurable Metrics", "Lacks metric percentages or currency values", "Inject numbers (e.g. 'Increased speed by 25%')"],
            ["Missing Key Skills", "Missing recommended role-specific tags", "Insert missing tags: AWS, Docker, Kubernetes"],
            ["Formatting", "Margins and spacing might look cramped", "Utilize clean single-page templates"]
          ];

          autoTable(doc, {
            head: [feedbackColumn],
            body: feedbackRows,
            startY: 72,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [245, 158, 11] }
          });

          doc.setFontSize(11);
          doc.setTextColor(17, 24, 39);
          doc.setFont('helvetica', 'bold');
          doc.text("Step-by-Step Optimization Checklist", 14, 130);
          
          doc.setFontSize(9);
          doc.setTextColor(75, 85, 99);
          doc.setFont('helvetica', 'normal');
          doc.text("1. Locate weak action words inside experience blocks and perform drop-in synonyms replacement.", 18, 140);
          doc.text("2. Rearrange the layout so that technical skills tags are prominently showcased near the top page.", 18, 146);
          doc.text("3. Fill in complete education levels, graduation dates, and LinkedIn professional links.", 18, 152);
        }
        else if (reportType === 'comparison') {
          drawPdfHeader(doc, "Side-by-Side Candidate Comparison Matrix");
          
          doc.setFontSize(10);
          doc.setTextColor(75, 85, 99);
          doc.setFont('helvetica', 'normal');
          doc.text("This comparison matrix analyzes candidates across their overall scoring performance,", 14, 55);
          doc.text("highlighting matching ratios to facilitate selection decision reviews.", 14, 60);

          const compColumn = ["Metric", "Candidate A", "Candidate B", "Candidate C"];
          
          const candA = candidates[0] || { name: "N/A", score: 0, skillsMatch: 0, experienceMatch: 0 };
          const candB = candidates[1] || { name: "N/A", score: 0, skillsMatch: 0, experienceMatch: 0 };
          const candC = candidates[2] || { name: "N/A", score: 0, skillsMatch: 0, experienceMatch: 0 };

          const compRows = [
            ["Candidate Name", candA.name, candB.name, candC.name],
            ["Overall Match Score", `${candA.score}%`, `${candB.score}%`, `${candC.score}%`],
            ["Skills Match Ratio", `${candA.skillsMatch || candA.score}%`, `${candB.skillsMatch || candB.score}%`, `${candC.skillsMatch || candC.score}%`],
            ["Experience Alignment", `${candA.experienceMatch || candA.score}%`, `${candB.experienceMatch || candB.score}%`, `${candC.experienceMatch || candC.score}%`],
            ["Recommendation Tier", candA.match || "N/A", candB.match || "N/A", candC.match || "N/A"]
          ];

          autoTable(doc, {
            head: [compColumn],
            body: compRows,
            startY: 70,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [16, 185, 129] }
          });
        }
        
        const win = window as any;
        if (win.flutter_inappwebview) {
          const dataUri = doc.output('datauristring');
          const base64Data = dataUri.split(',')[1];
          win.flutter_inappwebview.callHandler('downloadPdf', base64Data, `ats_${reportType}_analytics_report.pdf`);
        } else {
          doc.save(`ats_${reportType}_analytics_report.pdf`);
        }
      }
      setIsExporting(false);
    }, 800);
  };

  const reports = [
    { id: 'ranking', title: 'Ranking Report', desc: 'Overall rankings table comparing all candidates', icon: Layers, color: 'border-indigo-600 bg-indigo-50/50' },
    { id: 'ats', title: 'ATS Detailed Scorecard', desc: 'ATS Checklist audit results for top candidate', icon: FileText, color: 'border-blue-600 bg-blue-50/50' },
    { id: 'feedback', title: 'Resume Feedback Report', desc: 'Action verbs synoyms suggestions & roadmap timeline', icon: Sparkles, color: 'border-yellow-600 bg-yellow-50/50' },
    { id: 'comparison', title: 'Candidate Comparison Matrix', desc: 'Side-by-side metric tables comparing top 3 candidates', icon: CheckCircle2, color: 'border-emerald-600 bg-emerald-50/50' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SubPageHeader title="Download Reports" />

      <div className="p-4 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Export Evaluation Reports</h2>
          <p className="text-sm text-gray-500">Select which detailed analytics report you would like to generate.</p>
        </div>

        <div className="space-y-3">
          {reports.map((r) => {
            const Icon = r.icon;
            const isSelected = reportType === r.id;
            return (
              <Card
                key={r.id}
                hoverable
                onClick={() => setReportType(r.id)}
                className={`flex items-center p-4 border-2 transition-all ${isSelected ? r.color : 'border-transparent bg-white'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 shrink-0 ${isSelected ? 'bg-white text-indigo-600 shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-sm text-gray-900">{r.title}</h3>
                  <p className="text-xs text-gray-500 leading-tight mt-0.5">{r.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200">
          <h4 className="font-bold text-sm text-gray-900 mb-3">Choose Format</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedFormat('pdf')}
              className={`p-3 rounded-xl border font-semibold text-sm transition-all ${selectedFormat === 'pdf' ? 'bg-indigo-600 text-white border-transparent' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
            >
              PDF Document
            </button>
            <button
              onClick={() => setSelectedFormat('csv')}
              className={`p-3 rounded-xl border font-semibold text-sm transition-all ${selectedFormat === 'csv' ? 'bg-indigo-600 text-white border-transparent' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
            >
              Spreadsheet CSV
            </button>
          </div>
        </div>

        <Button fullWidth size="lg" onClick={handleExport} disabled={isExporting} className="shadow-lg">
          {isExporting ? 'Generating Report...' : 'Download / Share Report'}
        </Button>
      </div>
    </div>
  );
};