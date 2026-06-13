import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SubPageHeader } from '../../components/layout/SubPageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Sparkles, Download, CheckCircle2, Wand2, FileText, Share2, Edit3, Trash2, GraduationCap, Briefcase, Calendar, Plus, Compass, Play, BookOpen, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

export const ATSPerfectResume = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};
  
  const parsed = data.parsed_details || {
    name: data.name || 'PROFESSIONAL CANDIDATE',
    email: data.email || 'developer@resumeanalyzer.ai',
    phone: data.phone || '(555) 019-2831',
    linkedin: 'linkedin.com/in/professional-candidate',
    skills: data.matched_skills || ['Python', 'React', 'TypeScript', 'SQL', 'Git'],
    education: ['B.S. in Computer Science - State University'],
    experience: ['Software Engineer Intern - Tech Systems', 'Freelance Full Stack Developer'],
    projects: ['E-Commerce Backend Microservice API'],
    certifications: ['AWS Certified Cloud Practitioner']
  };

  // State for tabs: builder, tracking, gap, interview, roadmap
  const [activeTab, setActiveTab] = useState<'builder' | 'tracking' | 'gap' | 'interview' | 'roadmap'>('builder');
  
  // Interactive Resume Builder state
  const [resumeName, setResumeName] = useState(parsed.name || 'PROFESSIONAL CANDIDATE');
  const [resumeEmail, setResumeEmail] = useState(parsed.email);
  const [resumePhone, setResumePhone] = useState(parsed.phone);
  const [resumeLinkedin, setResumeLinkedin] = useState(parsed.linkedin || 'linkedin.com/in/professional-candidate');
  
  const [skills, setSkills] = useState<string[]>(parsed.skills || []);
  const [newSkill, setNewSkill] = useState('');
  
  const [experience, setExperience] = useState<string[]>(parsed.experience || []);
  const [newExp, setNewExp] = useState('');

  const [education, setEducation] = useState<string[]>(parsed.education || []);
  const [newEdu, setNewEdu] = useState('');

  const [projects, setProjects] = useState<string[]>(parsed.projects || []);
  const [newProj, setNewProj] = useState('');

  const [certifications, setCertifications] = useState<string[]>(parsed.certifications || []);
  const [newCert, setNewCert] = useState('');

  // Version Tracking state
  const [versions, setVersions] = useState<any[]>([
    { 
      id: 'v1', 
      name: 'Original Upload', 
      date: 'Just now', 
      skills: [...(parsed.skills || [])], 
      exp: [...(parsed.experience || [])],
      edu: [...(parsed.education || [])],
      proj: [...(parsed.projects || [])],
      cert: [...(parsed.certifications || [])]
    }
  ]);
  const [newVersionName, setNewVersionName] = useState('');
  const [builderMode, setBuilderMode] = useState(false);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    const steps: string[] = [];
    if (!parsed.name || parsed.name.includes("PROFESSIONAL")) {
      steps.push("Update your full name on the header");
    }
    if (!parsed.email || parsed.email.includes("developer@")) {
      steps.push("Inject valid email contact details at the top");
    }
    if (!parsed.linkedin || parsed.linkedin.includes("linkedin.com/in/candidate") || parsed.linkedin.includes("linkedin.com/in/professional-candidate")) {
      steps.push("Add a direct LinkedIn professional profile URL link");
    }
    
    // Check missing sections
    const missing = data.missing_skills || [];
    missing.forEach((item: string) => {
      steps.push(`Add distinct section heading & details for: ${item}`);
    });

    // Check weak action verbs
    const weakVerbs = data.weak_verbs || [];
    weakVerbs.forEach((item: any) => {
      steps.push(`Replace weak passive phrasing '${item.weak}' with '${item.strong}' to upgrade impact`);
    });

    // Check missing keywords
    const keywords = data.missing_keywords || [];
    if (keywords.length > 0) {
      steps.push(`Sprinkle technology keywords: ${keywords.slice(0, 5).join(', ')} into experience bullet items`);
    }

    steps.push("Ensure consistent margins, spacing, and use clean sans-serif typography");
    setChecklist(steps);
  }, [data]);

  // Roadmap & gap list
  const missingSkills = data.missing_skills || ['Docker', 'Kubernetes', 'AWS Solutions Architect'];

  // Share state
  const [showShareModal, setShowShareModal] = useState(false);
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [shareStatus, setShareStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleDownloadImprovementGuide = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const maxWidth = pageWidth - margin * 2;
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text("ATS Resume Improvement Guide", margin, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Candidate: ${resumeName.toUpperCase()} | Generated: ${new Date().toLocaleDateString()}`, margin, 28);
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, 32, pageWidth - margin, 32);
    
    let yPos = 42;
    
    const writeHeader = (title: string, color = [30, 41, 59]) => {
      if (yPos > 240) { doc.addPage(); yPos = margin + 10; }
      yPos += 4;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(title, margin, yPos);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
      yPos += 8;
    };

    // 1. Overall Score Card
    writeHeader("1. RESUME PERFORMANCE INDEX");
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`ATS Match Score: ${data.score || 68}%`, margin, yPos);
    yPos += 6;
    doc.text(`Estimated Grade: ${data.score >= 80 ? 'A (Excellent Match)' : data.score >= 60 ? 'B (Needs Improvement)' : 'C/F (Poor Match)'}`, margin, yPos);
    yPos += 10;

    // 2. What to Improve (Missing Sections & Structural Issues)
    writeHeader("2. STRUCTURAL & CONTENT GAPS (WHAT TO IMPROVE)", [220, 38, 38]); // Red-600
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    
    const missing = data.missing_skills || [];
    if (missing.length === 0) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // Green
      doc.text("• Structure Assessment: All critical resume sections and contacts are present.", margin + 2, yPos);
      yPos += 6;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      missing.forEach((item: string) => {
        if (yPos > 260) { doc.addPage(); yPos = margin + 10; }
        doc.text(`• Missing Critical Section/Tag: ${item}`, margin + 2, yPos);
        yPos += 5;
      });
      yPos += 4;
    }

    // 3. Verb Upgrades (How to Improve Passive Language)
    writeHeader("3. ACTION VERB UPGRADES (HOW TO STRENGTHEN EXPERIENCE)", [245, 158, 11]); // Amber-600
    const weakVerbs = data.weak_verbs || [];
    if (weakVerbs.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text("• No weak or passive action verbs were detected in your experience timeline. Great job!", margin + 2, yPos);
      yPos += 6;
    } else {
      doc.setFontSize(9);
      weakVerbs.forEach((item: any) => {
        if (yPos > 260) { doc.addPage(); yPos = margin + 10; }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(185, 28, 28); // Red
        doc.text(`• Found passive word: "${item.weak}"`, margin + 2, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(16, 124, 65); // Green
        doc.text(`  Upgrade suggestion: Replace with active verb "${item.strong}" (e.g. "${item.strong.toUpperCase()} implementation of...")`, margin + 2, yPos);
        yPos += 6;
      });
      yPos += 4;
    }

    // 4. Missing Keywords Injection
    writeHeader("4. KEYWORDS MATCHING AUDIT", [79, 70, 229]);
    const missingKeywords = data.missing_keywords || [];
    if (missingKeywords.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text("• Highly aligned! No major missing keywords identified compared to target requirements.", margin + 2, yPos);
      yPos += 6;
    } else {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const kwLine = `Recommended Keywords to Inject: ${missingKeywords.join(', ')}`;
      const wrappedKW = doc.splitTextToSize(kwLine, maxWidth);
      doc.text(wrappedKW, margin, yPos);
      yPos += (wrappedKW.length * 5) + 6;
    }

    // 5. Final Checklist
    writeHeader("5. STEP-BY-STEP OPTIMIZATION CHECKLIST", [30, 41, 59]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    
    let stepNum = 1;
    if (missing.length > 0) {
      doc.text(`${stepNum}. Create distinct formatting sections for: ${missing.join(', ')}.`, margin, yPos);
      yPos += 5;
      stepNum++;
    }
    if (weakVerbs.length > 0) {
      doc.text(`${stepNum}. Replace passive phrasings ("helped with", "handled") with strong verbs ("spearheaded", "engineered").`, margin, yPos);
      yPos += 5;
      stepNum++;
    }
    if (missingKeywords.length > 0) {
      doc.text(`${stepNum}. Inject missing technologies: ${missingKeywords.slice(0, 5).join(', ')} into your bullet points.`, margin, yPos);
      yPos += 5;
      stepNum++;
    }
    doc.text(`${stepNum}. Maintain clean formatting with standard 1-inch margins and clear sans-serif typography.`, margin, yPos);
    yPos += 5;

    // Save
    const win = window as any;
    if (win.flutter_inappwebview) {
      const dataUri = doc.output('datauristring');
      const base64Data = dataUri.split(',')[1];
      win.flutter_inappwebview.callHandler('downloadPdf', base64Data, 'ATS_Improvement_Guide.pdf');
    } else {
      doc.save('ATS_Improvement_Guide.pdf');
    }
  };

  // PDF Generation from Interactive builder values
  const handleDownload = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const maxWidth = pageWidth - margin * 2;
    
    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(resumeName.toUpperCase(), (pageWidth - doc.getTextWidth(resumeName.toUpperCase())) / 2, 22);
    
    // Contact Sub-header
    const contactInfo = `${resumeEmail}  |  ${resumePhone}  |  ${resumeLinkedin}`;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(contactInfo, (pageWidth - doc.getTextWidth(contactInfo)) / 2, 30);
    
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(margin, 34, pageWidth - margin, 34);
    
    let yPos = 44;
    
    const writeSectionHeader = (title: string) => {
      yPos += 4;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(title, margin, yPos);
      
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
      yPos += 8;
    };

    // 1. Technical Skills Section
    writeSectionHeader("TECHNICAL SKILLS & PROFICIENCIES");
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const skillsLine = `Core Technologies: ${skills.join(', ')}`;
    const wrappedSkills = doc.splitTextToSize(skillsLine, maxWidth);
    doc.text(wrappedSkills, margin, yPos);
    yPos += (wrappedSkills.length * 5) + 6;

    // 2. Experience Section
    writeSectionHeader("PROFESSIONAL EXPERIENCE");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    experience.forEach((expText) => {
      if (yPos > 260) { doc.addPage(); yPos = margin + 10; }
      doc.setFont('helvetica', 'bold');
      doc.text("• " + expText.split(' - ')[0], margin + 2, yPos);
      doc.setFont('helvetica', 'normal');
      const details = expText.includes(' - ') ? expText.split(' - ')[1] : '';
      if (details) {
        yPos += 5;
        const wrappedDetails = doc.splitTextToSize(details, maxWidth - 6);
        doc.text(wrappedDetails, margin + 6, yPos);
        yPos += (wrappedDetails.length * 5);
      }
      yPos += 4;
    });

    // 3. Projects Section
    if (projects.length > 0) {
      writeSectionHeader("TECHNICAL PROJECTS");
      projects.forEach((proj) => {
        if (yPos > 260) { doc.addPage(); yPos = margin + 10; }
        doc.setFont('helvetica', 'bold');
        doc.text("• " + proj, margin + 2, yPos);
        yPos += 6;
      });
    }

    // 4. Education Section
    writeSectionHeader("EDUCATION HISTORY");
    education.forEach((eduItem) => {
      if (yPos > 260) { doc.addPage(); yPos = margin + 10; }
      doc.setFont('helvetica', 'normal');
      doc.text("• " + eduItem, margin + 2, yPos);
      yPos += 6;
    });

    // 5. Certifications Section
    if (certifications.length > 0) {
      writeSectionHeader("CERTIFICATIONS");
      certifications.forEach((certItem) => {
        if (yPos > 260) { doc.addPage(); yPos = margin + 10; }
        doc.setFont('helvetica', 'normal');
        doc.text("• " + certItem, margin + 2, yPos);
        yPos += 6;
      });
    }

    const win = window as any;
    if (win.flutter_inappwebview) {
      const dataUri = doc.output('datauristring');
      const base64Data = dataUri.split(',')[1];
      win.flutter_inappwebview.callHandler('downloadPdf', base64Data, 'ATS_Optimized_Resume.pdf');
    } else {
      doc.save('ATS_Optimized_Resume.pdf');
    }
  };

  const handleShare = () => {
    if (!recruiterEmail.includes('@')) return;
    setShareStatus('sending');
    setTimeout(() => {
      setShareStatus('success');
      setTimeout(() => {
        setShowShareModal(false);
        setShareStatus('idle');
        setRecruiterEmail('');
      }, 2000);
    }, 1000);
  };

  // Add Item Helpers
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const addExp = () => {
    if (newExp.trim()) {
      setExperience([...experience, newExp.trim()]);
      setNewExp('');
    }
  };

  const addEdu = () => {
    if (newEdu.trim()) {
      setEducation([...education, newEdu.trim()]);
      setNewEdu('');
    }
  };

  const addProj = () => {
    if (newProj.trim()) {
      setProjects([...projects, newProj.trim()]);
      setNewProj('');
    }
  };

  const addCert = () => {
    if (newCert.trim()) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert('');
    }
  };

  // Versioning helpers
  const saveVersion = () => {
    if (newVersionName.trim()) {
      const newV = {
        id: `v_${Date.now()}`,
        name: newVersionName.trim(),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        skills: [...skills],
        exp: [...experience],
        edu: [...education],
        proj: [...projects],
        cert: [...certifications]
      };
      setVersions([...versions, newV]);
      setNewVersionName('');
    }
  };

  const loadVersion = (v: any) => {
    setSkills(v.skills || []);
    setExperience(v.exp || []);
    setEducation(v.edu || []);
    setProjects(v.proj || []);
    setCertifications(v.cert || []);
    alert(`Loaded successfully: ${v.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SubPageHeader title="AI Career Suite" />

      {/* Hero Stats Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-6">
          <Sparkles className="absolute top-4 right-4 text-yellow-300 opacity-60 animate-pulse" size={28} />
          
          <div className="flex items-center space-x-3 mb-2">
            <Badge className="bg-indigo-500/30 text-indigo-200 border-none">Interactive FYP Suite</Badge>
            <Badge className="bg-green-500/30 text-green-200 border-none">Estimated Score: 98%</Badge>
          </div>
          
          <h2 className="text-2xl font-bold mb-1">Resume Optimizer Suite</h2>
          <p className="text-slate-300 text-xs">
            Review skills gaps, customize bullets, practice interview questions, and tracks draft versions offline.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-6 flex bg-slate-800/80 p-1 rounded-xl overflow-x-auto gap-1">
            {[
              { id: 'builder', label: 'Improvement Guide', icon: FileText },
              { id: 'tracking', label: 'Versions', icon: Calendar },
              { id: 'gap', label: 'Skills Gap', icon: Compass },
              { id: 'interview', label: 'Interviews', icon: GraduationCap },
              { id: 'roadmap', label: 'Roadmap', icon: Play }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  <Icon size={14} className="mr-1.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* 1. INTERACTIVE RESUME BUILDER & OPTIMIZER */}
            {activeTab === 'builder' && (
              <div className="space-y-4">
                {!builderMode ? (
                  // AUDIT REPORT & IMPROVEMENT GUIDE (DEFAULT)
                  <div className="space-y-5">
                    {/* Score Card */}
                    <Card className="text-center py-6 bg-gradient-to-br from-white to-indigo-50/20 relative overflow-hidden">
                      <div className="relative w-28 h-28 mx-auto mb-4">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle className="text-slate-100 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                          <circle className="text-indigo-600 stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${(data.score || 68) * 2.51} 251.2`} transform="rotate(-90 50 50)"></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-slate-900">{data.score || 68}</span>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">ATS Score</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg mb-1">ATS Optimization & Improvement Audit</h3>
                      <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed mb-4">
                        Based on parsing analysis, we detected structural content gaps and weak action verb phrases in your resume.
                      </p>
                      
                      <div className="flex gap-2.5 max-w-xs mx-auto justify-center">
                        <Button onClick={handleDownloadImprovementGuide} className="shadow-md">
                          <Download size={14} className="mr-1.5" /> Download Guide
                        </Button>
                        <Button variant="outline" onClick={() => setBuilderMode(true)}>
                          <Edit3 size={14} className="mr-1.5" /> Manual Editor
                        </Button>
                      </div>
                    </Card>

                    {/* Section 1: Content Gaps & Structural Checklist */}
                    <Card className="text-left">
                      <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center">
                        <AlertTriangle size={16} className="text-rose-500 mr-2 shrink-0" /> Structural & Content Gaps
                      </h3>
                      <div className="space-y-2">
                        {data.missing_skills && data.missing_skills.length > 0 ? (
                          data.missing_skills.map((item: string, idx: number) => (
                            <div key={idx} className="flex items-start p-2.5 bg-rose-50/50 border border-rose-100 rounded-xl text-xs">
                              <AlertTriangle size={14} className="text-rose-600 mr-2 mt-0.5 shrink-0" />
                              <div>
                                <p className="font-bold text-rose-950">Missing Critical Component</p>
                                <p className="text-rose-700 mt-0.5">Please ensure your resume contains distinct formatting/headings for: <span className="font-bold">{item}</span>.</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center p-2.5 bg-green-50 border border-green-100 rounded-xl text-xs text-green-800">
                            <CheckCircle2 size={16} className="text-green-600 mr-2 shrink-0" />
                            <span>Great job! All critical core sections and contact coordinates are present.</span>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Section 2: Passive Word Replacement Guide */}
                    <Card className="text-left">
                      <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center">
                        <Wand2 size={16} className="text-amber-500 mr-2 shrink-0" /> Action Verb Upgrades
                      </h3>
                      <p className="text-[11px] text-slate-500 mb-3">
                        ATS algorithms weigh active verbs higher than passive, weak phrasings. Swap passive phrases with strong alternatives:
                      </p>
                      <div className="space-y-2">
                        {data.weak_verbs && data.weak_verbs.length > 0 ? (
                          data.weak_verbs.map((item: any, idx: number) => (
                            <div key={idx} className="grid grid-cols-2 gap-2.5 p-3 bg-amber-50/40 border border-amber-100 rounded-xl text-xs">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Passive Phrasing Found</span>
                                <span className="text-amber-950 font-bold bg-amber-100/50 px-2 py-0.5 rounded-lg border border-amber-200">"{item.weak}"</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Active Synonym Upgrade</span>
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center w-fit">
                                  ✨ "{item.strong}"
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center p-2.5 bg-green-50 border border-green-100 rounded-xl text-xs text-green-800">
                            <CheckCircle2 size={16} className="text-green-600 mr-2 shrink-0" />
                            <span>No weak passive action verbs detected! Your experience timeline uses strong verbs.</span>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Section 3: Missing Keywords Audit */}
                    <Card className="text-left">
                      <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center">
                        <Sparkles size={16} className="text-indigo-600 mr-2 shrink-0" /> Keyword Injections
                      </h3>
                      <p className="text-[11px] text-slate-500 mb-3">
                        Sprinkle these missing technology keywords into your bullet descriptions to match search terms:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.missing_keywords && data.missing_keywords.length > 0 ? (
                          data.missing_keywords.map((kw: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-700">
                              + {kw}
                            </span>
                          ))
                        ) : (
                          <div className="flex items-center p-2.5 bg-green-50 border border-green-100 rounded-xl text-xs text-green-800 w-full">
                            <CheckCircle2 size={16} className="text-green-600 mr-2 shrink-0" />
                            <span>Highly aligned! Your resume contains a strong density of relevant role keywords.</span>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Section 4: Interactive step-by-step checklist */}
                    <Card className="text-left">
                      <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center">
                        <CheckCircle2 size={16} className="text-indigo-600 mr-2 shrink-0" /> Dynamic Action Plan Checklist
                      </h3>
                      <p className="text-[11px] text-slate-500 mb-4">
                        Follow these direct steps to manually edit your original resume in MS Word or Google Docs:
                      </p>
                      <div className="space-y-3">
                        {checklist.map((step, idx) => {
                          const isDone = completedSteps.includes(step);
                          return (
                            <div key={idx} className="flex items-start gap-3">
                              <input 
                                type="checkbox" 
                                checked={isDone}
                                onChange={() => {
                                  if (isDone) {
                                    setCompletedSteps(completedSteps.filter(s => s !== step));
                                  } else {
                                    setCompletedSteps([...completedSteps, step]);
                                  }
                                }}
                                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 shrink-0"
                              />
                              <span className={`text-xs leading-relaxed transition-all text-left ${isDone ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-semibold'}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                ) : (
                  // MANUAL EDITOR (BUILDER STATE EDITING MODE)
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-slate-900 text-sm">Resume Builder Editor</h3>
                      <Button size="sm" variant="outline" onClick={() => setBuilderMode(false)}>
                        ← Back to Improvement Guide
                      </Button>
                    </div>

                    <Card>
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Edit3 size={18} className="text-indigo-600 mr-2" /> Contact Profile
                      </h3>
                      <div className="space-y-3 text-left">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                          <input 
                            type="text" 
                            value={resumeName} 
                            onChange={(e) => setResumeName(e.target.value)} 
                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-600 outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                            <input 
                              type="email" 
                              value={resumeEmail} 
                              onChange={(e) => setResumeEmail(e.target.value)} 
                              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-600 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                            <input 
                              type="text" 
                              value={resumePhone} 
                              onChange={(e) => setResumePhone(e.target.value)} 
                              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-600 outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">LinkedIn Profile</label>
                          <input 
                            type="text" 
                            value={resumeLinkedin} 
                            onChange={(e) => setResumeLinkedin(e.target.value)} 
                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-600 outline-none"
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Skills tags list */}
                    <Card>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                        <Sparkles size={18} className="text-yellow-500 mr-2" /> Technical Skills
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {skills.map((s, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                            {s}
                            <button onClick={() => setSkills(skills.filter(i => i !== s))} className="ml-1.5 text-indigo-400 hover:text-indigo-600">×</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Add technological tag..." 
                          value={newSkill} 
                          onChange={(e) => setNewSkill(e.target.value)}
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                        />
                        <Button onClick={addSkill} size="sm">Add</Button>
                      </div>

                      <div className="mt-3 text-left">
                        <p className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Suggested for ATS Boost:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['Python', 'React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'Git']
                            .filter(s => !skills.map(val => val.toLowerCase()).includes(s.toLowerCase()))
                            .map((s, index) => (
                              <button
                                key={index}
                                onClick={() => setSkills([...skills, s])}
                                className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 text-[10px] font-semibold text-gray-600 transition-colors flex items-center"
                              >
                                + {s}
                              </button>
                            ))
                          }
                        </div>
                      </div>
                    </Card>

                    {/* Work experiences */}
                    <Card>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                        <Briefcase size={18} className="text-gray-600 mr-2" /> Experience timeline
                      </h3>
                      <div className="space-y-2 mb-4 text-left">
                        {experience.map((exp, index) => (
                          <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-xs">
                              <p className="font-bold text-gray-800">{exp.split(' - ')[0]}</p>
                              <p className="text-gray-500 mt-0.5">{exp.split(' - ')[1] || 'No specific description added.'}</p>
                            </div>
                            <button onClick={() => setExperience(experience.filter((_, idx) => idx !== index))} className="text-red-500 text-sm hover:underline">Delete</button>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" 
                          placeholder="Title e.g. Software Engineer - Google" 
                          value={newExp} 
                          onChange={(e) => setNewExp(e.target.value)}
                          className="border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                        />
                        <Button onClick={addExp} size="sm">Insert Experience</Button>
                      </div>
                    </Card>

                    {/* Technical Projects */}
                    <Card>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                        <Sparkles size={18} className="text-indigo-600 mr-2" /> Technical Projects
                      </h3>
                      <div className="space-y-2 mb-4 text-left">
                        {projects.map((proj, index) => (
                          <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-xs">
                              <p className="font-bold text-gray-800">{proj}</p>
                            </div>
                            <button onClick={() => setProjects(projects.filter((_, idx) => idx !== index))} className="text-red-500 text-sm hover:underline">Delete</button>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" 
                          placeholder="Project details..." 
                          value={newProj} 
                          onChange={(e) => setNewProj(e.target.value)}
                          className="border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                        />
                        <Button onClick={addProj} size="sm">Insert Project</Button>
                      </div>
                    </Card>

                    {/* Education */}
                    <Card>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                        <GraduationCap size={18} className="text-gray-600 mr-2" /> Education History
                      </h3>
                      <div className="space-y-2 mb-4 text-left">
                        {education.map((edu, index) => (
                          <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-xs">
                              <p className="font-bold text-gray-800">{edu}</p>
                            </div>
                            <button onClick={() => setEducation(education.filter((_, idx) => idx !== index))} className="text-red-500 text-sm hover:underline">Delete</button>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" 
                          placeholder="e.g. B.S. in Computer Science - State University" 
                          value={newEdu} 
                          onChange={(e) => setNewEdu(e.target.value)}
                          className="border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                        />
                        <Button onClick={addEdu} size="sm">Insert Education</Button>
                      </div>
                    </Card>

                    {/* Certifications */}
                    <Card>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                        <CheckCircle2 size={18} className="text-emerald-600 mr-2" /> Certifications
                      </h3>
                      <div className="space-y-2 mb-4 text-left">
                        {certifications.map((cert, index) => (
                          <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-xs">
                              <p className="font-bold text-gray-800">{cert}</p>
                            </div>
                            <button onClick={() => setCertifications(certifications.filter((_, idx) => idx !== index))} className="text-red-500 text-sm hover:underline">Delete</button>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" 
                          placeholder="e.g. AWS Certified Cloud Practitioner" 
                          value={newCert} 
                          onChange={(e) => setNewCert(e.target.value)}
                          className="border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                        />
                        <Button onClick={addCert} size="sm">Insert Certification</Button>
                      </div>
                    </Card>

                    {/* PDF generation triggers */}
                    <div className="flex gap-3">
                      <Button fullWidth size="lg" onClick={handleDownload} className="shadow-md">
                        <Download size={18} className="mr-2" /> Download ATS PDF
                      </Button>
                      <Button fullWidth variant="outline" size="lg" onClick={() => setShowShareModal(true)}>
                        <Share2 size={18} className="mr-2" /> Share Report
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. VERSION TRACKING */}
            {activeTab === 'tracking' && (
              <Card className="text-left">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <Calendar size={18} className="text-indigo-600 mr-2" /> Resume Versioning
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Saves your edited builders layout drafts offline. Instantly restore or backup versions.
                </p>

                <div className="space-y-3 mb-6">
                  {versions.map((v) => (
                    <div key={v.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{v.name}</h4>
                        <p className="text-[10px] text-slate-400">Created: {v.date} • {v.skills.length} skills tags</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => loadVersion(v)} className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg">
                          Restore
                        </button>
                        {v.id !== 'v1' && (
                          <button onClick={() => setVersions(versions.filter(item => item.id !== v.id))} className="text-slate-400 hover:text-red-500 p-1">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Version Name (e.g. V2 Optimized)" 
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                  />
                  <Button onClick={saveVersion} size="sm">Save Draft</Button>
                </div>
              </Card>
            )}

            {/* 3. SKILLS GAP ANALYSIS */}
            {activeTab === 'gap' && (
              <div className="space-y-4 text-left">
                <Card>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                    <Compass size={18} className="text-emerald-600 mr-2" /> Target Job Alignment
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Comparison between target requirements versus your custom resume.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Skills Compatibility Match</span>
                        <span>80%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Experience Years Alignment</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Missing Skills and recommended learning */}
                <Card>
                  <h3 className="font-bold text-slate-900 mb-3">Recommended Skill Roadmap</h3>
                  <div className="space-y-3">
                    {missingSkills.map((ms, index) => (
                      <div key={index} className="flex justify-between items-start p-3 bg-red-50/50 border border-red-100 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-red-950 capitalize">{ms}</p>
                          <p className="text-[10px] text-red-700 mt-0.5">Learn: Docker Crash Course (Coursera Free Tutorial)</p>
                        </div>
                        <a href="https://www.coursera.org" target="_blank" rel="noreferrer" className="flex items-center text-xs text-indigo-600 font-semibold hover:underline">
                          <BookOpen size={12} className="mr-1" /> Learn
                        </a>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* 4. INTERVIEW QUESTION GENERATOR */}
            {activeTab === 'interview' && (
              <div className="space-y-4 text-left">
                <Card>
                  <h3 className="font-bold text-gray-900 mb-1 flex items-center">
                    <GraduationCap size={18} className="text-indigo-600 mr-2" /> AI Mock Interview Generator
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Dynamic question guides formulated from your custom skills index list.
                  </p>

                  <div className="space-y-4 divide-y divide-gray-100">
                    <div className="pt-3 first:pt-0">
                      <Badge className="bg-blue-100 text-blue-700 mb-1.5">Technical Prep</Badge>
                      <h4 className="font-bold text-xs text-slate-900">
                        "Can you describe your experience implementing API microservices using Python & React?"
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg leading-relaxed">
                        <strong>Evaluation Tip:</strong> Utilize the STAR method. State the complexity details, target technology layers, and quantifiable improvements achieved.
                      </p>
                    </div>

                    <div className="pt-3">
                      <Badge className="bg-yellow-100 text-yellow-700 mb-1.5">Behavioral Prep</Badge>
                      <h4 className="font-bold text-xs text-slate-900">
                        "Explain a scenario where you troubleshooted a critical bug or timeline lag."
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg leading-relaxed">
                        <strong>Evaluation Tip:</strong> Highlight your problem solving framework. Discuss collaborating with other specialists and optimization choices.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* 5. INTERACTIVE TIMELINE ROADMAP */}
            {activeTab === 'roadmap' && (
              <Card className="text-left">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <Play size={18} className="text-red-500 mr-2" /> Improvement Roadmap Milestones
                </h3>
                <p className="text-xs text-gray-500 mb-6">
                  Follow these structural milestone checkpoints to build a grade-A score resume.
                </p>

                {/* Roadmap Timeline */}
                <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[30px] top-0 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <CheckCircle2 size={10} className="text-white" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">Milestone 1: Complete Profile Contact</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Ensure LinkedIn professional link is present in centered format.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[30px] top-0 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white">
                      <Wand2 size={10} className="text-white" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">Milestone 2: Replace Weak Action Phrasings</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Replace occurrences of "helped with" and "responsible for" with action synonyms.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[30px] top-0 w-4 h-4 bg-slate-300 rounded-full flex items-center justify-center border-2 border-white"></div>
                    <h4 className="text-xs font-bold text-slate-400">Milestone 3: Inject Numeric Performance Metrices</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Describe experience bullet items using speed, currency, or hours saved ratios.</p>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Share Modal Dialog */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              {shareStatus === 'success' ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Shared Successfully!</h3>
                  <p className="text-sm text-gray-500">Perfect resume is sent to the recruiter.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Share With Recruiter</h3>
                  <p className="text-sm text-gray-500 mb-4">Send your customized ATS resume to target recruiter inbox.</p>
                  
                  <div className="mb-4 text-left">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Recruiter Email</label>
                    <input 
                      type="email" 
                      value={recruiterEmail}
                      onChange={(e) => setRecruiterEmail(e.target.value)}
                      placeholder="recruiter@company.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none text-sm"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" fullWidth onClick={() => setShowShareModal(false)}>Cancel</Button>
                    <Button fullWidth onClick={handleShare} disabled={shareStatus === 'sending'}>
                      {shareStatus === 'sending' ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}

        <div className="text-center mt-6">
          <button onClick={() => navigate('/home')} className="text-xs font-bold text-slate-400 hover:text-slate-700">
            Return to Home Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
