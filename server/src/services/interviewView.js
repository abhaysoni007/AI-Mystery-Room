// Legacy cases can only repeat recorded facts; they never gain invented testimony.
export function recordedInterview(suspect) {
  return [
    { id: 'recorded-alibi', question: 'State your whereabouts during the incident.', answer: suspect.alibiPublicText || suspect.publicStatement || 'No alibi was recorded.' },
    { id: 'recorded-background', question: 'What is your connection to this case?', answer: suspect.background || suspect.summary || 'No background was recorded.' },
  ];
}

export function interviewView(suspect, evidence, askedIds = [], openedIds = []) {
  const script = suspect.interview?.length ? suspect.interview : recordedInterview(suspect);
  return {
    mode: suspect.interview?.length ? 'prepared' : 'recorded',
    questions: script.map(({ id, question, evidenceId, followUpTo }) => ({
      id, question, evidenceId: evidenceId || null,
      evidenceTitle: evidence.find(e => e.id === evidenceId)?.title || null,
      asked: askedIds.includes(id),
      lockedReason: followUpTo && !askedIds.includes(followUpTo)
        ? 'Ask the earlier question first.'
        : evidenceId && !openedIds.includes(evidenceId) ? 'Examine this evidence before presenting it.' : null,
    })),
    transcript: askedIds.flatMap(id => {
      const turn = script.find(q => q.id === id);
      return turn ? [{ questionId: turn.id, question: turn.question, answer: turn.answer, evidenceId: turn.evidenceId || null }] : [];
    }),
  };
}
