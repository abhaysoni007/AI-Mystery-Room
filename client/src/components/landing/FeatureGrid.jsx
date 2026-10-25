import React from 'react';
import { Card } from '../ui/Card';
import { MessageSquare, Camera, FileText, CheckCircle2 } from 'lucide-react';

const features = [
  {
    title: 'Extracted Chat Logs',
    description: 'Inspect private messaging conversations with timestamps, delivery markers, and contradictory claims.',
    icon: MessageSquare,
    accent: 'blue',
  },
  {
    title: 'Surveillance Telemetry',
    description: 'Review simulated camera reconstructions and frame observations from the scene of the incident.',
    icon: Camera,
    accent: 'yellow',
  },
  {
    title: 'Forensic Lab Dossiers',
    description: 'Analyze digital keycard access swipes, chemical residue spectroscopy, and sworn witness interviews.',
    icon: FileText,
    accent: 'pink',
  },
  {
    title: 'Deterministic Ground Truth',
    description: 'The culprit is locked before you begin. Victory is determined by real evidence, not generative whims.',
    icon: CheckCircle2,
    accent: 'green',
  },
];

export function FeatureGrid() {
  return (
    <section className="py-16 bg-white border-t-2 border-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="font-mono text-xs font-bold bg-neoPurple text-white px-3 py-1 border-2 border-ink rounded-full uppercase shadow-hard-sm">
              Authentic Forensic Kit
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink mt-3">
              NOT JUST A STORY. A REAL CASE.
            </h2>
          </div>
          <p className="text-sm font-mono text-muted max-w-md mt-4 md:mt-0">
            Every investigation workspace delivers rich artifacts engineered to challenge your deductive reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} accent={item.accent} className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white border-2 border-ink flex items-center justify-center shadow-hard-sm">
                  <Icon className="w-5 h-5 text-ink stroke-[2.5]" />
                </div>
                <h3 className="font-display font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-ink font-medium leading-relaxed">{item.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
