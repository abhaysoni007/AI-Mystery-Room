import { describe, it, expect } from 'vitest';
import { validateInterviews, interviewView } from '../src/services/interviewService.js';
const suspect = { id: 's1', alibiPublicText: 'I stayed upstairs.', interview: [
  { id: 'q1', question: 'Where were you?', answer: 'I stayed upstairs.' },
  { id: 'q2', question: 'Explain the door log.', answer: 'My badge was in my jacket.', evidenceId: 'e1', followUpTo: 'q1' },
] };
describe('Case-bound interviews', () => {
  it('withholds unasked answers and gates challenges by evidence and earlier questions', () => {
    let view = interviewView(suspect, [{ id: 'e1', title: 'Door log' }]);
    expect(JSON.stringify(view)).not.toContain('My badge was');
    expect(view.questions[1].lockedReason).toContain('earlier');
    view = interviewView(suspect, [{ id: 'e1' }], ['q1']);
    expect(view.questions[1].lockedReason).toContain('Examine');
    view = interviewView(suspect, [{ id: 'e1' }], ['q1', 'q2'], ['e1']);
    expect(view.transcript[1].answer).toBe('My badge was in my jacket.');
  });
  it('rejects cross-case evidence and circular follow-ups', () => {
    expect(validateInterviews({ suspects: [suspect], evidence: [{ id: 'foreign' }] })).not.toHaveLength(0);
    expect(validateInterviews({ suspects: [{ ...suspect, interview: [{ ...suspect.interview[0], followUpTo: 'q2' }, suspect.interview[1]] }], evidence: [{ id: 'e1' }] })).not.toHaveLength(0);
  });
  it('uses only recorded facts for legacy cases', () => {
    const view = interviewView({ ...suspect, interview: undefined }, [], ['recorded-alibi']);
    expect(view.mode).toBe('recorded');
    expect(view.transcript[0].answer).toBe(suspect.alibiPublicText);
  });
});
