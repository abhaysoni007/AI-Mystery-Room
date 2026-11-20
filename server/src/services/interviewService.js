import { z } from 'zod';
export { interviewView } from './interviewView.js';

const turnSchema = z.object({
  id: z.string().min(1).max(80),
  question: z.string().min(1).max(400),
  answer: z.string().min(1).max(1800),
  evidenceId: z.string().min(1).max(100).optional(),
  followUpTo: z.string().min(1).max(80).optional(),
}).strict();

export function validateInterviews(caseData) {
  const errors = [];
  const evidence = new Set((Array.isArray(caseData.evidence) ? caseData.evidence : []).map(e => e.id));
  for (const suspect of Array.isArray(caseData.suspects) ? caseData.suspects : []) {
    if (suspect.interview === undefined) continue; // Legacy cases and providers.
    const result = z.array(turnSchema).min(2).max(8).safeParse(suspect.interview);
    if (!result.success) { errors.push(`Suspect ${suspect.id} has an invalid interview script.`); continue; }
    const seen = new Set();
    for (const turn of result.data) {
      if (seen.has(turn.id)) errors.push('Interview question IDs must be unique per suspect.');
      if (turn.evidenceId && !evidence.has(turn.evidenceId)) errors.push('Interview references evidence outside this case.');
      if (turn.followUpTo && !seen.has(turn.followUpTo)) errors.push('Interview follow-up must reference an earlier question.');
      seen.add(turn.id);
    }
  }
  return errors;
}
