import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  FolderArchive,
  Sparkles,
  Search,
  Eye,
  Scale,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const TOUR_STEPS = [
  {
    stepNumber: 1,
    title: 'CENTRAL COMMAND & CASE ARCHIVE',
    subtitle: 'Investigation Dashboard & Case Registry',
    badge: 'COMMAND CENTER',
    badgeColor: 'bg-neoYellow text-ink',
    icon: FolderArchive,
    iconBg: 'bg-neoYellow',
    description:
      'Your central registry for tracking open investigations, examined evidence ratios, and past case verdicts. Filter by active vs completed cases and launch new investigations seamlessly.',
    highlights: [
      'Track live investigation progress pills (e.g. 4/7 Evidence Examined)',
      'Quickly resume active cases or review archived indictment verdicts',
      'Manage and delete cases permanently from local and cloud storage',
    ],
  },
  {
    stepNumber: 2,
    title: 'AI MYSTERY GENERATION ENGINE',
    subtitle: 'Dynamic Crime Scenario Synthesis',
    badge: 'MYSTERY CREATOR',
    badgeColor: 'bg-neoPurple text-white',
    icon: Sparkles,
    iconBg: 'bg-neoPurple text-white',
    description:
      'Synthesize full-scale, fair-play detective mysteries from any scenario. Choose crime categories like Theft, Murder, Cybercrime, or Espionage and calibrate your difficulty tier.',
    highlights: [
      'Custom premise inputs transformed into rich forensic evidence catalogs',
      'Strict detective fiction rules: guaranteed solvable with zero generative stalls',
      'Pre-calibrated suspect motives, alibis, and deceptive red herrings',
    ],
  },
  {
    stepNumber: 3,
    title: 'THE DETECTIVE WORKSPACE',
    subtitle: '5 Core Intelligence Dossier Tabs',
    badge: 'WORKSPACE',
    badgeColor: 'bg-neoBlue text-white',
    icon: Search,
    iconBg: 'bg-neoBlue text-white',
    description:
      'Dive into your active dossier organized into 5 dedicated workspace tabs: Incident Brief, Suspect Rosters, Evidence Locker, Master Timeline, and Detective Notepad.',
    highlights: [
      'Cross-examine suspect public statements and conflicting alibis',
      'Reconstruct chronological sequences of events leading up to the incident',
      'Auto-saving investigator notes synchronized in real time across sessions',
    ],
  },
  {
    stepNumber: 4,
    title: 'FORENSIC EVIDENCE ANALYSIS',
    subtitle: 'Multi-Format Forensic Artifacts',
    badge: 'EVIDENCE VIEWERS',
    badgeColor: 'bg-neoPink text-ink',
    icon: Eye,
    iconBg: 'bg-neoPink',
    description:
      'Inspect authentic, multi-format evidence items with purpose-built viewers: encrypted Matrix chat logs, CCTV optical freeze frames, and badge telemetry access logs.',
    highlights: [
      'Examine timestamped chat message dumps between key suspects',
      'Inspect surveillance camera freeze frames with forensic sensor logs',
      'Discover decisive evidence that directly refutes false alibis',
    ],
  },
  {
    stepNumber: 5,
    title: 'THE FINAL ACCUSATION & VERDICT',
    subtitle: 'Server-Authoritative Indictment',
    badge: 'FINAL VERDICT',
    badgeColor: 'bg-neoGreen text-ink',
    icon: Scale,
    iconBg: 'bg-neoGreen',
    description:
      'When your investigation is complete, seal your final verdict. Select the primary perpetrator and submit your indictment to trigger server-authoritative scoring.',
    highlights: [
      'Deterministic server-side grading: 100% score for identifying the true culprit',
      'Instant canonical solution reveal: true motive, method, and decisive clues',
      'Detailed breakdown of cleared suspects and debunked red herrings',
    ],
  },
];

export function PlatformWalkthrough() {
  const { isWalkthroughOpen, closeWalkthrough, completeWalkthrough } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isWalkthroughOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      completeWalkthrough();
      setCurrentStepIndex(0);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    completeWalkthrough();
    setCurrentStepIndex(0);
  };

  const IconComponent = currentStep.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/65 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-paper border-3 border-ink shadow-hard-lg rounded-xl max-w-2xl w-full p-6 sm:p-8 relative space-y-6">
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b-2 border-ink pb-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-paper-light border-2 border-ink rounded shadow-hard-xs text-ink uppercase">
              STEP {currentStep.stepNumber} OF {TOUR_STEPS.length}
            </span>
            <span
              className={`font-mono text-xs font-bold px-2.5 py-1 border-2 border-ink rounded shadow-hard-xs uppercase ${currentStep.badgeColor}`}
            >
              {currentStep.badge}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold text-ink bg-paper-light hover:bg-neoPink border-2 border-ink rounded-lg shadow-hard-xs transition-colors"
          >
            <span>SKIP TOUR</span>
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-xl border-3 border-ink flex items-center justify-center shadow-hard-sm shrink-0 ${currentStep.iconBg}`}
            >
              <IconComponent className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-ink leading-tight">
                {currentStep.title}
              </h2>
              <p className="font-mono text-xs font-bold text-muted uppercase mt-0.5">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          <p className="font-sans text-sm text-ink/90 leading-relaxed pt-1">
            {currentStep.description}
          </p>

          {/* Highlights checklist */}
          <div className="space-y-2 pt-2">
            {currentStep.highlights.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 bg-paper-light border-2 border-ink rounded-lg shadow-hard-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-ink shrink-0 stroke-[2.5] mt-0.5" />
                <span className="font-sans text-xs font-medium text-ink">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Progress Bar Dots */}
        <div className="flex items-center gap-2 pt-2">
          {TOUR_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 flex-1 rounded-full border border-ink transition-all duration-200 ${
                idx === currentStepIndex
                  ? 'bg-neoYellow'
                  : idx < currentStepIndex
                  ? 'bg-ink'
                  : 'bg-paper-light'
              }`}
            />
          ))}
        </div>

        {/* Action Controls Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t-2 border-ink">
          <button
            type="button"
            onClick={handleSkip}
            className="font-mono text-xs font-bold text-muted hover:text-ink underline order-2 sm:order-1"
          >
            Skip Walkthrough
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isFirst}
              onClick={handlePrev}
              className="flex-1 sm:flex-none"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              PREVIOUS
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNext}
              className="flex-1 sm:flex-none font-extrabold"
            >
              {isLast ? (
                <>
                  <Compass className="w-4 h-4 mr-2 stroke-[2.5]" />
                  START INVESTIGATING
                </>
              ) : (
                <>
                  NEXT FEATURE
                  <ArrowRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
