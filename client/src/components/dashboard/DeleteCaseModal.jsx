import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button';

export function DeleteCaseModal({ isOpen, onClose, onConfirm, caseTitle }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-case-title"
    >
      <div className="bg-paper border-3 border-ink rounded-xl p-6 sm:p-8 max-w-md w-full shadow-hard-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md hover:bg-black/5 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 text-ink stroke-[2.5]" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-neoCoral border-2 border-ink flex items-center justify-center shadow-hard-sm">
            <AlertTriangle className="w-6 h-6 text-ink stroke-[2.5]" />
          </div>
          <div>
            <h2 id="delete-case-title" className="font-display font-extrabold text-xl uppercase tracking-tight text-ink">
              DELETE CASE DOSSIER
            </h2>
            <span className="text-xs font-mono text-ink/70 uppercase">IRREVERSIBLE ACTION</span>
          </div>
        </div>

        <p className="text-sm font-sans text-ink/80 mb-6 leading-relaxed">
          Are you sure you want to permanently destroy the case file for{' '}
          <strong className="text-ink font-bold">"{caseTitle}"</strong>?
          All collected notes, opened evidence, and investigation progress will be wiped from your local terminal.
        </p>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            CANCEL
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4 stroke-[2.5]" />
            CONFIRM DELETION
          </Button>
        </div>
      </div>
    </div>
  );
}
