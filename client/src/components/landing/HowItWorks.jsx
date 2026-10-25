import React from 'react';
import { Card } from '../ui/Card';
import { PenTool, Search, Award } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Input Any Premise',
    description: 'Provide a creative scenario or select from categories like art heist, cybercrime, or corporate espionage.',
    icon: PenTool,
    accent: 'yellow',
  },
  {
    number: '02',
    title: 'Examine Interconnected Evidence',
    description: 'Inspect extracted chat messages, forensic residue reports, keycard logs, and surveillance telemetry.',
    icon: Search,
    accent: 'blue',
  },
  {
    number: '03',
    title: 'Deliver the Verdict',
    description: 'Confront suspects, cite decisive clues, and submit your final accusation for a full evidence-based reveal.',
    icon: Award,
    accent: 'purple',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 border-t-2 border-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs font-bold bg-neoYellow px-3 py-1 border-2 border-ink rounded-full uppercase shadow-hard-sm">
            Investigative Protocol
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink mt-3">
            HOW THE CASE UNFOLDS
          </h2>
          <p className="text-base text-ink font-medium mt-2">
            The culprit is predetermined before you arrive. Every contradiction is an intentional clue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.number} accent="white" className="relative pt-10">
                <div className="absolute -top-5 left-6 w-12 h-12 bg-ink text-white font-mono font-extrabold text-lg flex items-center justify-center border-2 border-ink rounded-lg shadow-hard-sm">
                  {step.number}
                </div>
                <div className="w-12 h-12 rounded-lg border-2 border-ink mb-4 flex items-center justify-center bg-paper shadow-hard-sm">
                  <Icon className="w-6 h-6 text-ink stroke-[2.5]" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-sm text-muted font-medium">{step.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
