import { describe, it, expect } from 'vitest';
import { validateBoard } from '../src/services/boardValidator.js';
const dossier = { evidence: [{ id: 'e1' }], suspects: [], timeline: [] };
const card = { id: 'pin1', kind: 'evidence', refId: 'e1', x: 0, y: 100 };
describe('Board validation', () => {
  it('accepts case material and user theories', () => {
    expect(validateBoard({ cards: [card, { id: 't1', kind: 'theory', text: '<script>text only</script>', x: 20, y: 40 }], connections: [{ id: 'c1', from: 'pin1', to: 't1', label: 'supports' }] }, dossier)).toBeTruthy();
  });
  it('rejects references from another case', () => {
    expect(validateBoard({ cards: [{ ...card, refId: 'foreign' }], connections: [] }, dossier)).toBe(false);
  });
  it('rejects duplicates, invalid positions, dangling edges and excess text', () => {
    for (const cards of [[card, card], [{ ...card, x: -1 }], [{ ...card, text: 'x'.repeat(2001) }]]) {
      expect(validateBoard({ cards, connections: [] }, dossier)).toBe(false);
    }
    expect(validateBoard({ cards: [card], connections: [{ id: 'edge', from: 'pin1', to: 'missing', label: 'related' }] }, dossier)).toBe(false);
  });
});
