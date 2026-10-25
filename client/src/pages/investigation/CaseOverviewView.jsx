import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, AlertCircle, Users, FolderSearch, NotebookPen, ArrowRight } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';

export function CaseOverviewView() {
  const { caseId } = useParams();
  const { currentCase, progress } = useInvestigation();

  const activeCase = currentCase || {
    incident: {
      location: 'Crime Scene',
      timeDescription: 'Unknown Time',
      description: 'Incident details are being loaded.',
    },
    suspects: [],
    evidence: [],
    timeline: [],
  };

  const openedCount = progress?.openedEvidenceIds?.length || 0;
  const totalClues = activeCase.evidence?.length || 6;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner / Heading */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neoYellow border-2 border-ink rounded-lg font-mono text-xs font-bold uppercase mb-2 shadow-hard-xs">
          <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
          PRIMARY INCIDENT DOSSIER
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink uppercase tracking-tight">
          INCIDENT REPORT & CRIME OVERVIEW
        </h2>
        <p className="font-sans text-sm text-ink/80 mt-1 max-w-2xl">
          Verified dispatch details, scene location, and initial findings recorded at the time of discovery.
        </p>
      </div>

      {/* Incident Core Facts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-paper-light border-3 border-ink rounded-xl p-5 shadow-hard">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-ink/70 uppercase mb-2">
            <MapPin className="w-4 h-4 text-neoCoral stroke-[2.5]" />
            PRIMARY CRIME SCENE LOCATION
          </div>
          <div className="font-display font-extrabold text-lg text-ink">
            {activeCase.incident?.location || 'Unspecified Location'}
          </div>
        </div>

        <div className="bg-paper-light border-3 border-ink rounded-xl p-5 shadow-hard">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-ink/70 uppercase mb-2">
            <Clock className="w-4 h-4 text-neoBlue stroke-[2.5]" />
            ESTIMATED TIMEFRAME
          </div>
          <div className="font-display font-extrabold text-lg text-ink">
            {activeCase.incident?.timeDescription || 'Estimated window pending reconstruction'}
          </div>
        </div>
      </div>

      {/* Incident Description */}
      <div className="bg-paper-light border-3 border-ink rounded-xl p-6 shadow-hard">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-ink/70 uppercase mb-3">
          <AlertCircle className="w-4 h-4 text-neoPurple stroke-[2.5]" />
          DISPATCH REPORT NARRATIVE
        </div>
        <p className="font-sans text-base text-ink leading-relaxed">
          {activeCase.incident?.description}
        </p>
      </div>

      {/* Quick Access Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to={`/case/${caseId}/suspects`}
          className="bg-paper border-2 border-ink rounded-xl p-4 shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-ink/70 uppercase">SUSPECTS</span>
              <Users className="w-4 h-4 text-neoBlue stroke-[2.5]" />
            </div>
            <div className="font-display font-extrabold text-2xl text-ink">
              {activeCase.suspects?.length || 4} Profiles
            </div>
            <p className="text-xs font-sans text-ink/70 mt-1">Cross-examine alibis and relationships.</p>
          </div>
          <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-neoPurple group-hover:underline">
            <span>Inspect Suspects</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </Link>

        <Link
          to={`/case/${caseId}/evidence`}
          className="bg-paper border-2 border-ink rounded-xl p-4 shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-ink/70 uppercase">EVIDENCE VAULT</span>
              <FolderSearch className="w-4 h-4 text-neoPurple stroke-[2.5]" />
            </div>
            <div className="font-display font-extrabold text-2xl text-ink">
              {openedCount}/{totalClues} Analyzed
            </div>
            <p className="text-xs font-sans text-ink/70 mt-1">Examine forensic logs, chats, and stills.</p>
          </div>
          <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-neoPurple group-hover:underline">
            <span>Analyze Clues</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </Link>

        <Link
          to={`/case/${caseId}/timeline`}
          className="bg-paper border-2 border-ink rounded-xl p-4 shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-ink/70 uppercase">TIMELINE</span>
              <Clock className="w-4 h-4 text-neoYellow stroke-[2.5]" />
            </div>
            <div className="font-display font-extrabold text-2xl text-ink">
              {activeCase.timeline?.length || 6} Events
            </div>
            <p className="text-xs font-sans text-ink/70 mt-1">Review verified chronological sequence.</p>
          </div>
          <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-neoPurple group-hover:underline">
            <span>Review Timeline</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </Link>

        <Link
          to={`/case/${caseId}/notes`}
          className="bg-paper border-2 border-ink rounded-xl p-4 shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-ink/70 uppercase">FIELD NOTES</span>
              <NotebookPen className="w-4 h-4 text-neoGreen stroke-[2.5]" />
            </div>
            <div className="font-display font-extrabold text-2xl text-ink">
              {progress?.notes?.trim() ? 'Notes Logged' : 'Scratchpad'}
            </div>
            <p className="text-xs font-sans text-ink/70 mt-1">Record deduction drafts and motives.</p>
          </div>
          <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-neoPurple group-hover:underline">
            <span>Open Notebook</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </Link>
      </div>
    </div>
  );
}
