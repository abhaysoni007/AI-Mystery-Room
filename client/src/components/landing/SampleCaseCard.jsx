import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ShieldAlert, ArrowRight, UserCheck, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { SAMPLE_CASE } from '../../data/sampleCase';

export function SampleCaseCard({ caseData }) {
  const navigate = useNavigate();
  const activeCase = caseData || SAMPLE_CASE;
  const suspectsCount = activeCase.suspects?.length || 4;
  const evidenceCount = activeCase.evidence?.length || 6;

  return (
    <section id="sample-case" className="py-16 border-t-2 border-ink bg-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neoYellow border-3 border-ink rounded-2xl p-8 sm:p-12 shadow-hard-lg relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-ink rounded-full text-xs font-mono font-bold shadow-hard-sm">
              <ShieldAlert className="w-4 h-4 text-neoCoral" />
              FEATURED INVESTIGATION DOSSIER
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-extrabold bg-ink text-white px-2.5 py-1 rounded border border-ink">
                {activeCase.id}
              </span>
              <span className="font-mono text-xs font-bold uppercase bg-white px-2.5 py-1 rounded border border-ink">
                DIFFICULTY: {activeCase.difficulty}
              </span>
              <span className="font-mono text-xs font-bold uppercase bg-neoPurple text-white px-2.5 py-1 rounded border border-ink">
                CATEGORY: {activeCase.category}
              </span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-ink">
              {activeCase.title}
            </h2>

            <p className="text-lg text-ink font-medium leading-relaxed">
              {activeCase.incident?.description || activeCase.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white p-3 border-2 border-ink rounded-lg shadow-hard-sm flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-neoPurple stroke-[2.5]" />
                <div>
                  <div className="font-display font-bold text-lg">{suspectsCount} Suspects</div>
                  <div className="text-xs font-mono text-muted">Contradictory Alibis</div>
                </div>
              </div>

              <div className="bg-white p-3 border-2 border-ink rounded-lg shadow-hard-sm flex items-center gap-3">
                <Search className="w-5 h-5 text-neoBlue stroke-[2.5]" />
                <div>
                  <div className="font-display font-bold text-lg">{evidenceCount} Evidence Items</div>
                  <div className="text-xs font-mono text-muted">Chats, Stills, Forensics</div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/case/${activeCase.id}`)}
                className="bg-white hover:bg-paper"
              >
                OPEN CASE DOSSIER
                <ArrowRight className="w-5 h-5 ml-2 stroke-[2.5]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
