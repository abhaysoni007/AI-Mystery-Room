import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Pin, LockKeyhole } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { SAMPLE_CASE } from '../../data/sampleCase';
import { interviewView } from '../../../../server/src/services/interviewView';
import * as api from '../../services/api';

export function InterviewView() {
  const { currentCase } = useInvestigation();
  const { suspectId, caseId } = useParams();
  const suspect = currentCase?.suspects?.find(s => s.id === suspectId);
  if (currentCase?.id !== caseId || !currentCase?.suspects) return <p role="status">Loading suspect dossier...</p>;
  if (!suspect) return <p role="alert">Suspect not found in this case. <Link className="underline" to={`/case/${caseId}/suspects`}>Return to suspects</Link></p>;
  return <Interview key={currentCase.id + suspectId} dossier={currentCase} suspect={suspect} />;
}

function Interview({ dossier, suspect }) {
  const { progress } = useInvestigation();
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const openedKey = (progress?.openedEvidenceIds || []).join('|');
  const isSample = dossier.id === SAMPLE_CASE.id;
  const localKey = `ai_mystery_interview_${dossier.id}_${suspect.id}`;
  const base = `/case/${dossier.id}`;

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = isSample ? interviewView(suspect, dossier.evidence, JSON.parse(localStorage.getItem(localKey) || '[]'), progress?.openedEvidenceIds || []) : await api.getInterview(dossier.id, suspect.id);
        if (active) setSession(data);
      } catch { if (active) setError('Could not load this interview. Return to suspects and try again.'); }
    }
    load();
    return () => { active = false; };
  }, [dossier.id, suspect.id, isSample, localKey, openedKey]);

  async function ask(question) {
    setBusy(true); setError(''); setNotice('');
    try {
      if (isSample) {
        const ids = [...new Set([...session.transcript.map(t => t.questionId), question.id])];
        localStorage.setItem(localKey, JSON.stringify(ids));
        setSession(interviewView(suspect, dossier.evidence, ids, progress?.openedEvidenceIds || []));
      } else setSession(await api.askInterview(dossier.id, suspect.id, question.id, question.evidenceId));
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function pin(turn) {
    setBusy(true); setError(''); setNotice('');
    try {
      const key = `ai_mystery_board_${dossier.id}`;
      const saved = isSample ? JSON.parse(localStorage.getItem(key) || 'null') : await api.getProgress(dossier.id);
      const board = saved?.board || { cards: [], connections: [] };
      const text = `${suspect.name} - interview record\nQ: ${turn.question}\nA: ${turn.answer}`.slice(0, 2000);
      const id = crypto.randomUUID();
      if (board.cards.some(c => c.kind === 'theory' && c.text === text)) { setNotice('This statement is already on your board.'); return; }
      if (board.cards.length >= 80) throw new Error('Your board is full. Remove a pin before adding a statement.');
      const updated = { ...board, cards: [...board.cards, {
        id, kind: 'theory', text: `${suspect.name} - interview record
Q: ${turn.question}
A: ${turn.answer}`.slice(0, 2000),
        x: 60 + board.cards.length % 4 * 280, y: 60 + Math.floor(board.cards.length / 4) % 4 * 245,
      }] };
      if (isSample) localStorage.setItem(key, JSON.stringify({ board: updated, boardRevision: (saved?.boardRevision || 0) + 1 }));
      else await api.saveBoard(dossier.id, updated, saved?.boardRevision || 0);
      setNotice('Statement pinned. Open your board to connect it with clues.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6">
    <Link to={`${base}/suspects`} className="inline-flex gap-2 items-center text-xs font-bold"><ArrowLeft size={15}/>Suspect roster</Link>
    <header className="flex gap-4 items-start border-b-2 border-ink/20 pb-6">
      <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-neoGreen border-2 border-ink rounded-xl"><MessageSquare size={25}/></div>
      <div><p className="font-mono text-xs uppercase tracking-widest text-ink/60">Interview room / {suspect.occupation}</p>
      <h2 className="font-display text-3xl font-extrabold mt-1">{suspect.name}</h2>
      <p className="text-sm text-ink/70 mt-2">Ask about their account. Present examined evidence. Decide what holds up.</p></div>
    </header>
    {error && <p role="alert" className="border-2 border-red-700 bg-red-50 p-3 text-sm">{error}</p>}
    {notice && <p role="status" className="border border-ink bg-neoGreen/20 p-3 text-sm">{notice} <Link className="underline font-bold" to={`${base}/board`}>Open board</Link></p>}
    {!session ? <p role="status">{error ? 'Interview unavailable.' : 'Opening interview record...'}</p> : <>
      {session.mode === 'recorded' && <p className="text-xs text-ink/70 bg-paper-light border border-ink/20 rounded-lg p-3">This earlier case has recorded testimony only. New cases can include prepared evidence challenges and follow-up questions.</p>}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
        <section aria-label="Interview transcript" className="space-y-5">
          <div className="bg-paper-light p-5 border-2 border-ink rounded-xl">
            <span className="font-mono text-xs text-ink/60">OPENING STATEMENT</span>
            <p className="text-sm leading-relaxed mt-2">{suspect.publicStatement || suspect.alibiPublicText}</p>
          </div>
          {!session.transcript.length && <p className="text-sm text-ink/60 py-6">The interview is ready. Choose your first question.</p>}
          {session.transcript.map(turn => <article key={turn.questionId} className="border-l-2 border-ink/20 pl-4 space-y-3">
            <div className="bg-ink text-paper p-4 rounded-xl rounded-bl-none"><p className="font-mono text-[10px] mb-1 opacity-60">DETECTIVE</p><p className="text-sm">{turn.question}</p></div>
            <div className="bg-paper-light border border-ink/25 rounded-xl p-4">
              <p className="font-mono text-[10px] text-ink/60 mb-2">{suspect.name}</p><p className="text-sm leading-relaxed whitespace-pre-wrap">{turn.answer}</p>
              <button disabled={busy} onClick={() => pin(turn)} className="inline-flex gap-2 items-center text-xs font-bold mt-4 underline underline-offset-4"><Pin size={13}/>Pin statement to board</button>
            </div>
          </article>)}
        </section>
        <aside className="bg-paper-light rounded-xl border-2 border-ink p-4 xl:sticky xl:top-28">
          <h3 className="font-display text-lg font-bold">Your questions</h3>
          <p className="text-xs text-ink/60 mt-1 mb-4">Test the statement against the evidence.</p>
          <div className="space-y-3">{session.questions.map(question => <div key={question.id} className="border-t border-ink/20 pt-3">
            <button disabled={busy || question.asked || !!question.lockedReason} onClick={() => ask(question)} className="text-left text-sm font-semibold disabled:opacity-50 hover:underline focus-visible:outline-2 focus-visible:outline-ink">
              {question.asked ? 'Asked: ' : question.evidenceId ? 'Present evidence: ' : ''}{question.question}
            </button>
            {question.evidenceId && <Link className="block text-xs underline mt-2" to={`${base}/evidence/${question.evidenceId}`}>Examine {question.evidenceTitle}</Link>}
            {!question.asked && question.lockedReason && <p className="flex gap-1 text-xs text-ink/60 mt-2"><LockKeyhole size={12} className="shrink-0"/>{question.lockedReason}</p>}
          </div>)}</div>
          {session.questions.every(q => q.asked) && <p className="text-xs mt-4 p-3 bg-neoGreen/20">Interview recorded. Compare these answers with your evidence and timeline.</p>}
        </aside>
      </div>
    </>}
  </div>;
}
