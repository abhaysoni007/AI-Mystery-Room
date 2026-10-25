import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderArchive, Plus, CheckCircle2, Clock, Award, Compass, Search } from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';
import { useAuth } from '../context/AuthContext';
import { CaseCard } from '../components/dashboard/CaseCard';
import { DeleteCaseModal } from '../components/dashboard/DeleteCaseModal';
import { Button } from '../components/ui/Button';

export function DashboardPage() {
  const navigate = useNavigate();
  const { cases, selectCase, deleteCase } = useInvestigation();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [caseToDelete, setCaseToDelete] = useState(null);

  const totalCases = cases.length;
  const activeCasesCount = cases.filter((c) => c.status !== 'completed').length;
  const solvedCasesCount = cases.filter((c) => c.status === 'completed').length;
  const successRate = totalCases > 0 ? Math.round((solvedCasesCount / totalCases) * 100) : 0;

  const filteredCases = cases.filter((c) => {
    if (activeFilter === 'active') return c.status !== 'completed';
    if (activeFilter === 'completed') return c.status === 'completed';
    return true;
  });

  const handleDeleteConfirm = () => {
    if (caseToDelete) {
      deleteCase(caseToDelete.id);
      setCaseToDelete(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-3 border-ink pb-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-neoYellow border-2 border-ink rounded-lg font-mono text-xs font-bold uppercase shadow-hard-xs">
                <FolderArchive className="w-4 h-4 stroke-[2.5]" />
                CENTRAL ARCHIVES
              </div>
              {user?.name && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-paper-light border-2 border-ink rounded-lg font-mono text-xs font-bold text-ink shadow-hard-xs">
                  <span>DETECTIVE:</span>
                  <span className="text-neoPurple font-extrabold">{user.name.toUpperCase()}</span>
                </div>
              )}
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight uppercase">
              CASE ARCHIVE & ACTIVE DOSSIERS
            </h1>
            <p className="font-sans text-sm sm:text-base text-ink/80 mt-2 max-w-2xl">
              Inspect ongoing forensic investigations, review closed crime dossiers, or initiate a brand new AI-generated mystery room.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            NEW INVESTIGATION
          </Button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-paper-light border-3 border-ink rounded-xl p-5 shadow-hard">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-ink/70 uppercase">TOTAL DOSSIERS</span>
              <FolderArchive className="w-5 h-5 text-neoPurple stroke-[2.5]" />
            </div>
            <div className="font-display font-extrabold text-3xl text-ink">{totalCases}</div>
          </div>

          <div className="bg-paper-light border-3 border-ink rounded-xl p-5 shadow-hard">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-ink/70 uppercase">ACTIVE CASES</span>
              <Clock className="w-5 h-5 text-neoYellow stroke-[2.5]" />
            </div>
            <div className="font-display font-extrabold text-3xl text-ink">{activeCasesCount}</div>
          </div>

          <div className="bg-paper-light border-3 border-ink rounded-xl p-5 shadow-hard">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-ink/70 uppercase">SOLVED CASES</span>
              <CheckCircle2 className="w-5 h-5 text-neoGreen stroke-[2.5]" />
            </div>
            <div className="font-display font-extrabold text-3xl text-ink">{solvedCasesCount}</div>
          </div>

          <div className="bg-paper-light border-3 border-ink rounded-xl p-5 shadow-hard">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-ink/70 uppercase">SUCCESS RATE</span>
              <Award className="w-5 h-5 text-neoBlue stroke-[2.5]" />
            </div>
            <div className="font-display font-extrabold text-3xl text-ink">{successRate}%</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 border-b-2 border-ink pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {[
              { id: 'all', label: 'ALL', count: totalCases },
              { id: 'active', label: 'ACTIVE', count: activeCasesCount },
              { id: 'completed', label: 'COMPLETED', count: solvedCasesCount },
            ].map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-4 py-2 border-2 border-ink rounded-lg font-mono text-xs sm:text-sm font-bold transition-all ${
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
        </div>

        {/* Case List or Empty State */}
        {filteredCases.length === 0 ? (
          <div className="bg-paper-light border-3 border-ink rounded-xl p-12 text-center shadow-hard max-w-xl mx-auto my-12">
            <div className="w-16 h-16 bg-neoYellow border-3 border-ink rounded-xl flex items-center justify-center mx-auto mb-4 shadow-hard-sm">
              <Search className="w-8 h-8 text-ink stroke-[2.5]" />
            </div>
            <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink mb-2">
              NO CASES FOUND
            </h3>
            <p className="font-sans text-sm text-ink/80 mb-6">
              There are currently no cases matching the selected filter criteria. Launch a new mystery scenario to begin investigating.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/create')}
              className="inline-flex items-center gap-2"
            >
              <Compass className="w-4 h-4 stroke-[2.5]" />
              START NEW CASE
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((caseItem) => (
              <CaseCard
                key={caseItem.id}
                caseData={caseItem}
                onSelect={(id) => selectCase(id)}
                onDelete={(c) => setCaseToDelete(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteCaseModal
        isOpen={Boolean(caseToDelete)}
        caseTitle={caseToDelete?.title || ''}
        onClose={() => setCaseToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
