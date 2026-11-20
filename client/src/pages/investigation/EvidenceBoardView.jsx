import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Network, Plus, Save, X, GripHorizontal } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import * as api from '../../services/api';
import { SAMPLE_CASE } from '../../data/sampleCase';
import './evidence-board.css';

const emptyBoard = () => ({ cards: [], connections: [] });
const makeId = () => crypto.randomUUID();
const colors = { evidence: '#fffdf6', suspect: '#dce9e4', event: '#e4e8f2', theory: '#f9e8a3' };

export function EvidenceBoardView() {
  const { currentCase } = useInvestigation();
  return currentCase?.evidence ? <Board key={currentCase.id} dossier={currentCase} /> : <p role="status">Loading case board?</p>;
}

function Board({ dossier }) {
  const [board, setBoard] = useState(emptyBoard);
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState('Loading board?');
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');
  const [label, setLabel] = useState('related');
  const [theory, setTheory] = useState('');
  const [query, setQuery] = useState('');
  const drag = useRef(null);
  const viewport = useRef(null);
  const localKey = `ai_mystery_board_${dossier.id}`;
  const isSample = dossier.id === SAMPLE_CASE.id;

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const saved = isSample ? JSON.parse(localStorage.getItem(localKey) || 'null') : await api.getProgress(dossier.id);
        if (!active) return;
        setBoard(saved?.board || emptyBoard());
        setRevision(saved?.boardRevision || 0);
        setReady(true);
        setStatus('All changes saved');
      } catch {
        if (active) { setError('Could not load your board. Reload to try again.'); setStatus('Board unavailable'); }
      }
    }
    load();
    return () => { active = false; };
  }, [dossier.id, isSample, localKey]);

  useEffect(() => {
    const guardLink = event => {
      if (!dirty) return;
      const link = event.target.closest('a[href]');
      if (link && link.getAttribute('href') !== window.location.pathname && !window.confirm('Leave without saving your board changes?')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener('click', guardLink, true);
    return () => document.removeEventListener('click', guardLink, true);
  }, [dirty]);

  useEffect(() => {
    const guard = event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);

  function change(update) {
    if (!ready || saving) return;
    setBoard(previous => typeof update === 'function' ? update(previous) : update);
    setDirty(true); setStatus('Unsaved changes'); setError('');
  }

  async function save() {
    setSaving(true); setError('');
    try {
      const result = isSample ? { revision: revision + 1 } : await api.saveBoard(dossier.id, board, revision);
      if (isSample) localStorage.setItem(localKey, JSON.stringify({ board, boardRevision: result.revision }));
      setRevision(result.revision); setDirty(false); setStatus('All changes saved');
    } catch (err) { setError(err.message || 'Could not save. Please try again.'); }
    finally { setSaving(false); }
  }

  const sources = [
    ...(dossier.evidence || []).map(e => ({ kind: 'evidence', refId: e.id, title: e.title, description: e.description })),
    ...(dossier.suspects || []).map(s => ({ kind: 'suspect', refId: s.id, title: s.name, description: s.alibiPublicText || s.summary })),
    ...(dossier.timeline || []).map(e => ({ kind: 'event', refId: e.id, title: e.timeDescription || 'Timeline event', description: e.description })),
  ];
  const sourceFor = card => sources.find(s => s.kind === card.kind && s.refId === card.refId);
  function add(source) {
    if (board.cards.length >= 80) return;
    change(previous => ({ ...previous, cards: [...previous.cards, {
      id: makeId(), kind: source.kind, refId: source.refId, text: source.text || '',
      x: 48 + (previous.cards.length % 4) * 280, y: 60 + Math.floor(previous.cards.length / 4) % 4 * 245,
    }] }));
  }
  function remove(id) {
    change(previous => ({ cards: previous.cards.filter(c => c.id !== id), connections: previous.connections.filter(c => c.from !== id && c.to !== id) }));
    if (selected === id) setSelected('');
  }
  function connect(id) {
    if (!selected) { setSelected(id); return; }
    if (selected !== id && board.connections.length < 160 && !board.connections.some(c => c.from === selected && c.to === id && c.label === label)) {
      change(previous => ({ ...previous, connections: [...previous.connections, { id: makeId(), from: selected, to: id, label }] }));
    }
    setSelected('');
  }
  function move(id, x, y) {
    change(previous => ({ ...previous, cards: previous.cards.map(c => c.id === id ? { ...c, x: Math.max(0, Math.min(1180, x)), y: Math.max(0, Math.min(1000, y)) } : c) }));
  }

  return <div className="space-y-5">
    <header className="flex flex-wrap justify-between items-end gap-4">
      <div><div className="board-eyebrow"><Network size={15} /> YOUR WORKING THEORY</div>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">Follow the connections.</h2>
        <p className="text-sm text-ink/70 mt-2 max-w-xl">Gather the facts. Challenge an alibi. Build your version of events.</p></div>
      <button className="board-button board-primary" onClick={save} disabled={!ready || !dirty || saving}><Save size={16} />{saving ? 'Saving?' : 'Save board'}</button>
    </header>
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono border-y-2 border-ink/20 py-3">
      <span>{board.cards.length} PINS / {board.connections.length} CONNECTIONS</span>
      <span role="status">{status}</span>
      <span className="text-ink/60">Connections are your deductions.</span>
    </div>
    {error && <p role="alert" className="bg-red-50 border-2 border-red-700 p-3 text-sm">{error}</p>}
    <fieldset disabled={!ready || saving} className="board-workspace">
      <aside className="board-tray">
        <h3 className="font-display text-lg font-bold">Case material</h3>
        <label className="block text-xs mt-3">Find a clue or suspect<input className="board-input mt-1" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search this case?" /></label>
        <div className="board-source-list">
          {sources.filter(s => (s.title + s.description).toLowerCase().includes(query.toLowerCase())).map(source => {
            const pinned = board.cards.some(c => c.kind === source.kind && c.refId === source.refId);
            return <button key={source.kind + source.refId} className="board-source" disabled={pinned || board.cards.length >= 80} onClick={() => add(source)}>
              <span className="board-kind">{source.kind}</span><span className="block font-semibold text-sm">{source.title}</span>
              <span className="text-xs text-ink/60">{pinned ? 'Pinned to board' : '+ Pin to board'}</span>
            </button>;
          })}
        </div>
        <form onSubmit={e => { e.preventDefault(); if (theory.trim()) { add({ kind: 'theory', text: theory.trim() }); setTheory(''); } }} className="border-t-2 border-ink/20 pt-4 mt-4">
          <label className="font-bold text-sm">Add a theory<textarea className="board-input mt-2" maxLength={2000} value={theory} onChange={e => setTheory(e.target.value)} placeholder="What could explain these clues?" rows={3} /></label>
          <button className="board-button w-full mt-2" disabled={!theory.trim() || board.cards.length >= 80}><Plus size={14} />Pin theory</button>
        </form>
      </aside>
      <section className="min-w-0">
        <div className="board-toolbar"><label>Connection <select aria-label="Connection type" value={label} onChange={e => setLabel(e.target.value)} className="bg-transparent font-bold">
          <option value="related">Related</option><option value="supports">Supports</option><option value="contradicts">Contradicts</option>
        </select></label>
        <span>{selected ? 'Choose another card to connect.' : 'Use Connect on any two cards.'}</span>
        {selected && <button onClick={() => setSelected('')}>Cancel</button>}</div>
        <div className="board-scroll" ref={viewport} aria-label="Evidence board canvas" tabIndex={0}>
          <div className="board-canvas">
            <svg className="board-lines" width="1440" height="1240" aria-hidden="true">
              {board.connections.map(connection => {
                const a = board.cards.find(c => c.id === connection.from), b = board.cards.find(c => c.id === connection.to);
                if (!a || !b) return null;
                const ax = a.x + 120, ay = a.y + 70, bx = b.x + 120, by = b.y + 70;
                return <g key={connection.id}><line x1={ax} y1={ay} x2={bx} y2={by} stroke={connection.label === 'contradicts' ? '#a33d32' : '#587467'} strokeWidth="2.5" strokeDasharray={connection.label === 'related' ? '7 5' : undefined} />
                  <rect x={(ax+bx)/2-44} y={(ay+by)/2-12} width="88" height="24" rx="4" fill="#f7f2e7" /><text x={(ax+bx)/2} y={(ay+by)/2+4} textAnchor="middle" fontSize="11" fill="#302e29">{connection.label}</text></g>;
              })}
            </svg>
            {!board.cards.length && <div className="board-empty"><Network size={48} strokeWidth={1} /><h3 className="font-display font-bold text-2xl mt-4">Every theory starts with a clue.</h3><p className="text-sm mt-2">Pin case material from the tray to begin.</p></div>}
            {board.cards.map(card => {
              const source = sourceFor(card);
              return <article key={card.id} className={`board-card ${selected === card.id ? 'board-selected' : ''}`} style={{ transform: `translate(${card.x}px, ${card.y}px)`, background: colors[card.kind] }}>
                <div className="board-card-top">
                  <button className="board-grip" aria-label={`Move ${source?.title || 'theory'}; use arrow keys`}
                    onPointerDown={e => { if (saving) return; e.currentTarget.setPointerCapture(e.pointerId); drag.current = { id: card.id, startX: e.clientX, startY: e.clientY, x: card.x, y: card.y }; }}
                    onPointerMove={e => { const d = drag.current; if (d?.id === card.id) move(card.id, d.x + e.clientX - d.startX, d.y + e.clientY - d.startY); }}
                    onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
                    onKeyDown={e => { const delta = { ArrowLeft: [-20,0], ArrowRight: [20,0], ArrowUp: [0,-20], ArrowDown: [0,20] }[e.key]; if (delta) { e.preventDefault(); move(card.id, card.x + delta[0], card.y + delta[1]); } }}>
                    <GripHorizontal size={16} /><span className="board-kind">{card.kind}</span></button>
                  <button aria-label={`Remove ${source?.title || 'theory'}`} onClick={() => remove(card.id)}><X size={15}/></button>
                </div>
                <h3 className="font-display font-bold text-base leading-tight">{source?.title || 'Working theory'}</h3>
                {card.kind === 'theory' ? <textarea aria-label="Theory text" maxLength={2000} value={card.text} onChange={e => change(p => ({ ...p, cards: p.cards.map(c => c.id === card.id ? { ...c, text: e.target.value } : c) }))} className="board-theory" /> : <p className="board-excerpt">{source?.description}</p>}
                <div className="board-card-actions"><button onClick={() => connect(card.id)}>{selected === card.id ? 'Selected' : 'Connect'}</button>
                {card.kind === 'evidence' && <Link to={`/case/${dossier.id}/evidence/${card.refId}`}>Examine ?</Link>}</div>
              </article>;
            })}
          </div>
        </div>
        <p className="text-xs text-ink/60 mt-2">Scroll to explore. Drag card handles, or focus a handle and use arrow keys. Save before leaving.</p>
      </section>
    </fieldset>
    {!!board.connections.length && <section className="border-t-2 border-ink/20 pt-4"><h3 className="font-bold mb-3">Your connections</h3><div className="flex flex-wrap gap-2">{board.connections.map(c => {
      const name = id => { const card = board.cards.find(item => item.id === id); return sourceFor(card)?.title || card?.text?.slice(0, 35) || 'Theory'; };
      return <div className="board-connection" key={c.id}><span>{name(c.from)} <strong>{c.label}</strong> {name(c.to)}</span><button disabled={saving} aria-label={`Remove connection ${name(c.from)} to ${name(c.to)}`} onClick={() => change(p => ({ ...p, connections: p.connections.filter(item => item.id !== c.id) }))}><X size={14}/></button></div>;
    })}</div></section>}
  </div>;
}
