import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Sparkles, Compass, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';

const EXAMPLE_PROMPTS = [
  'A museum curator disappears on the night a rare painting is moved from the vault during a scheduled gala blackout.',
  'An AI startup chief scientist is found locked in a cryo-chamber minutes before the company IPO pitch.',
  'A luxury sleeper train arrives at the final alpine station with all passengers asleep and the emerald safe emptied.',
  'A high-profile cybersecurity firm suffers an internal data wipe while the entire board is dining in the penthouse.',
];

const CATEGORIES = [
  { id: 'theft', name: 'Art & Asset Theft' },
  { id: 'murder', name: 'Fictional Homicide' },
  { id: 'disappearance', name: 'Vanishing & Disappearance' },
  { id: 'corporate', name: 'Corporate Espionage' },
  { id: 'cybercrime', name: 'Cyber Intrusion & Heist' },
  { id: 'general', name: 'General Whodunnit' },
];

const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', suspects: '3 Suspects', description: 'Clear clues & direct timelines' },
  { id: 'medium', name: 'Medium', suspects: '4 Suspects', description: 'Conflicting alibis & 2 contradictions' },
  { id: 'hard', name: 'Hard', suspects: '5 Suspects', description: 'Complex red herrings & subtle forensics' },
];

const LENGTHS = [
  { id: 'short', name: 'Short', time: '10-15 min' },
  { id: 'standard', name: 'Standard', time: '20-30 min' },
  { id: 'extended', name: 'Extended', time: '40+ min' },
];

