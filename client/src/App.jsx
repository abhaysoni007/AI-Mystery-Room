import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InvestigationProvider } from './context/InvestigationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PlatformWalkthrough } from './components/walkthrough/PlatformWalkthrough';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { CreateMysteryPage } from './pages/CreateMysteryPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { InvestigationLayout } from './layouts/InvestigationLayout';
import { CaseOverviewView } from './pages/investigation/CaseOverviewView';
import { SuspectsView } from './pages/investigation/SuspectsView';
import { EvidenceView } from './pages/investigation/EvidenceView';
import { TimelineView } from './pages/investigation/TimelineView';
import { NotesView } from './pages/investigation/NotesView';
import { EvidenceViewerPage } from './pages/evidence/EvidenceViewerPage';
import { AccusationPage } from './pages/AccusationPage';
import { ResultRevealPage } from './pages/ResultRevealPage';

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-sans selection:bg-neoYellow selection:text-ink">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InvestigationProvider>
        <BrowserRouter>
          <Routes>
            {/* Main Website / Dashboard Chrome */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />

              {/* Protected Detective Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/create" element={<CreateMysteryPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forget" element={<ForgotPasswordPage />} />
              <Route path="/forgot" element={<Navigate to="/forget" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/forget" replace />} />
            </Route>

            {/* Type-Specific Evidence Viewer Suite */}
            <Route
              path="/case/:caseId/evidence/:evidenceId"
              element={<EvidenceViewerPage />}
            />

            {/* Accusation and Post-Verdict Reveal */}
            <Route
              path="/case/:caseId/accuse"
              element={<AccusationPage />}
            />
            <Route
              path="/case/:caseId/result"
              element={<ResultRevealPage />}
            />

            {/* Investigation Workspace Chrome */}
            <Route path="/case/:caseId" element={<InvestigationLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<CaseOverviewView />} />
              <Route path="suspects" element={<SuspectsView />} />
              <Route path="evidence" element={<EvidenceView />} />
              <Route path="timeline" element={<TimelineView />} />
              <Route path="notes" element={<NotesView />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <PlatformWalkthrough />
        </BrowserRouter>
      </InvestigationProvider>
    </AuthProvider>
  );
}
