import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderSearch,
  MessageSquare,
  Camera,
  Video,
  FileText,
  FlaskConical,
  CheckCircle2,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Button } from '../../components/ui/Button';

const typeIcons = {
  chat: MessageSquare,
  photo: Camera,
  image: Camera,
  surveillance: Video,
  document: FileText,
  forensic: FlaskConical,
  forensic_report: FlaskConical,
  witness_statement: FileText,
};

const typeColors = {
  chat: 'bg-neoBlue',
  photo: 'bg-neoPurple',
  image: 'bg-neoPurple',
  surveillance: 'bg-neoCoral',
  document: 'bg-neoYellow',
  forensic: 'bg-neoGreen',
  forensic_report: 'bg-neoGreen',
  witness_statement: 'bg-neoYellow',
};

export function EvidenceView() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { currentCase, progress, openEvidence } = useInvestigation();
  const [selectedType, setSelectedType] = useState('all');

  const evidenceList = currentCase?.evidence || [];
  const openedIds = progress?.openedEvidenceIds || [];

  const normalizeType = (t) => {
    if (!t) return 'other';
    const lower = t.toLowerCase();
    if (lower === 'image' || lower === 'photo') return 'photo';
    if (lower === 'forensic' || lower === 'forensic_report') return 'forensic';
    if (lower === 'witness' || lower === 'witness_statement') return 'witness';
    return lower;
  };

  const filteredEvidence = evidenceList.filter((item) => {
    if (selectedType === 'all') return true;
    return normalizeType(item.type) === selectedType;
  });

  const filterTabs = [
    { id: 'all', label: 'ALL', count: evidenceList.length },
    { id: 'chat', label: 'CHAT', count: evidenceList.filter((e) => normalizeType(e.type) === 'chat').length },
    { id: 'photo', label: 'PHOTO', count: evidenceList.filter((e) => normalizeType(e.type) === 'photo').length },
    { id: 'surveillance', label: 'SURVEILLANCE', count: evidenceList.filter((e) => normalizeType(e.type) === 'surveillance').length },
    { id: 'document', label: 'DOCUMENT', count: evidenceList.filter((e) => normalizeType(e.type) === 'document').length },
    { id: 'forensic', label: 'FORENSIC', count: evidenceList.filter((e) => normalizeType(e.type) === 'forensic').length },
  ];

  const handleExamine = (evidenceId) => {
    openEvidence(evidenceId);
    navigate(`/case/${caseId}/evidence/${evidenceId}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neoYellow border-2 border-ink rounded-lg font-mono text-xs font-bold uppercase mb-2 shadow-hard-xs">
          <FolderSearch className="w-3.5 h-3.5 stroke-[2.5]" />
          EVIDENCE VAULT ({openedIds.length}/{evidenceList.length} EXAMINED)
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink uppercase tracking-tight">
          EVIDENCE VAULT & FORENSIC ARTIFACTS
        </h2>
        <p className="font-sans text-sm text-ink/80 mt-1 max-w-2xl">
          Inspect physical artifacts, cryptographic chat exports, CCTV extractions, and scientific lab assays.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-ink pb-4">
        {filterTabs.map((tab) => {
          const isSelected = selectedType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 border-2 border-ink rounded-lg font-mono text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-ink text-white shadow-hard-xs'
                  : 'bg-paper-light text-ink hover:bg-paper'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvidence.map((clue) => {
          const isOpened = openedIds.includes(clue.id);
          const Icon = typeIcons[clue.type] || FileText;
          const badgeBg = typeColors[clue.type] || 'bg-paper-light';

          return (
            <div
              key={clue.id}
              className="bg-paper-light border-3 border-ink rounded-xl p-6 shadow-hard flex flex-col justify-between"
            >
              <div>
                {/* Header with Type & Status */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border-2 border-ink ${badgeBg}`}>
                      <Icon className="w-4 h-4 text-ink stroke-[2.5]" />
                    </div>
                    <span className="font-mono text-xs uppercase font-bold text-ink">
                      {clue.type}
                    </span>
                  </div>

                  {isOpened ? (
                    <span className="font-mono text-[11px] uppercase px-2 py-0.5 bg-neoGreen border border-ink rounded font-bold text-ink flex items-center gap-1 shadow-hard-xs">
                      <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                      EXAMINED
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] uppercase px-2 py-0.5 bg-paper border border-ink rounded font-bold text-ink/70">
                      UNEXAMINED
                    </span>
                  )}
                </div>

                {/* Clue Title */}
                <h3 className="font-display font-extrabold text-xl text-ink uppercase tracking-tight mb-1">
                  {clue.title}
                </h3>

                {/* Source context */}
                <p className="font-mono text-[11px] text-ink/70 uppercase mb-3 line-clamp-1">
                  Source: {clue.sourceContext || clue.source || 'Scene Extraction'}
                </p>

                {/* Summary / Description */}
                <p className="font-sans text-xs text-ink/80 mb-6 line-clamp-3 leading-relaxed">
                  {clue.summary || clue.description}
                </p>
              </div>

              {/* Examine Button */}
              <Button
                variant={isOpened ? 'secondary' : 'primary'}
                size="sm"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => handleExamine(clue.id)}
              >
                <Eye className="w-4 h-4 stroke-[2.5]" />
                EXAMINE CLUE
                <ArrowRight className="w-4 h-4 stroke-[2.5] ml-auto" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
