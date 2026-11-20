import { z } from 'zod';

export const boardSchema = z.object({
  cards: z.array(z.object({
    id: z.string().min(1).max(100),
    kind: z.enum(['evidence', 'suspect', 'event', 'theory']),
    refId: z.string().max(100).optional(),
    text: z.string().max(2000).default(''),
    x: z.number().finite().min(0).max(1180),
    y: z.number().finite().min(0).max(1000),
  }).strict()).max(80),
  connections: z.array(z.object({
    id: z.string().min(1).max(100),
    from: z.string().max(100),
    to: z.string().max(100),
    label: z.enum(['related', 'supports', 'contradicts']),
  }).strict()).max(160),
}).strict();

export function validateBoard(input, caseDoc) {
  const parsed = boardSchema.safeParse(input);
  if (!parsed.success) return false;
  const { cards, connections } = parsed.data;
  const ids = new Set(cards.map(c => c.id));
  if (ids.size !== cards.length || new Set(connections.map(c => c.id)).size !== connections.length) return false;
  const collections = { evidence: caseDoc.evidence, suspect: caseDoc.suspects, event: caseDoc.timeline };
  if (cards.some(c => c.kind !== 'theory' && !collections[c.kind]?.some(item => item.id === c.refId))) return false;
  if (connections.some(c => c.from === c.to || !ids.has(c.from) || !ids.has(c.to))) return false;
  return parsed.data;
}
