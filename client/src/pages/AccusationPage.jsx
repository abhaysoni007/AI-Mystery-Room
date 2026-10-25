import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Gavel, ArrowLeft, ShieldAlert, CheckCircle2, User, HelpCircle } from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';
import { SAMPLE_CASE } from '../data/sampleCase';
import { AccusationConfirmModal } from '../components/accusation/AccusationConfirmModal';
import { Button } from '../components/ui/Button';

export function AccusationPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { currentCase, selectCase, submitAccusation } = useInvestigation();

  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (caseId && (!currentCase || currentCase.id !== caseId)) {
      selectCase(caseId);
    }
  }, [caseId, currentCase, selectCase]);

  const activeCase = currentCase || SAMPLE_CASE;
  const suspects = activeCase.suspects || [];

  const selectedSuspect = suspects.find((s) => s.id === selectedSuspectId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSuspectId) return;
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    submitAccusation(selectedSuspectId, reasoning);
    navigate(`/case/${caseId}/result`);
  };

  return (
    <div className="min-h-screen bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-ink pb-6">
          <Link
            to={`/case/${caseId}/overview`}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-paper-light border-2 border-ink rounded-lg font-mono text-xs font-bold text-ink hover:bg-neoYellow transition-colors shadow-hard-xs self-start"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            RETURN TO INVESTIGATION
          </Link>

          <div className="font-mono text-xs text-ink/70 uppercase">
            CASE REF: {activeCase.id}
          </div>
        </div>

        {/* Title & Guidance */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neoCoral border-2 border-ink rounded-lg font-mono text-xs font-bold uppercase mb-3 shadow-hard-xs">
            <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
            FORMAL INDICTMENT PROCEDURE
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink uppercase tracking-tight">
            NAME THE PRIMARY PERPETRATOR
          </h1>
          <p className="font-sans text-sm sm:text-base text-ink/80 mt-2">
            Evaluate all uncovered clues, witness interviews, access logs, and timeline contradictions. Select the individual you hold responsible.
          </p>
        </div>

        {/* Suspect Selection Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase text-ink/70">
              STEP 1: SELECT ACCUSED SUSPECT ({suspects.length} CANDIDATES)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suspects.map((suspect) => {
                const isSelected = selectedSuspectId === suspect.id;
                const initials = suspect.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2);

                return (
                  <div
                    key={suspect.id}
                    onClick={() => setSelectedSuspectId(suspect.id)}
                    className={`border-3 border-ink rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-neoYellow shadow-hard translate-x-1 translate-y-1'
                        : 'bg-paper-light hover:bg-paper shadow-hard-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-paper border-2 border-ink flex items-center justify-center font-display font-bold text-lg text-ink">
                            {initials}
                          </div>
                          <div>
                            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-paper border border-ink rounded font-bold">
                              {suspect.occupation}
                            </span>
                            <h3 className="font-display font-extrabold text-lg text-ink uppercase tracking-tight">
                              {suspect.name}
                            </h3>
                          </div>
                        </div>

                        <div
                          className={`w-6 h-6 rounded-full border-2 border-ink flex items-center justify-center ${
                            isSelected ? 'bg-ink text-white' : 'bg-paper-light'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>

                      <p className="font-sans text-xs text-ink/80 mb-3 line-clamp-2">
                        {suspect.summary}
                      </p>

                      <div className="bg-paper/70 border border-ink/40 rounded p-2 text-[11px] font-sans italic text-ink/90">
                        "{suspect.publicStatement || suspect.alibiPublicText}"
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reasoning Textarea */}
          <div className="space-y-2">
            <label
              htmlFor="reasoning"
              className="font-mono text-xs font-bold uppercase text-ink/70 flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-neoPurple stroke-[2.5]" />
              STEP 2: RECORD DEDUCTIVE RATIONALE (OPTIONAL)
            </label>
            <textarea
              id="reasoning"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Explain why you eliminated other suspects and which decisive clues prove this perpetrator's guilt..."
              rows={4}
              className="w-full bg-paper-light border-3 border-ink rounded-xl p-4 font-mono text-sm text-ink placeholder:text-ink/40 focus:outline-none shadow-hard-sm resize-none"
            />
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t-2 border-ink flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono text-ink/70">
              {selectedSuspect ? (
                <span>
                  SELECTED SUSPECT:{' '}
                  <strong className="text-ink font-bold uppercase">
                    {selectedSuspect.name} ({selectedSuspect.occupation})
                  </strong>
                </span>
              ) : (
                <span>Please select a suspect from the candidates above.</span>
              )}
            </div>

            <Button
              type="submit"
              variant="danger"
              size="lg"
              disabled={!selectedSuspectId}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Gavel className="w-5 h-5 stroke-[2.5]" />
              SUBMIT FINAL INDICTMENT
            </Button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <AccusationConfirmModal
        isOpen={isConfirmOpen}
        suspectName={selectedSuspect?.name || ''}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
