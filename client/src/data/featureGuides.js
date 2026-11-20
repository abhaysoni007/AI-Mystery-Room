export const FEATURE_RELEASE = 'interviews-and-board-v1';
export const FEATURE_GUIDES = [
  {
    title: 'THE EVIDENCE BOARD', subtitle: 'Make your reasoning visible',
    badge: 'DEDUCTION WORKSPACE', badgeColor: 'bg-neoYellow text-ink', iconBg: 'bg-neoYellow',
    description: 'A dedicated workspace for connecting this case\'s clues, suspects, events, and your own theories.',
    highlights: [
      'Open Board from the investigation menu. Find a clue or suspect in Case material and choose Pin to board.',
      'Move pins by dragging their handles, or focus a handle and use arrow keys. Choose Connect on two pins to link them as related, supports, or contradicts.',
      'Write and revise theory notes. Use Save board before leaving; connections represent your deductions and do not confirm guilt.',
    ],
    isNew: true,
  },
  {
    title: 'SUSPECT INTERVIEWS', subtitle: 'Test the story against the facts',
    badge: 'INTERVIEW ROOM', badgeColor: 'bg-neoGreen text-ink', iconBg: 'bg-neoGreen',
    description: 'Interview one suspect at a time in a separate room, with questions prepared for that case.',
    highlights: [
      'Open Suspects, inspect a dossier, then choose Interview suspect. Start with the available questions.',
      'Examine the linked evidence before presenting it. Earlier questions unlock follow-ups; answers are recorded when you ask.',
      'Pin an answer to your evidence board and compare it with the timeline. Earlier cases may offer recorded testimony only.',
    ],
    isNew: true,
  },
];
