import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { InvestigationProvider } from './context/InvestigationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { CreateMysteryPage } from './pages/CreateMysteryPage';
import { DashboardPage } from './pages/DashboardPage';
import { InvestigationLayout } from './layouts/InvestigationLayout';
import { CaseOverviewView } from './pages/investigation/CaseOverviewView';
import { SuspectsView } from './pages/investigation/SuspectsView';
import { EvidenceView } from './pages/investigation/EvidenceView';
import { TimelineView } from './pages/investigation/TimelineView';
import { NotesView } from './pages/investigation/NotesView';

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
    <InvestigationProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Website / Dashboard Chrome */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<CreateMysteryPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

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
      </BrowserRouter>
    </InvestigationProvider>
  );
}
