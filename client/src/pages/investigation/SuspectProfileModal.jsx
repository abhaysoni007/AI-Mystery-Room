import React from 'react';
import { X, User, Quote, Shield, FileText, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function SuspectProfileModal({ isOpen, suspect, onClose }) {
  if (!isOpen || !suspect) return null;

  const initials = suspect.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="suspect-profile-title"
    >
      <div className="bg-paper border-3 border-ink rounded-xl p-6 sm:p-8 max-w-2xl w-full shadow-hard-lg relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border-2 border-transparent hover:border-ink hover:bg-black/5 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 text-ink stroke-[2.5]" />
        </button>

        {/* Header & Avatar */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-neoBlue border-3 border-ink flex items-center justify-center font-display font-extrabold text-2xl text-ink shadow-hard-sm shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase px-2 py-0.5 bg-paper-light border border-ink rounded font-bold">
                {suspect.occupation}
              </span>
              <span className="font-mono text-xs uppercase px-2 py-0.5 bg-neoYellow border border-ink rounded font-bold">
                PERSON OF INTEREST
              </span>
            </div>
            <h2 id="suspect-profile-title" className="font-display font-extrabold text-2xl text-ink uppercase tracking-tight">
              {suspect.name}
            </h2>
            <p className="text-xs font-mono text-ink/70 uppercase">
              Role: {suspect.relationship}
            </p>
          </div>
        </div>

        {/* Public Stated Alibi */}
        <div className="mb-6 bg-paper-light border-2 border-ink rounded-xl p-4 shadow-hard-xs">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-ink mb-2">
            <Quote className="w-4 h-4 text-neoPurple stroke-[2.5]" />
            STATED ALIBI & PUBLIC TESTIMONY
          </div>
          <p className="font-sans text-sm italic text-ink/90 leading-relaxed pl-2 border-l-2 border-neoPurple">
            "{suspect.publicStatement || suspect.alibiPublicText}"
          </p>
        </div>

        {/* Background & Bio */}
        <div className="mb-6">
          <h3 className="font-mono text-xs font-bold uppercase text-ink/70 mb-2 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-ink stroke-[2.5]" />
            DOSSIER BACKGROUND & BEHAVIORAL PROFILE
          </h3>
          <p className="font-sans text-sm text-ink/80 leading-relaxed bg-paper-light border-2 border-ink rounded-lg p-3">
            {suspect.background || suspect.summary}
          </p>
        </div>

        {/* Associated Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-paper-light border-2 border-ink rounded-lg p-3">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-ink mb-2">
              <FileText className="w-3.5 h-3.5 text-neoPurple stroke-[2.5]" />
              ASSOCIATED EVIDENCE
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suspect.relatedEvidenceIds?.length > 0 ? (
                suspect.relatedEvidenceIds.map((eid) => (
                  <span
                    key={eid}
                    className="font-mono text-[11px] px-2 py-0.5 bg-paper border border-ink rounded font-bold"
                  >
                    {eid}
                  </span>
                ))
              ) : (
                <span className="font-mono text-xs text-ink/60">No direct links logged</span>
              )}
            </div>
          </div>

          <div className="bg-paper-light border-2 border-ink rounded-lg p-3">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-ink mb-2">
              <Clock className="w-3.5 h-3.5 text-neoYellow stroke-[2.5]" />
              TIMELINE INVOLVEMENT
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suspect.relatedEventIds?.length > 0 ? (
                suspect.relatedEventIds.map((evid) => (
                  <span
                    key={evid}
                    className="font-mono text-[11px] px-2 py-0.5 bg-paper border border-ink rounded font-bold"
                  >
                    {evid}
                  </span>
                ))
              ) : (
                <span className="font-mono text-xs text-ink/60">No specific event stamped</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            CLOSE DOSSIER
          </Button>
        </div>
      </div>
    </div>
  );
}