export function CreateMysteryPage() {
  const navigate = useNavigate();
  const { createCase } = useInvestigation();

  const [scenario, setScenario] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [category, setCategory] = useState('theft');
  const [length, setLength] = useState('standard');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');

  const handlePromptSelect = (text) => {
    setScenario(text);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!scenario.trim()) {
      setError('Please provide a scenario prompt.');
      return;
    }

    if (scenario.trim().length < 20) {
      setError('Scenario description must be at least 20 characters long.');
      return;
    }

    if (scenario.length > 2000) {
      setError('Scenario cannot exceed 2,000 characters.');
      return;
    }

    setError('');
    setIsGenerating(true);
    setGenerationStage('Establishing canonical culprit and motive...');

    setTimeout(() => {
      setGenerationStage('Generating suspect alibis and witness transcripts...');
    }, 1000);

    setTimeout(() => {
      setGenerationStage('Fabricating digital access logs and forensic chemistry swabs...');
    }, 2000);

    setTimeout(() => {
      const newCase = createCase({
        scenario: scenario.trim(),
        difficulty,
        category,
        length,
      });
      setIsGenerating(false);
      navigate(`/case/${newCase.id}`);
    }, 3000);
  };

  if (isGenerating) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <Card accent="yellow" className="max-w-xl w-full text-center py-12 px-8 border-3 shadow-hard-lg space-y-6">
          <div className="w-16 h-16 mx-auto bg-white border-3 border-ink rounded-xl flex items-center justify-center shadow-hard-md animate-pulse">
            <Loader2 className="w-8 h-8 text-ink animate-spin stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs font-bold bg-neoPurple text-white px-3 py-1 border border-ink rounded-full uppercase">
              GENERATION PIPELINE ACTIVE
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink">
              SYNTHESIZING MYSTERY
            </h2>
            <p className="font-mono text-sm font-semibold text-ink h-6">
              {generationStage}
            </p>
          </div>

          <div className="w-full bg-white border-2 border-ink rounded-full h-4 overflow-hidden shadow-hard-sm">
            <div className="bg-ink h-full animate-[pulse_1.5s_ease-in-out_infinite] w-3/4"></div>
          </div>

          <p className="text-xs font-mono text-muted">
            The canonical solution is locked on the server before the investigation room is prepared.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 space-y-2">
        <span className="font-mono text-xs font-bold bg-neoYellow px-3 py-1 border-2 border-ink rounded-full uppercase shadow-hard-sm">
          Case Generator
        </span>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-ink">
          BUILD A NEW INVESTIGATION
        </h1>
        <p className="text-lg text-ink font-medium max-w-2xl">
          Enter any fictional premise, crime scenario, or mystery premise. The platform constructs a full case dossier with interlocking evidence.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Scenario Input Card */}
        <Card accent="white" className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="scenario" className="font-display font-bold text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neoPurple stroke-[2.5]" />
              Scenario Premise
            </label>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 border rounded ${
                scenario.length > 2000
                  ? 'bg-dangerBg text-danger border-danger'
                  : 'bg-paper text-ink border-ink'
              }`}
            >
              {scenario.length} / 2,000 chars
            </span>
          </div>

          <textarea
            id="scenario"
            rows={5}
            value={scenario}
            onChange={(e) => {
              setScenario(e.target.value);
              if (error) setError('');
            }}
            placeholder="Describe the incident, location, suspected crime, or fictional setup in your own words..."
            className="w-full p-4 border-2 border-ink rounded-lg bg-paper font-sans text-base text-ink focus:outline-none focus:ring-4 focus:ring-neoYellow transition-all resize-y shadow-inner"
          />

          {error && (
            <div className="flex items-center gap-2 text-danger font-mono text-xs font-bold bg-dangerBg p-3 border-2 border-danger rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick-Pick Examples */}
          <div className="space-y-2 pt-2">
            <span className="font-mono text-xs font-bold text-muted uppercase">
              Or pick an investigative seed:
            </span>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((promptText, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handlePromptSelect(promptText)}
                  className="text-left font-mono text-xs bg-paper border border-ink rounded-lg px-3 py-1.5 hover:bg-neoYellow transition-colors shadow-hard-sm"
                >
                  &ldquo;{promptText.slice(0, 50)}...&rdquo;
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Configuration Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Difficulty */}
          <Card accent="paper" className="space-y-3">
            <h3 className="font-display font-bold text-lg">Difficulty</h3>
            <div className="space-y-2">
              {DIFFICULTIES.map((diff) => (
                <label
                  key={diff.id}
                  className={`flex items-start gap-3 p-3 border-2 border-ink rounded-lg cursor-pointer transition-all ${
                    difficulty === diff.id ? 'bg-neoYellow shadow-hard-sm font-bold' : 'bg-white hover:bg-paper'
                  }`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={diff.id}
                    checked={difficulty === diff.id}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="mt-1 accent-ink"
                  />
                  <div>
                    <div className="font-display text-sm">{diff.name} ({diff.suspects})</div>
                    <div className="text-xs font-mono text-muted">{diff.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Category */}
          <Card accent="paper" className="space-y-3">
            <h3 className="font-display font-bold text-lg">Genre Category</h3>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex items-center gap-3 p-2.5 border-2 border-ink rounded-lg cursor-pointer transition-all ${
                    category === cat.id ? 'bg-neoBlue shadow-hard-sm font-bold' : 'bg-white hover:bg-paper'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.id}
                    checked={category === cat.id}
                    onChange={(e) => setCategory(e.target.value)}
                    className="accent-ink"
                  />
                  <span className="font-display text-sm">{cat.name}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Investigation Length */}
          <Card accent="paper" className="space-y-3">
            <h3 className="font-display font-bold text-lg">Case Depth</h3>
            <div className="space-y-2">
              {LENGTHS.map((len) => (
                <label
                  key={len.id}
                  className={`flex items-center justify-between p-3 border-2 border-ink rounded-lg cursor-pointer transition-all ${
                    length === len.id ? 'bg-neoPink shadow-hard-sm font-bold' : 'bg-white hover:bg-paper'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="length"
                      value={len.id}
                      checked={length === len.id}
                      onChange={(e) => setLength(e.target.value)}
                      className="accent-ink"
                    />
                    <span className="font-display text-sm">{len.name}</span>
                  </div>
                  <span className="font-mono text-xs">{len.time}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border-2 border-ink rounded-xl shadow-hard-md">
          <div className="text-sm font-mono text-muted text-center sm:text-left">
            Dossier will be initialized with a guaranteed solvable culprit and timestamped clues.
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto px-8">
            <Compass className="w-5 h-5 mr-2 stroke-[2.5]" />
            GENERATE MYSTERY
          </Button>
        </div>
      </form>
    </div>
  );
}
