import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Clock,
  NotebookPen,
  ShieldAlert,
  CheckCircle2,
  FileQuestion,
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { SAMPLE_CASE } from '../../data/sampleCase';
import { ChatEvidenceViewer } from '../../components/evidence/ChatEvidenceViewer';
import { ImageEvidenceViewer } from '../../components/evidence/ImageEvidenceViewer';
import { SurveillanceEvidenceViewer } from '../../components/evidence/SurveillanceEvidenceViewer';
import { DocumentEvidenceViewer } from '../../components/evidence/DocumentEvidenceViewer';
import { Button } from '../../components/ui/Button';

export function EvidenceViewerPage() {
  const { caseId, evidenceId } = useParams();
  const navigate = useNavigate();
  const { currentCase, selectCase, openEvidence, progress } = useInvestigation();

  useEffect(() => {
    if (caseId && (!currentCase || currentCase.id !== caseId)) {
      selectCase(caseId);
    }
  }, [caseId, currentCase, selectCase]);

  useEffect(() => {
    if (evidenceId) {
      openEvidence(evidenceId);
    }
  }, [evidenceId, openEvidence]);

  const activeCase = currentCase || SAMPLE_CASE;
  const evidence =
    activeCase.evidence?.find((e) => e.id === evidenceId) ||
    SAMPLE_CASE.evidence.find((e) => e.id === evidenceId);

  if (!evidence) {
    return (
      <div className="min-h-screen bg-paper p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-xl bg-neoCoral border-3 border-ink flex items-center justify-center mb-4 shadow-hard">
          <FileQuestion className="w-8 h-8 text-ink stroke-[2.5]" />
        </div>
        <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink mb-2">
          CLUE FILE NOT FOUND
        </h2>
        <p className="font-sans text-sm text-ink/80 max-w-md mb-6">
          The requested forensic artifact could not be located in case dossier {caseId}.
        </p>
        <Button variant="primary" onClick={() => navigate(`/case/${caseId}/evidence`)}>
          RETURN TO EVIDENCE VAULT
        </Button>
      </div>
    );
  }

  // Corroborating suspects and events
  const relatedSuspects = activeCase.suspects?.filter((s) =>
    evidence.relatedSuspectIds?.includes(s.id)
  ) || [];

  const relatedEvents = activeCase.timeline?.filter((ev) =>
    evidence.relatedEventIds?.includes(ev.id)
  ) || [];

  const renderArtifact = () => {
    const type = evidence.type?.toLowerCase();
    if (type === 'chat') {
      return <ChatEvidenceViewer evidence={evidence} />;
    }
    if (type === 'photo' || type === 'image') {
      return <ImageEvidenceViewer evidence={evidence} />;
    }
    if (type === 'surveillance') {
      return <SurveillanceEvidenceViewer evidence={evidence} />;
    }
    return <DocumentEvidenceViewer evidence={evidence} />;
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Top Header */}
      <header className="bg-paper border-b-3 border-ink sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              to={`/case/${caseId}/evidence`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper-light border-2 border-ink rounded-lg font-mono text-xs font-bold text-ink hover:bg-neoYellow transition-colors shadow-hard-xs shrink-0"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>BACK TO EVIDENCE VAULT</span>
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase px-2 py-0.5 bg-neoYellow border border-ink rounded font-bold shadow-hard-xs">
                  {evidence.type}
                </span>
                <span className="font-mono text-[11px] text-ink/70">
                  {evidence.id}
                </span>
              </div>
              <h1 className="font-display font-extrabold text-lg sm:text-xl text-ink uppercase tracking-tight truncate">
                {evidence.title}
              </h1>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-neoGreen border-2 border-ink rounded-lg font-mono text-xs font-bold text-ink shadow-hard-xs">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              EXAMINED & LOGGED
            </span>
          </div>
        </div>
      </header>

      {/* Main Suite Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Artifact Viewer Main Suite (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {renderArtifact()}

            {/* Acquisition Context Box */}
            <div className="bg-paper border-2 border-ink rounded-xl p-4 shadow-hard-xs">
              <div className="font-mono text-xs font-bold uppercase text-ink/70 mb-1">
                CHAIN OF CUSTODY & EVIDENCE ACQUISITION:
              </div>
              <p className="font-sans text-xs text-ink/80 leading-relaxed">
                {evidence.sourceContext || evidence.source || 'Logged by Crime Scene Investigation Unit'} • Timestamp: {evidence.timeDescription || 'Post-incident'}
              </p>
            </div>
          </div>

          {/* Right: Forensic Inspector Sidebar (1 column) */}
          <aside className="space-y-6">
            {/* Corroborating Suspects */}
            <div className="bg-paper-light border-3 border-ink rounded-xl p-5 shadow-hard">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-ink uppercase">
                  <Users className="w-4 h-4 text-neoBlue stroke-[2.5]" />
                  LINKED SUSPECTS ({relatedSuspects.length})
                </div>
              </div>

              {relatedSuspects.length > 0 ? (
                <div className="space-y-2.5">
                  {relatedSuspects.map((suspect) => (
                    <div
                      key={suspect.id}
                      className="p-3 bg-paper border-2 border-ink rounded-lg flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-display font-bold text-sm text-ink uppercase">
                          {suspect.name}
                        </div>
                        <div className="font-mono text-xs text-ink/70">
                          {suspect.occupation}
                        </div>
                      </div>
                      <Link
                        to={`/case/${caseId}/suspects`}
                        className="px-2 py-1 bg-paper-light border border-ink rounded font-mono text-[11px] font-bold hover:bg-neoYellow transition-colors"
                      >
                        Profile
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-mono text-ink/60">
                  No direct suspect matches tagged yet.
                </p>
              )}
            </div>

            {/* Associated Timeline Events */}
            <div className="bg-paper-light border-3 border-ink rounded-xl p-5 shadow-hard">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-ink uppercase">
                  <Clock className="w-4 h-4 text-neoYellow stroke-[2.5]" />
                  CORRESPONDING EVENTS ({relatedEvents.length})
                </div>
              </div>

              {relatedEvents.length > 0 ? (
                <div className="space-y-2.5">
                  {relatedEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 bg-paper border-2 border-ink rounded-lg"
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                        <span className="px-1.5 py-0.5 bg-neoYellow border border-ink rounded">
                          {ev.timeDescription || ev.time}
                        </span>
                        <Link
                          to={`/case/${caseId}/timeline`}
                          className="hover:underline text-neoPurple"
                        >
                          View
                        </Link>
                      </div>
                      <p className="font-sans text-xs text-ink/80 leading-relaxed">
                        {ev.title || ev.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-mono text-ink/60">
                  No timeline occurrences tied to this clue.
                </p>
              )}
            </div>

            {/* Quick Notes Link */}
            <div className="bg-neoYellow/20 border-3 border-ink rounded-xl p-5 shadow-hard">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-ink uppercase mb-2">
                <NotebookPen className="w-4 h-4 text-ink stroke-[2.5]" />
                INVESTIGATIVE NOTEBOOK
              </div>
              <p className="font-sans text-xs text-ink/80 mb-4 leading-relaxed">
                Notice any inconsistencies in this artifact? Record cross-examinations directly in your terminal scratchpad.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/case/${caseId}/notes`)}
              >
                OPEN CASE NOTES
              </Button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
