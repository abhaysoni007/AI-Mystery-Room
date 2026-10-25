import React from 'react';
import { Gavel, AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';

export function AccusationConfirmModal({ isOpen, suspectName, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accuse-confirm-title"
    >
      <div className="bg-paper border-3 border-ink rounded-xl p-6 sm:p-8 max-w-lg w-full shadow-hard-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md hover:bg-black/5 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 text-ink stroke-[2.5]" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-lg bg-neoCoral border-2 border-ink flex items-center justify-center shadow-hard-sm shrink-0">
            <Gavel className="w-6 h-6 text-ink stroke-[2.5]" />
          </div>
          <div>
            <h2
              id="accuse-confirm-title"
              className="font-display font-extrabold text-xl uppercase tracking-tight text-ink"
            >
              FINAL ACCUSATION CONFIRMATION
            </h2>
            <span className="text-xs font-mono text-ink/70 uppercase">
              IRREVOCABLE DOSSIER SEAL
            </span>
          </div>
        </div>

        <p className="text-sm font-sans text-ink/80 mb-6 leading-relaxed">
          You are about to formally indict{' '}
          <strong className="text-ink font-bold font-display uppercase text-base">
            "{suspectName}"
          </strong>{' '}
          as the primary perpetrator. This action will conclude your active investigation and seal the case file.
          The official canonical solution, forensic analysis, and motive breakdown will be immediately revealed.
        </p>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            CANCEL & RE-EXAMINE
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            className="flex items-center gap-2"
          >
            <Gavel className="w-4 h-4 stroke-[2.5]" />
            SEAL AND DELIVER VERDICT
          </Button>
        </div>
      </div>
    </div>
  );
}
