import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SAMPLE_CASE, SAMPLE_CASE_SOLUTIONS } from '../data/sampleCase';
import * as api from '../services/api';

const InvestigationContext = createContext(null);

export function InvestigationProvider({ children }) {
  const [cases, setCases] = useState(() => {
    const saved = localStorage.getItem('ai_mystery_cases');
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

  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem(`ai_mystery_progress_${SAMPLE_CASE.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
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

  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem(`ai_mystery_result_${SAMPLE_CASE.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return null;
  });

  // Sync case list from backend API on mount
  useEffect(() => {
    let isMounted = true;
    api
      .getCases()
      .then((serverCases) => {
        if (!isMounted || !Array.isArray(serverCases) || serverCases.length === 0) return;
        setCases((prev) => {
          const sampleExists = serverCases.some((c) => c.id === SAMPLE_CASE.id);
          const combined = sampleExists ? serverCases : [SAMPLE_CASE, ...serverCases];
          const seen = new Set();
          return combined.filter((c) => {
            if (seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
          });
        });
      })
      .catch(() => {
        // Silently use local storage cases when offline
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync localStorage
  useEffect(() => {
    localStorage.setItem('ai_mystery_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    if (currentCase) {
      localStorage.setItem(`ai_mystery_progress_${currentCase.id}`, JSON.stringify(progress));
    }
  }, [progress, currentCase]);

  useEffect(() => {
    if (currentCase && result) {
      localStorage.setItem(`ai_mystery_result_${currentCase.id}`, JSON.stringify(result));
    }
  }, [result, currentCase]);

  const selectCase = useCallback((caseId) => {
    const found = cases.find((c) => c.id === caseId) || SAMPLE_CASE;
    setCurrentCase(found);

    const savedProgress = localStorage.getItem(`ai_mystery_progress_${found.id}`);
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (e) {
        setProgress({ openedEvidenceIds: [], notes: '', status: found.status || 'active' });
      }
    } else {
      setProgress({ openedEvidenceIds: [], notes: '', status: found.status || 'active' });
    }

    const savedResult = localStorage.getItem(`ai_mystery_result_${found.id}`);
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (e) {
        setResult(null);
      }
    } else {
      setResult(null);
    }

    // Attempt to load full dossier from API if not a built-in sample
    if (caseId && caseId !== SAMPLE_CASE.id) {
      api
        .getCase(caseId)
        .then((caseDoc) => {
          if (caseDoc) {
            setCurrentCase(caseDoc);
          }
        })
        .catch(() => {});

      api
        .getProgress(caseId)
        .then((serverProgress) => {
          if (serverProgress) {
            setProgress(serverProgress);
          }
        })
        .catch(() => {});

      api
        .getResult(caseId)
        .then((serverResult) => {
          if (serverResult) {
            setResult(serverResult);
          }
        })
        .catch(() => {});
    }
  }, [cases]);

  const openEvidence = useCallback((evidenceId) => {
    setProgress((prev) => {
      if (prev.openedEvidenceIds.includes(evidenceId)) {
        return prev;
      }
      return {
        ...prev,
        openedEvidenceIds: [...prev.openedEvidenceIds, evidenceId],
        lastActivityAt: new Date().toISOString(),
      };
    });

    if (currentCase?.id) {
      api.updateProgress(currentCase.id, { openedEvidenceId: evidenceId }).catch(() => {});
    }
  }, [currentCase]);

  const updateNotes = useCallback((newNotes) => {
    setProgress((prev) => ({
      ...prev,
      notes: newNotes,
      lastActivityAt: new Date().toISOString(),
    }));

    if (currentCase?.id) {
      api.updateProgress(currentCase.id, { notes: newNotes }).catch(() => {});
    }
  }, [currentCase]);

  const submitAccusation = useCallback((suspectId, reasoning = '') => {
    if (!currentCase) return null;

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

    // Sync with backend API
    api
      .submitAccusation(currentCase.id, { suspectId, reasoning })
      .then(() => api.getResult(currentCase.id))
      .then((serverResult) => {
        if (serverResult) {
          setResult(serverResult);
        }
      })
      .catch(() => {});

    return accusationResult;
  }, [currentCase]);

  const createCase = useCallback(({ scenario, difficulty = 'medium', category = 'theft', length = 'standard' }) => {
    const newId = `case_${Date.now()}`;
    const newCase = {
      ...SAMPLE_CASE,
      id: newId,
      title: scenario.length > 35 ? scenario.slice(0, 35) + '...' : scenario,
      category,
      difficulty,
      summary: scenario,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Store a duplicate solution for the generated case
    SAMPLE_CASE_SOLUTIONS[newId] = {
      ...SAMPLE_CASE_SOLUTIONS[SAMPLE_CASE.id],
    };

    setCases((prev) => [newCase, ...prev]);
    selectCase(newId);

    // Call server to generate in the background
    api
      .createCase({ scenario, category, difficulty, length })
      .then((createdServerCase) => {
        if (createdServerCase) {
          setCases((prev) =>
            prev.map((c) => (c.id === newId ? { ...createdServerCase, ...c } : c))
          );
        }
      })
      .catch(() => {});

    return newCase;
  }, [selectCase]);

  const deleteCase = useCallback((caseId) => {
    setCases((prev) => prev.filter((c) => c.id !== caseId));
    localStorage.removeItem(`ai_mystery_progress_${caseId}`);
    localStorage.removeItem(`ai_mystery_result_${caseId}`);
    if (currentCase?.id === caseId) {
      setCurrentCase(SAMPLE_CASE);
    }
    api.deleteCase(caseId).catch(() => {});
  }, [currentCase]);

  return (
    <InvestigationContext.Provider
      value={{
        cases,
        currentCase,
        progress,
        result,
        selectCase,
        openEvidence,
        updateNotes,
        submitAccusation,
        createCase,
        deleteCase,
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
