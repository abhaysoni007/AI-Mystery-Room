import React, { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Network, MessageSquare, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FEATURE_GUIDES, FEATURE_RELEASE } from '../../data/featureGuides';
import { useDialogFocus } from './useDialogFocus';

export function FeatureUpdates() {
  const { user, isWalkthroughOpen, openWalkthrough } = useAuth();
  const location = useLocation();
  const [dismissed, setDismissed] = useState('');
  const ref = useRef(null);
  const key = user?.id ? `mysterio_updates_${user.id}_${FEATURE_RELEASE}` : '';
  let seen = false;
  try { seen = key && localStorage.getItem(key) === 'seen'; } catch { /* Browser storage may be disabled. */ }
  const eligiblePage = location.pathname === '/dashboard' || location.pathname.startsWith('/case/');
  const visible = !!key && eligiblePage && !isWalkthroughOpen && dismissed !== key && !seen;
  function dismiss() {
    try { localStorage.setItem(key, 'seen'); } catch { /* Keep the dismissal for this session. */ }
    setDismissed(key);
  }
  useDialogFocus(visible, ref, dismiss);
  if (!visible) return null;
  return <div className="fixed inset-0 z-[60] bg-ink/55 backdrop-blur-md flex items-center justify-center p-4">
    <section ref={ref} role="dialog" aria-modal="true" aria-labelledby="updates-title" className="relative bg-paper border-2 border-ink rounded-2xl shadow-hard-lg max-w-3xl w-full max-h-[90dvh] overflow-y-auto p-5 sm:p-8">
      <div className="flex justify-between items-start gap-4 mb-6">
        <div><p className="font-mono text-xs uppercase tracking-widest text-ink/60">New tools for your next lead</p><h2 id="updates-title" className="font-display font-extrabold text-3xl mt-2">Your investigation just expanded.</h2></div>
        <button onClick={dismiss} aria-label="Close feature updates" className="p-2 border-2 border-ink rounded-lg shrink-0 hover:bg-neoYellow"><X size={18}/></button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">{FEATURE_GUIDES.map((feature, index) => {
        const Icon = index === 0 ? Network : MessageSquare;
        return <article key={feature.title} className="bg-paper-light border-2 border-ink rounded-xl p-5">
          <div className={`inline-flex p-3 border-2 border-ink rounded-lg ${feature.iconBg}`}><Icon size={23}/></div>
          <span className="block font-mono text-[10px] uppercase mt-4 mb-2">New feature</span>
          <h3 className="font-display font-extrabold text-xl">{feature.title}</h3>
          <p className="text-sm text-ink/70 mt-2 mb-4">{feature.description}</p>
          <ol className="space-y-3 list-decimal pl-4 text-xs leading-relaxed">{feature.highlights.map(step => <li key={step}>{step}</li>)}</ol>
        </article>;
      })}</div>
      <footer className="mt-6 flex flex-wrap gap-3 justify-between items-center">
        <button onClick={() => { dismiss(); openWalkthrough(); }} className="inline-flex gap-2 items-center text-sm font-bold underline"><BookOpen size={16}/>Open user manual</button>
        <button onClick={dismiss} className="border-2 border-ink rounded-lg bg-neoYellow px-5 py-3 text-sm font-bold shadow-hard-xs">Got it, back to the case</button>
      </footer>
      <p className="text-xs text-ink/60 mt-4">Find these instructions anytime in User manual, marked New feature.</p>
    </section>
  </div>;
}
