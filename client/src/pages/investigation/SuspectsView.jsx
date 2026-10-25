import React, { useState } from 'react';
import { Users, Quote, UserCheck, Shield, ArrowRight } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { SuspectProfileModal } from './SuspectProfileModal';
import { Button } from '../../components/ui/Button';

const avatarColors = [
  'bg-neoBlue',
  'bg-neoGreen',
  'bg-neoYellow',
  'bg-neoPurple',
  'bg-neoCoral',
];

export function SuspectsView() {
  const { currentCase } = useInvestigation();
  const [selectedSuspect, setSelectedSuspect] = useState(null);

  const suspects = currentCase?.suspects || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* View Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neoYellow border-2 border-ink rounded-lg font-mono text-xs font-bold uppercase mb-2 shadow-hard-xs">
          <Users className="w-3.5 h-3.5 stroke-[2.5]" />
          PERSONS OF INTEREST ({suspects.length})
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink uppercase tracking-tight">
          SUSPECT ROSTER & STATEMENTS
        </h2>
        <p className="font-sans text-sm text-ink/80 mt-1 max-w-2xl">
          Review every individual present or connected to the incident, evaluate stated alibis, and uncover contradictions.
        </p>
      </div>

      {/* Suspect Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suspects.map((suspect, idx) => {
          const initials = suspect.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2);

          const colorClass = avatarColors[idx % avatarColors.length];

          return (
            <div
              key={suspect.id}
              className="bg-paper-light border-3 border-ink rounded-xl p-6 shadow-hard flex flex-col justify-between"
            >
              <div>
                {/* Top Suspect Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl ${colorClass} border-2 border-ink flex items-center justify-center font-display font-extrabold text-xl text-ink shadow-hard-sm shrink-0`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs uppercase px-2 py-0.5 bg-paper border border-ink rounded font-bold">
                        {suspect.occupation}
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-xl text-ink uppercase tracking-tight truncate">
                      {suspect.name}
                    </h3>
                    <p className="font-mono text-xs text-ink/70">
                      {suspect.relationship}
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <p className="font-sans text-xs text-ink/80 mb-4 leading-relaxed">
                  {suspect.summary}
                </p>

                {/* Stated Alibi Snippet */}
                <div className="bg-paper border-2 border-ink rounded-lg p-3 mb-6">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-ink uppercase mb-1">
                    <Quote className="w-3.5 h-3.5 text-neoPurple stroke-[2.5]" />
                    STATED ALIBI
                  </div>
                  <p className="font-sans text-xs italic text-ink/90 line-clamp-2">
                    "{suspect.publicStatement || suspect.alibiPublicText}"
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="secondary"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setSelectedSuspect(suspect)}
              >
                <UserCheck className="w-4 h-4 stroke-[2.5]" />
                INSPECT DOSSIER
                <ArrowRight className="w-4 h-4 stroke-[2.5] ml-auto" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Suspect Profile Modal */}
      <SuspectProfileModal
        isOpen={Boolean(selectedSuspect)}
        suspect={selectedSuspect}
        onClose={() => setSelectedSuspect(null)}
      />
    </div>
  );
}
