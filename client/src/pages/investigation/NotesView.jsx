import React, { useState, useEffect } from 'react';
import { NotebookPen, CheckCircle, RotateCcw, Plus, Sparkles } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Button } from '../../components/ui/Button';

export function NotesView() {
  const { progress, updateNotes } = useInvestigation();
  const [localNotes, setLocalNotes] = useState(progress?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalNotes(progress?.notes || '');
  }, [progress?.notes]);

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalNotes(value);
    setIsSaving(true);
    updateNotes(value);

    const timer = setTimeout(() => {
      setIsSaving(false);
    }, 400);

    return () => clearTimeout(timer);
  };

  const insertSnippet = (snippet) => {
    const updated = localNotes ? `${localNotes}\n\n${snippet}` : snippet;
    setLocalNotes(updated);
    updateNotes(updated);
  };

  const handleClear = () => {
    if (window.confirm('Clear all detective notes for this case dossier?')) {
      setLocalNotes('');
      updateNotes('');
    }
  };

  const wordCount = localNotes.trim() ? localNotes.trim().split(/\s+/).length : 0;
  const charCount = localNotes.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header & Save Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neoYellow border-2 border-ink rounded-lg font-mono text-xs font-bold uppercase mb-2 shadow-hard-xs">
            <NotebookPen className="w-3.5 h-3.5 stroke-[2.5]" />
            ACTIVE SCRATCHPAD
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink uppercase tracking-tight">
            DETECTIVE'S FIELD NOTEBOOK
          </h2>
          <p className="font-sans text-sm text-ink/80 mt-1">
            Persisted securely to your investigation terminal. Use this space to cross-examine suspects and correlate timestamps.
          </p>
        </div>

        {/* Real-time Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {isSaving ? (
            <span className="font-mono text-xs font-bold uppercase px-3 py-1.5 bg-neoYellow border-2 border-ink rounded-lg shadow-hard-xs animate-pulse">
              SAVING...
            </span>
          ) : (
            <span className="font-mono text-xs font-bold uppercase px-3 py-1.5 bg-neoGreen border-2 border-ink rounded-lg text-ink shadow-hard-xs flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 stroke-[2.5]" />
              SAVED TO TERMINAL
            </span>
          )}
        </div>
      </div>

      {/* Quick Insert Snippet Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-bold text-ink/70 uppercase">
          INSERT LOG TEMPLATE:
        </span>
        <button
          type="button"
          onClick={() => insertSnippet('[MOTIVE HYPOTHESIS]: ')}
          className="px-2.5 py-1 bg-paper-light border-2 border-ink rounded-lg font-mono text-xs font-bold hover:bg-neoYellow transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3 stroke-[2.5]" />
          + Motive Hypothesis
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('[ALIBI DISCREPANCY]: ')}
          className="px-2.5 py-1 bg-paper-light border-2 border-ink rounded-lg font-mono text-xs font-bold hover:bg-neoYellow transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3 stroke-[2.5]" />
          + Alibi Discrepancy
        </button>
        <button
          type="button"
          onClick={() => insertSnippet('[TIMELINE CONFLICT]: ')}
          className="px-2.5 py-1 bg-paper-light border-2 border-ink rounded-lg font-mono text-xs font-bold hover:bg-neoYellow transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3 stroke-[2.5]" />
          + Timeline Conflict
        </button>
      </div>

      {/* Notebook Editor Box */}
      <div className="bg-paper-light border-3 border-ink rounded-xl shadow-hard p-4 sm:p-6">
        <textarea
          value={localNotes}
          onChange={handleChange}
          placeholder="Record suspect contradictions, alibi discrepancies, and decisive clues..."
          rows={16}
          className="w-full bg-transparent font-mono text-sm sm:text-base text-ink placeholder:text-ink/40 focus:outline-none resize-none leading-relaxed"
        />

        {/* Footer with Counters and Clear Action */}
        <div className="pt-4 border-t-2 border-ink/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-ink/70">
          <div className="flex items-center gap-4">
            <span>{wordCount} WORDS</span>
            <span>{charCount} CHARACTERS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1 rounded border border-ink/40 hover:bg-neoCoral/20 hover:text-neoCoral transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3 stroke-[2.5]" />
              Clear Notebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
