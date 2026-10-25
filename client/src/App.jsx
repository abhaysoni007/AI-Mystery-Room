import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InvestigationProvider } from './context/InvestigationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { CreateMysteryPage } from './pages/CreateMysteryPage';

export default function App() {
  return (
    <InvestigationProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-paper text-ink font-sans selection:bg-neoYellow selection:text-ink">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/create" element={<CreateMysteryPage />} />
              {/* Fallback to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </InvestigationProvider>
  );
}
