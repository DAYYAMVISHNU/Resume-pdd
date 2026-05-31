import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from
'react-router-dom';
import { AnimatePresence } from 'framer-motion';
// Auth & Onboarding
import { SplashScreen } from './screens/auth/SplashScreen';
import { Onboarding1 } from './screens/auth/Onboarding1';
import { Onboarding2 } from './screens/auth/Onboarding2';
import { Onboarding3 } from './screens/auth/Onboarding3';
import { LoginScreen } from './screens/auth/LoginScreen';
import { SignUpScreen } from './screens/auth/SignUpScreen';
import { ForgotPassword } from './screens/auth/ForgotPassword';
// Dashboard
import { HomeDashboard } from './screens/dashboard/HomeDashboard';
import { RecentAnalyses } from './screens/dashboard/RecentAnalyses';
import { Notifications } from './screens/dashboard/Notifications';
// Job Description Flow
import { CreateNewAnalysis } from './screens/job-description/CreateNewAnalysis';
import { EnterJobDescription } from './screens/job-description/EnterJobDescription';
import { JobDescriptionPreview } from './screens/job-description/JobDescriptionPreview';
import { JobDescriptionTemplates } from './screens/job-description/JobDescriptionTemplates';
import { SavedJobDescriptions } from './screens/job-description/SavedJobDescriptions';
// Upload Flow
import { UploadResumes } from './screens/upload/UploadResumes';
import { UploadProgress } from './screens/upload/UploadProgress';
import { ResumeListView } from './screens/upload/ResumeListView';
import { ResumePreview } from './screens/upload/ResumePreview';
import { BulkUploadConfirmation } from './screens/upload/BulkUploadConfirmation';
// Ranking Results
import { RankingOverview } from './screens/ranking/RankingOverview';
import { RankingTable } from './screens/ranking/RankingTable';
import { CandidateScoreCard } from './screens/ranking/CandidateScoreCard';
import { ComparisonView } from './screens/ranking/ComparisonView';
import { SimilarityBreakdown } from './screens/ranking/SimilarityBreakdown';
import { SkillsMatchAnalysis } from './screens/ranking/SkillsMatchAnalysis';
import { ExperienceMatchAnalysis } from './screens/ranking/ExperienceMatchAnalysis';
import { ExportResults } from './screens/ranking/ExportResults';
// ATS Flow
import { ATSScoreHome } from './screens/ats/ATSScoreHome';
import { ATSUploadResume } from './screens/ats/ATSUploadResume';
import { ATSScoreResults } from './screens/ats/ATSScoreResults';
import { ATSScoreBreakdown } from './screens/ats/ATSScoreBreakdown';
import { ATSImprovementSuggestions } from './screens/ats/ATSImprovementSuggestions';
import { ATSScoreHistory } from './screens/ats/ATSScoreHistory';
import { ATSScoreComparison } from './screens/ats/ATSScoreComparison';
import { ATSPerfectResume } from './screens/ats/ATSPerfectResume';
// Resume Details
import { ResumeDetailView } from './screens/resume-details/ResumeDetailView';
import { SkillsExtraction } from './screens/resume-details/SkillsExtraction';
import { ExperienceTimeline } from './screens/resume-details/ExperienceTimeline';
import { EducationDetails } from './screens/resume-details/EducationDetails';
import { ContactInfoParsed } from './screens/resume-details/ContactInfoParsed';
// Analytics
import { AnalyticsDashboard } from './screens/analytics/AnalyticsDashboard';
import { SkillsTrends } from './screens/analytics/SkillsTrends';
import { HiringFunnel } from './screens/analytics/HiringFunnel';
// Settings & Profile
import { ProfilePage } from './screens/settings/ProfilePage';
import { AccountSettings } from './screens/settings/AccountSettings';
import { SubscriptionPricing } from './screens/settings/SubscriptionPricing';
import { HelpSupport } from './screens/settings/HelpSupport';
import { AboutLegal } from './screens/settings/AboutLegal';
// Additional
import { SearchFilter } from './screens/additional/SearchFilter';
import { TeamCollaboration } from './screens/additional/TeamCollaboration';
// Admin
import { ActiveUsers } from './screens/admin/ActiveUsers';
// Placeholder for unbuilt screens
import { PlaceholderScreen } from './components/layout/PlaceholderScreen';

