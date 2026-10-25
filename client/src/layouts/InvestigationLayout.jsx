import React, { useEffect } from 'react';
import { useParams, NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Gavel,
  FileText,
  Users,
  FolderSearch,
  Clock,
  NotebookPen,
  ShieldAlert,
} from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';
import { Button } from '../components/ui/Button';

export function InvestigationLayout() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { currentCase, selectCase, progress } = useInvestigation();

  useEffect(() => {
    if (caseId && (!currentCase || currentCase.id !== caseId)) {
      selectCase(caseId);
    }
  }, [caseId, currentCase, selectCase]);

  const activeCase = currentCase || {
    id: caseId,
    title: 'Investigation Room',
    category: 'theft',
    difficulty: 'medium',
    evidence: [],
    suspects: [],
    timeline: [],
  };

  const openedCount = progress?.openedEvidenceIds?.length || 0;
  const totalClues = activeCase.evidence?.length || 6;
  const progressPercent = Math.min(100, Math.round((openedCount / totalClues) * 100));

  const navItems = [
    {
      to: `/case/${caseId}/overview`,
      label: 'OVERVIEW',
      icon: FileText,
    },
    {
      to: `/case/${caseId}/suspects`,
      label: 'SUSPECTS',
      icon: Users,
      badge: activeCase.suspects?.length || 0,
    },
    {
      to: `/case/${caseId}/evidence`,
      label: 'EVIDENCE',
      icon: FolderSearch,
      badge: activeCase.evidence?.length || 0,
    },
    {
      to: `/case/${caseId}/timeline`,
      label: 'TIMELINE',
      icon: Clock,
      badge: activeCase.timeline?.length || 0,
    },
    {
      to: `/case/${caseId}/notes`,
      label: 'NOTES',
      icon: NotebookPen,
    },
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Top Investigation Bar */}
      <header className="bg-paper border-b-3 border-ink sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Left: Back Link & Title */}
          <div className="flex items-center gap-4 min-w-0">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper-light border-2 border-ink rounded-lg font-mono text-xs font-bold text-ink hover:bg-neoYellow transition-colors shadow-hard-xs shrink-0"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">ALL CASES</span>
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase px-2 py-0.5 bg-neoYellow border border-ink rounded font-bold shadow-hard-xs">
                  {activeCase.category || 'THEFT'}
                </span>
                <span className="hidden sm:inline-block font-mono text-[11px] uppercase px-2 py-0.5 bg-paper-light border border-ink rounded font-bold">
                  {activeCase.difficulty || 'MEDIUM'}
                </span>
              </div>
              <h1 className="font-display font-extrabold text-lg sm:text-xl text-ink uppercase tracking-tight truncate">
                {activeCase.title}
              </h1>
            </div>
          </div>

          {/* Right: Progress & Accuse Action */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-ink">
                <span>CLUES OPENED:</span>
                <span className="bg-paper-light px-2 py-0.5 border border-ink rounded">
                  {openedCount}/{totalClues} ({progressPercent}%)
                </span>
              </div>
              <div className="w-32 h-2.5 bg-paper-light border-2 border-ink rounded-full overflow-hidden mt-1 p-0.5">
                <div
                  className="h-full bg-neoYellow rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={() => navigate(`/case/${caseId}/accuse`)}
              className="flex items-center gap-2"
            >
              <Gavel className="w-4 h-4 stroke-[2.5]" />
              <span className="font-extrabold tracking-wide">MAKE ACCUSATION</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body with Sidebar & Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar Rail */}
        <aside className="hidden md:block w-60 border-r-3 border-ink bg-paper p-4 shrink-0">
          <div className="sticky top-28 space-y-2">
            <div className="px-3 py-2 font-mono text-xs text-ink/70 uppercase tracking-wider font-bold">
              INVESTIGATION SECTIONS
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-lg border-2 border-ink font-display font-bold text-sm transition-all ${
                      isActive
                        ? 'bg-neoYellow text-ink shadow-hard-xs translate-x-1'
                        : 'bg-paper-light text-ink hover:bg-paper'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="font-mono text-xs px-2 py-0.5 bg-paper border border-ink rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </aside>

        {/* View Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-24 md:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-paper border-t-3 border-ink z-40 px-2 py-2 flex items-center justify-around shadow-hard-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-lg font-mono text-[10px] font-bold transition-all ${
                  isActive ? 'bg-neoYellow border-2 border-ink text-ink shadow-hard-xs' : 'text-ink/80'
                }`
              }
            >
              <Icon className="w-4 h-4 stroke-[2.5]" />
              <span className="mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
