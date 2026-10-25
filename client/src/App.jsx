import React, { useEffect, useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { ShieldCheck, Sparkles, FolderArchive, HelpCircle } from 'lucide-react';

export default function App() {
  const [apiHealth, setApiHealth] = useState({ status: 'checking', message: 'Connecting to API...' });

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setApiHealth({ status: 'connected', message: data.message, database: data.data.database });
        } else {
          setApiHealth({ status: 'error', message: 'API returned error envelope' });
        }
      })
      .catch((err) => {
        setApiHealth({ status: 'offline', message: `API offline or proxy error: ${err.message}` });
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neoPink border-2 border-ink rounded-full text-xs font-mono font-bold shadow-hard-sm">
              <Sparkles className="w-3.5 h-3.5" />
              FICTIONAL INVESTIGATION PLATFORM
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-ink leading-tight">
              CRACK THE CODE.<br />
              <span className="bg-neoYellow px-2 border-2 border-ink shadow-hard-sm inline-block mt-1">
                UNMASK THE CULPRIT.
              </span>
            </h1>

            <p className="text-lg text-ink font-medium max-w-xl">
              Turn any scenario or premise into an interactive detective dossier. Examine suspect alibis, surveillance stills, forensic logs, and chats.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button variant="primary" size="lg">START AN INVESTIGATION</Button>
              <Button variant="secondary" size="lg">EXPLORE SAMPLE CASE</Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card accent="purple" className="rotate-1 hover:rotate-0 transition-transform">
              <div className="flex items-center justify-between border-b-2 border-ink pb-3 mb-4">
                <span className="font-mono font-bold text-xs bg-neoYellow px-2 py-0.5 border border-ink rounded">
                  CASE-2026-X89
                </span>
                <span className="font-mono text-xs font-semibold">DIFFICULTY: MEDIUM</span>
              </div>
              <h3 className="font-display font-bold text-2xl mb-2">The Curator's Vanishing</h3>
              <p className="text-sm font-medium mb-4 text-ink">
                A rare masterpiece disappears from the modern gallery vault during the midnight gala. Four suspects with conflicting alibis.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono font-semibold">
                <div className="bg-white p-2 border border-ink rounded">4 SUSPECTS</div>
                <div className="bg-white p-2 border border-ink rounded">9 CLUES</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Phase 1 Verification / Status Strip */}
        <section className="mt-8 border-t-2 border-ink pt-8">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-neoGreen stroke-[2.5]" />
            <h2 className="font-display font-bold text-2xl">Phase 1 Foundation Verification</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card accent="white">
              <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-neoBlue" />
                Monorepo Workspaces
              </h3>
              <p className="text-sm text-muted">
                Cleanly decoupled client and server workspaces with shared npm scripts.
              </p>
              <span className="inline-block mt-4 font-mono text-xs font-bold bg-neoGreen px-2 py-1 border border-ink rounded">
                CONFIGURED
              </span>
            </Card>

            <Card accent="white">
              <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-neoYellow" />
                Neo-Brutalist Theme
              </h3>
              <p className="text-sm text-muted">
                Design system tokens, custom font scale, and 5px hard offset ink shadows.
              </p>
              <span className="inline-block mt-4 font-mono text-xs font-bold bg-neoGreen px-2 py-1 border border-ink rounded">
                VERIFIED
              </span>
            </Card>

            <Card accent="white">
              <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-neoPurple" />
                API Health Link
              </h3>
              <p className="text-sm text-muted font-mono">
                Status: {apiHealth.status.toUpperCase()}
              </p>
              <span className={`inline-block mt-4 font-mono text-xs font-bold px-2 py-1 border border-ink rounded ${apiHealth.status === 'connected' ? 'bg-neoGreen' : 'bg-neoYellow'}`}>
                {apiHealth.message}
              </span>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
