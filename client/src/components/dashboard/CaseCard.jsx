import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderCheck, Search, Trash2, ArrowRight, FileText, Users } from 'lucide-react';
import { Button } from '../ui/Button';

export function CaseCard({ caseData, onDelete, onSelect }) {
  const navigate = useNavigate();

  // Retrieve progress from localStorage for this specific case if available
  let openedEvidenceCount = 0;
  let isCompleted = caseData.status === 'completed';

  try {
    const rawProgress = localStorage.getItem(`ai_mystery_progress_${caseData.id}`);
    if (rawProgress) {
      const parsed = JSON.parse(rawProgress);
      openedEvidenceCount = parsed.openedEvidenceIds?.length || 0;
      if (parsed.status === 'completed') isCompleted = true;
    }
  } catch (e) {
    // fallback
  }

  const totalEvidence = caseData.evidence?.length || 6;
  const totalSuspects = caseData.suspects?.length || 4;
  const progressPercent = isCompleted ? 100 : Math.min(100, Math.round((openedEvidenceCount / totalEvidence) * 100));

  const handleAction = () => {
    if (onSelect) onSelect(caseData.id);
    if (isCompleted) {
      navigate(`/case/${caseData.id}/result`);
    } else {
      navigate(`/case/${caseData.id}`);
    }
  };

  const difficultyColors = {
    easy: 'bg-neoGreen text-ink',
    medium: 'bg-neoYellow text-ink',
    hard: 'bg-neoCoral text-ink',
  };

  return (
    <div className="bg-paper border-3 border-ink rounded-xl p-6 shadow-hard flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 transition-transform">
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs uppercase px-2.5 py-0.5 bg-paper-light border-2 border-ink rounded font-bold shadow-hard-xs">
              {caseData.category || 'THEFT'}
            </span>
            <span
              className={`font-mono text-xs uppercase px-2.5 py-0.5 border-2 border-ink rounded font-bold shadow-hard-xs ${
                difficultyColors[caseData.difficulty] || difficultyColors.medium
              }`}
            >
              {caseData.difficulty || 'MEDIUM'}
            </span>
            {isCompleted ? (
              <span className="font-mono text-xs uppercase px-2.5 py-0.5 bg-neoGreen border-2 border-ink rounded font-bold text-ink flex items-center gap-1 shadow-hard-xs">
                <FolderCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                SOLVED
              </span>
            ) : (
              <span className="font-mono text-xs uppercase px-2.5 py-0.5 bg-neoYellow border-2 border-ink rounded font-bold text-ink shadow-hard-xs">
                ACTIVE
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onDelete(caseData)}
            className="p-1.5 text-ink/70 hover:text-neoCoral hover:bg-neoCoral/10 rounded-lg border-2 border-transparent hover:border-ink transition-colors"
            aria-label="Delete case"
            title="Delete case dossier"
          >
            <Trash2 className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Case Title */}
        <h3 className="font-display font-extrabold text-xl text-ink uppercase tracking-tight mb-2 line-clamp-1">
          {caseData.title}
        </h3>

        {/* Case Summary */}
        <p className="font-sans text-xs text-ink/80 line-clamp-2 mb-4 leading-relaxed">
          {caseData.summary || caseData.incident?.description}
        </p>

        {/* Evidence & Suspect Counts */}
        <div className="flex items-center gap-4 text-xs font-mono text-ink/80 mb-4 bg-paper-light border-2 border-ink rounded-lg p-2.5">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-neoPurple stroke-[2.5]" />
            <span>
              {openedEvidenceCount}/{totalEvidence} Clues Opened
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-neoBlue stroke-[2.5]" />
            <span>{totalSuspects} Suspects</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-ink mb-1">
            <span>INVESTIGATION PROGRESS</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-paper-light border-2 border-ink rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-neoGreen' : 'bg-neoYellow'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <Button
        variant={isCompleted ? 'secondary' : 'primary'}
        size="md"
        className="w-full flex items-center justify-center gap-2"
        onClick={handleAction}
      >
        {isCompleted ? (
          <>
            <FolderCheck className="w-4 h-4 stroke-[2.5]" />
            REVIEW SOLUTION
          </>
        ) : (
          <>
            <Search className="w-4 h-4 stroke-[2.5]" />
            RESUME INVESTIGATION
          </>
        )}
        <ArrowRight className="w-4 h-4 stroke-[2.5] ml-auto" />
      </Button>
    </div>
  );
}
