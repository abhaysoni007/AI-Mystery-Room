import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SAMPLE_CASE, SAMPLE_CASE_SOLUTIONS } from '../data/sampleCase';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

const InvestigationContext = createContext(null);

export function InvestigationProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth();

  const userStorageKey = user?.id ? `ai_mystery_cases_${user.id}` : 'ai_mystery_cases';

  const [cases, setCases] = useState(() => {
    if (typeof localStorage === 'undefined') return [SAMPLE_CASE];
    const saved = localStorage.getItem(userStorageKey) || localStorage.getItem('ai_mystery_cases');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return [SAMPLE_CASE];
  });

  const [currentCase, setCurrentCase] = useState(SAMPLE_CASE);
  const [isLoadingCases, setIsLoadingCases] = useState(false);

  const [progress, setProgress] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(`ai_mystery_progress_${SAMPLE_CASE.id}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {
      openedEvidenceIds: [],
      notes: '',
      status: 'active',
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };
  });

  const [result, setResult] = useState(null);

  // Sync progress & result to localStorage for current case
  useEffect(() => {
    if (typeof localStorage !== 'undefined' && currentCase?.id) {
      localStorage.setItem(`ai_mystery_progress_${currentCase.id}`, JSON.stringify(progress));
    }
  }, [progress, currentCase?.id]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined' && currentCase?.id && result) {
      localStorage.setItem(`ai_mystery_result_${currentCase.id}`, JSON.stringify(result));
    }
  }, [result, currentCase?.id]);

  // Synchronize authenticated cases from server API when user is logged in
  useEffect(() => {
    let isMounted = true;

    if (user?.id && token) {
      setIsLoadingCases(true);
      api
        .getCases()
        .then((serverCases) => {
          if (!isMounted) return;
          const validList = Array.isArray(serverCases) ? serverCases : [];
          setCases(validList);
          if (validList.length > 0) {
            setCurrentCase((prev) => (prev && validList.some((c) => c.id === prev.id) ? prev : validList[0]));
          } else {
            setCurrentCase(null);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsLoadingCases(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id, token]);

  // Handle logout transition
  const prevUserIdRef = useRef(user?.id);
  useEffect(() => {
    if (prevUserIdRef.current && !user?.id) {
      setCases([]);
      setCurrentCase(null);
      setProgress({ openedEvidenceIds: [], notes: '', status: 'active' });
      setResult(null);
    }
    prevUserIdRef.current = user?.id;
  }, [user?.id]);

  // Persist cases
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    if (user?.id) {
      localStorage.setItem(`ai_mystery_cases_${user.id}`, JSON.stringify(cases));
    }
    localStorage.setItem('ai_mystery_cases', JSON.stringify(cases));
  }, [cases, user?.id]);

  const selectCase = useCallback(
    async (caseId) => {
      if (!caseId) return;

      if (caseId === SAMPLE_CASE.id) {
        setCurrentCase(SAMPLE_CASE);
        if (typeof localStorage !== 'undefined') {
          const savedProgress = localStorage.getItem(`ai_mystery_progress_${SAMPLE_CASE.id}`);
          if (savedProgress) {
            try {
              setProgress(JSON.parse(savedProgress));
            } catch (e) {
              setProgress({ openedEvidenceIds: [], notes: '', status: 'active' });
            }
          }
        }
        return;
      }

      const found = cases.find((c) => c.id === caseId);
      if (found) {
        setCurrentCase(found);
      }

      try {
        const fullCase = await api.getCase(caseId);
        if (fullCase) {
          setCurrentCase(fullCase);
          setCases((prev) => prev.map((c) => (c.id === caseId ? { ...c, ...fullCase } : c)));
        }

        const serverProgress = await api.getProgress(caseId);
        if (serverProgress) {
          setProgress(serverProgress);
        }

        const serverResult = await api.getResult(caseId).catch(() => null);
        if (serverResult) {
          setResult(serverResult);
        }
      } catch (err) {
        console.warn(`Could not load case dossier ${caseId}:`, err.message);
      }
    },
    [cases]
  );

  const openEvidence = useCallback(
    (evidenceId) => {
      setProgress((prev) => {
        if (prev.openedEvidenceIds.includes(evidenceId)) {
          return prev;
        }
        const updated = {
          ...prev,
          openedEvidenceIds: [...prev.openedEvidenceIds, evidenceId],
          lastActivityAt: new Date().toISOString(),
        };
        if (typeof localStorage !== 'undefined' && currentCase?.id) {
          localStorage.setItem(`ai_mystery_progress_${currentCase.id}`, JSON.stringify(updated));
        }
        return updated;
      });

      if (currentCase?.id && currentCase.id !== SAMPLE_CASE.id) {
        api.updateProgress(currentCase.id, { openedEvidenceId: evidenceId }).catch(() => {});
      }
    },
    [currentCase]
  );

  const updateNotes = useCallback(
    (newNotes) => {
      setProgress((prev) => {
        const updated = {
          ...prev,
          notes: newNotes,
          lastActivityAt: new Date().toISOString(),
        };
        if (typeof localStorage !== 'undefined' && currentCase?.id) {
          localStorage.setItem(`ai_mystery_progress_${currentCase.id}`, JSON.stringify(updated));
        }
        return updated;
      });

      if (currentCase?.id && currentCase.id !== SAMPLE_CASE.id) {
        api.updateProgress(currentCase.id, { notes: newNotes }).catch(() => {});
      }
    },
    [currentCase]
  );

  const submitAccusation = useCallback(
    async (suspectId, reasoning = '') => {
      if (!currentCase) return null;

      if (currentCase.id === SAMPLE_CASE.id) {
        const solution = SAMPLE_CASE_SOLUTIONS[currentCase.id] || {
          culpritId: currentCase.suspects[0]?.id,
          culpritName: currentCase.suspects[0]?.name,
          motive: 'Fictional motive.',
          method: 'Fictional method.',
          rationale: 'Fictional deduction.',
          decisiveEvidenceIds: [],
          redHerrings: [],
        };

        const isCorrect = suspectId === solution.culpritId;
        const score = isCorrect ? 100 : 0;
        const accusationResult = {
          caseId: currentCase.id,
          status: 'completed',
          selectedSuspectId: suspectId,
          reasoning,
          isCorrect,
          score,
          culprit: {
            id: solution.culpritId,
            name: solution.culpritName,
          },
          solution: {
            motive: solution.motive,
            method: solution.method,
            rationale: solution.rationale,
            decisiveEvidenceIds: solution.decisiveEvidenceIds,
            redHerrings: solution.redHerrings,
          },
          completedAt: new Date().toISOString(),
        };

        setResult(accusationResult);
        setProgress((prev) => ({
          ...prev,
          status: 'completed',
          completedAt: new Date().toISOString(),
        }));
        setCases((prev) =>
          prev.map((c) => (c.id === currentCase.id ? { ...c, status: 'completed' } : c))
        );
        return accusationResult;
      }

      try {
        await api.submitAccusation(currentCase.id, { suspectId, reasoning });
        const serverResult = await api.getResult(currentCase.id);
        if (serverResult) {
          setResult(serverResult);
          setProgress((prev) => ({
            ...prev,
            status: 'completed',
            completedAt: new Date().toISOString(),
          }));
          setCases((prev) =>
            prev.map((c) => (c.id === currentCase.id ? { ...c, status: 'completed' } : c))
          );
          return serverResult;
        }
      } catch (err) {
        console.error('Failed to submit indictment to server:', err);
        throw err;
      }
    },
    [currentCase]
  );

  const createCase = useCallback(
    async ({ scenario, difficulty = 'medium', category = 'theft', length = 'standard' }) => {
      const createdServerCase = await api.createCase({
        scenario,
        category,
        difficulty,
        length,
      });

      if (!createdServerCase || !createdServerCase.id) {
        throw new Error('Case generation failed: Empty response received from server.');
      }

      setCases((prev) => [createdServerCase, ...prev.filter((c) => c.id !== createdServerCase.id)]);
      setCurrentCase(createdServerCase);
      setProgress({
        openedEvidenceIds: [],
        notes: '',
        status: 'active',
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      });
      setResult(null);

      return createdServerCase;
    },
    []
  );

  const deleteCase = useCallback(
    async (caseId) => {
      setCases((prev) => prev.filter((c) => c.id !== caseId));
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`ai_mystery_progress_${caseId}`);
        localStorage.removeItem(`ai_mystery_result_${caseId}`);
      }

      if (currentCase?.id === caseId) {
        setCurrentCase(null);
      }

      if (caseId !== SAMPLE_CASE.id) {
        try {
          await api.deleteCase(caseId);
        } catch (err) {
          console.warn('Failed to delete case on server:', err.message);
        }
      }
    },
    [currentCase]
  );

  const refreshCases = useCallback(async () => {
    if (!isAuthenticated || !token) return [];
    setIsLoadingCases(true);
    try {
      const serverCases = await api.getCases();
      const valid = Array.isArray(serverCases) ? serverCases : [];
      setCases(valid);
      return valid;
    } finally {
      setIsLoadingCases(false);
    }
  }, [isAuthenticated, token]);

  return (
    <InvestigationContext.Provider
      value={{
        cases,
        currentCase,
        isLoadingCases,
        progress,
        result,
        selectCase,
        openEvidence,
        updateNotes,
        submitAccusation,
        createCase,
        deleteCase,
        refreshCases,
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
}

export function useInvestigation() {
  const context = useContext(InvestigationContext);
  if (!context) {
    throw new Error('useInvestigation must be used within an InvestigationProvider');
  }
  return context;
}
