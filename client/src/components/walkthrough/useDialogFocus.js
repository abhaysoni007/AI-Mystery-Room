import { useEffect, useRef } from 'react';

export function useDialogFocus(active, ref, close) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!active || !ref.current) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const elements = () => [...ref.current.querySelectorAll('button:not([disabled]), a[href], input, select, textarea, [tabindex="0"]')];
    elements()[0]?.focus();
    function handle(event) {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key === 'Tab') {
        const items = elements(), first = items[0], last = items[items.length - 1];
        if (event.shiftKey && (document.activeElement === first || !ref.current.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !ref.current.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener('keydown', handle);
    return () => { document.removeEventListener('keydown', handle); document.body.style.overflow = overflow; previous?.focus?.(); };
  }, [active, ref]);
}