import { getApiUrl } from './config/ApiConfig';
import { ThemeProvider } from './context/ThemeContext';

export function App() {
  useEffect(() => {
    const pingBackend = async () => {
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');
      try {
        if (userEmail && userName) {
          await fetch(getApiUrl('/ping'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, name: userName })
          });
        } else {
          // Send a basic wakeup request if not logged in
          await fetch(getApiUrl('/'));
        }
      } catch (e) {
        console.error("Failed to ping server", e);
      }
    };

    pingBackend();
    const interval = setInterval(pingBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <AnimatePresence mode="wait">
          <Routes>
            {/* Auth & Onboarding */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/onboarding/1" element={<Onboarding1 />} />
            <Route path="/onboarding/2" element={<Onboarding2 />} />
            <Route path="/onboarding/3" element={<Onboarding3 />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Dashboard */}
            <Route path="/home" element={<HomeDashboard />} />
            <Route path="/recent" element={<RecentAnalyses />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* Job Description Flow */}
            <Route path="/new-analysis" element={<CreateNewAnalysis />} />
            <Route
              path="/job-description/enter"
              element={<EnterJobDescription />} />
            
            <Route
              path="/job-description/preview"
              element={<JobDescriptionPreview />} />
            
            <Route
              path="/job-description/templates"
              element={<JobDescriptionTemplates />} />
            
            <Route
              path="/job-description/saved"
              element={<SavedJobDescriptions />} />
            

            {/* Upload Flow */}
            <Route path="/upload" element={<UploadResumes />} />
            <Route path="/upload/progress" element={<UploadProgress />} />
            <Route path="/upload/list" element={<ResumeListView />} />
            <Route path="/upload/preview" element={<ResumePreview />} />
            <Route
              path="/upload/confirm"
              element={<BulkUploadConfirmation />} />
            

            {/* Ranking Results */}
            <Route path="/ranking/overview" element={<RankingOverview />} />
            <Route path="/ranking/table" element={<RankingTable />} />
            <Route
              path="/ranking/candidate/:id"
              element={<CandidateScoreCard />} />
            
            <Route path="/ranking/compare" element={<ComparisonView />} />
            <Route
              path="/ranking/similarity"
              element={<SimilarityBreakdown />} />
            
            <Route path="/ranking/skills" element={<SkillsMatchAnalysis />} />
            <Route
              path="/ranking/experience"
              element={<ExperienceMatchAnalysis />} />
            
            <Route path="/ranking/export" element={<ExportResults />} />

            {/* ATS Flow */}
            <Route path="/ats" element={<ATSScoreHome />} />
            <Route path="/ats/upload" element={<ATSUploadResume />} />
            <Route path="/ats/results" element={<ATSScoreResults />} />
            <Route path="/ats/breakdown" element={<ATSScoreBreakdown />} />
            <Route
              path="/ats/suggestions"
              element={<ATSImprovementSuggestions />} />
            
            <Route path="/ats/history" element={<ATSScoreHistory />} />
            <Route path="/ats/comparison" element={<ATSScoreComparison />} />
            <Route path="/ats/perfect" element={<ATSPerfectResume />} />

            {/* Resume Details */}
            <Route path="/resume/:id" element={<ResumeDetailView />} />
            <Route path="/resume/:id/skills" element={<SkillsExtraction />} />
            <Route
              path="/resume/:id/experience"
              element={<ExperienceTimeline />} />
            
            <Route
              path="/resume/:id/education"
              element={<EducationDetails />} />
            
            <Route path="/resume/:id/contact" element={<ContactInfoParsed />} />

            {/* Analytics */}
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/analytics/skills" element={<SkillsTrends />} />
            <Route path="/analytics/funnel" element={<HiringFunnel />} />

            {/* Settings & Profile */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<AccountSettings />} />
            <Route path="/pricing" element={<SubscriptionPricing />} />
            <Route path="/help" element={<HelpSupport />} />
            <Route path="/about" element={<AboutLegal />} />

            {/* Additional */}
            <Route path="/search" element={<SearchFilter />} />
            <Route path="/team" element={<TeamCollaboration />} />

            {/* Admin */}
            <Route path="/admin/users" element={<ActiveUsers />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  </ThemeProvider>);

}