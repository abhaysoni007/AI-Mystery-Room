import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  FolderArchive,
  Compass,
  FileText,
  HelpCircle,
  ShieldCheck,
  Flame,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';
import { SAMPLE_CASE } from '../data/sampleCase';
import { Button } from '../components/ui/Button';

export function ResultRevealPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { result: contextResult, currentCase, selectCase } = useInvestigation();

  useEffect(() => {
    if (caseId && (!currentCase || currentCase.id !== caseId)) {
      selectCase(caseId);
    }
  }, [caseId, currentCase, selectCase]);

  // Fallback to localStorage if refreshed
  let result = contextResult;
  if (!result) {
    try {
      const stored = localStorage.getItem(`ai_mystery_result_${caseId}`);
      if (stored) {
        result = JSON.parse(stored);
      }
    } catch (e) {
      // fallback
    }
  }

  const activeCase = currentCase || SAMPLE_CASE;

  if (!result) {
    return (
      <div className="min-h-screen bg-paper p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-xl bg-neoYellow border-3 border-ink flex items-center justify-center mb-4 shadow-hard">
          <HelpCircle className="w-8 h-8 text-ink stroke-[2.5]" />
        </div>
        <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink mb-2">
          NO VERDICT RECORDED YET
        </h2>
        <p className="font-sans text-sm text-ink/80 max-w-md mb-6">
          An accusation has not been officially submitted for this case dossier yet.
        </p>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => navigate(`/case/${caseId}/overview`)}>
            CONTINUE INVESTIGATION
          </Button>
          <Button variant="primary" onClick={() => navigate(`/case/${caseId}/accuse`)}>
            MAKE ACCUSATION
          </Button>
        </div>
      </div>
    );
  }

  const isCorrect = result.isCorrect;
  const accusedSuspect = activeCase.suspects?.find((s) => s.id === result.selectedSuspectId);
  const culpritSuspect = activeCase.suspects?.find((s) => s.id === result.culprit?.id);

  const decisiveClues = (result.solution?.decisiveEvidenceIds || [])
    .map((eid) => activeCase.evidence?.find((e) => e.id === eid))
    .filter(Boolean);

  const redHerrings = result.solution?.redHerrings || [];

  return (
    <div className="min-h-screen bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-200">
        {/* Verdict Banner */}
        <div
          className={`border-3 border-ink rounded-xl p-6 sm:p-8 shadow-hard relative overflow-hidden ${
            isCorrect ? 'bg-neoGreen text-ink' : 'bg-neoCoral text-ink'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-paper border-3 border-ink flex items-center justify-center shadow-hard-sm shrink-0">
                {isCorrect ? (
                  <CheckCircle2 className="w-10 h-10 text-neoGreen stroke-[2.5]" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-neoCoral stroke-[2.5]" />
                )}
              </div>
              <div>
                <span className="font-mono text-xs font-bold uppercase px-2.5 py-0.5 bg-paper border border-ink rounded shadow-hard-xs inline-block mb-1">
                  OFFICIAL INQUEST VERDICT
                </span>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight">
                  {isCorrect
                    ? 'CASE CLOSED — ACCUSATION VERIFIED CORRECT'
                    : 'ACCUSATION FAILED — WRONGFUL INDICTMENT'}
                </h1>
                <p className="font-sans text-sm mt-1 max-w-xl font-medium">
                  {isCorrect
                    ? `Masterful deduction! You saw through the red herrings and successfully unmasked ${result.culprit?.name}.`
                    : `You accused ${accusedSuspect?.name || 'the wrong suspect'}, but the true perpetrator was ${result.culprit?.name}. Inspect the canonical solution below.`}
                </p>
              </div>
            </div>

            <div className="bg-paper border-2 border-ink rounded-xl p-4 text-center shrink-0 shadow-hard-xs">
              <div className="font-mono text-[10px] text-ink/70 uppercase font-bold">
                SCORE EVALUATION
              </div>
              <div className="font-display font-extrabold text-3xl">
                {result.score} / 100
              </div>
            </div>
          </div>
        </div>

        {/* Canonical Solution Card */}
        <div className="bg-paper-light border-3 border-ink rounded-xl p-6 sm:p-8 shadow-hard space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-neoYellow border border-ink rounded font-mono text-xs font-bold uppercase mb-1">
                <Flame className="w-3.5 h-3.5" />
                OFFICIAL DOSSIER CANON
              </div>
              <h2 className="font-display font-extrabold text-2xl text-ink uppercase tracking-tight">
                PERPETRATOR: {result.culprit?.name}
              </h2>
            </div>
            {culpritSuspect && (
              <span className="font-mono text-xs uppercase px-3 py-1 bg-paper border border-ink rounded font-bold">
                {culpritSuspect.occupation}
              </span>
            )}
          </div>

          {/* Motive & Method Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-paper border-2 border-ink rounded-xl p-5 shadow-hard-xs">
              <div className="font-mono text-xs font-bold text-ink uppercase mb-2 text-neoPurple">
                [ ESTABLISHED MOTIVE ]
              </div>
              <p className="font-sans text-sm text-ink leading-relaxed">
                {result.solution?.motive}
              </p>
            </div>

            <div className="bg-paper border-2 border-ink rounded-xl p-5 shadow-hard-xs">
              <div className="font-mono text-xs font-bold text-ink uppercase mb-2 text-neoCoral">
                [ METHOD OF EXECUTION ]
              </div>
              <p className="font-sans text-sm text-ink leading-relaxed">
                {result.solution?.method}
              </p>
            </div>
          </div>

          {/* Deductive Chain / Rationale */}
          <div className="bg-paper border-2 border-ink rounded-xl p-5 shadow-hard-xs">
            <div className="font-mono text-xs font-bold text-ink uppercase mb-2 text-ink">
              [ DEDUCTIVE PROOF & FORENSIC CHAIN ]
            </div>
            <p className="font-sans text-sm text-ink leading-relaxed">
              {result.solution?.rationale}
            </p>
          </div>
        </div>

        {/* Decisive Evidence Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-neoGreen stroke-[2.5]" />
            <h2 className="font-display font-extrabold text-xl text-ink uppercase tracking-tight">
              DECISIVE EVIDENCE CONNECTING THE CULPRIT
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {decisiveClues.map((clue) => (
              <div
                key={clue.id}
                className="bg-paper-light border-3 border-ink rounded-xl p-5 shadow-hard flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-neoGreen border border-ink rounded font-bold">
                      {clue.type}
                    </span>
                    <span className="font-mono text-[10px] text-ink/70">
                      DECISIVE
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-ink uppercase mb-2 line-clamp-1">
                    {clue.title}
                  </h3>
                  <p className="font-sans text-xs text-ink/80 line-clamp-3 leading-relaxed mb-4">
                    {clue.summary || clue.description}
                  </p>
                </div>

                <Link
                  to={`/case/${caseId}/evidence/${clue.id}`}
                  className="font-mono text-xs font-bold text-neoPurple hover:underline inline-flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                  Re-examine Clue
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Red Herrings & Cleared Suspects */}
        {redHerrings.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-neoPurple stroke-[2.5]" />
              <h2 className="font-display font-extrabold text-xl text-ink uppercase tracking-tight">
                DECEPTIVE LEADS & CLEARED SUSPECTS
              </h2>
            </div>

            <div className="space-y-3">
              {redHerrings.map((herring, idx) => {
                const suspect = activeCase.suspects?.find((s) => s.id === herring.suspectId);
                return (
                  <div
                    key={idx}
                    className="bg-paper-light border-2 border-ink rounded-xl p-4 shadow-hard-xs"
                  >
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-ink uppercase mb-1">
                      <span className="px-2 py-0.5 bg-paper border border-ink rounded">
                        {suspect ? suspect.name : herring.suspectId}
                      </span>
                      <span className="text-ink/60">CLEARED SUSPICION</span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-ink/80 leading-relaxed">
                      {herring.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* User Indictment Review */}
        {result.reasoning && (
          <div className="bg-paper border-2 border-ink rounded-xl p-5 shadow-hard-xs">
            <div className="font-mono text-xs font-bold text-ink/70 uppercase mb-2">
              YOUR RECORDED REASONING:
            </div>
            <p className="font-mono text-xs text-ink leading-relaxed italic">
              "{result.reasoning}"
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-6 border-t-3 border-ink flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <FolderArchive className="w-5 h-5 stroke-[2.5]" />
            RETURN TO CENTRAL ARCHIVES
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/create')}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Compass className="w-5 h-5 stroke-[2.5]" />
            SOLVE ANOTHER MYSTERY
          </Button>
        </div>
      </div>
    </div>
  );
}
