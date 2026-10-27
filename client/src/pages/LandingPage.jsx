import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { HowItWorks } from '../components/landing/HowItWorks';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { SampleCaseCard } from '../components/landing/SampleCaseCard';
import { Compass, Search, FolderArchive, ArrowRight } from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';

import { SAMPLE_CASE } from '../data/sampleCase';

export function LandingPage() {
  const navigate = useNavigate();
  const { currentCase } = useInvestigation();
  const activeCase = currentCase || SAMPLE_CASE;

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">

            <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-ink leading-[1.05]">
              CRACK THE CASE.<br />
              <span className="bg-neoYellow px-3 py-1 border-3 border-ink shadow-hard-md inline-block mt-2">
                UNMASK THE GUILTY.
              </span>
            </h1>

            <p className="text-xl text-ink font-medium max-w-xl leading-relaxed">
              Transform any creative scenario into a playable forensic dossier. Cross-examine suspects, decode contradictory timestamps, and determine who did it.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/create')}
                className="text-lg px-8 py-4"
              >
                <Compass className="w-5 h-5 mr-2 stroke-[2.5]" />
                START AN INVESTIGATION
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(`/case/${activeCase.id}`)}
                className="text-lg px-8 py-4"
              >
                <Search className="w-5 h-5 mr-2 stroke-[2.5]" />
                EXPLORE SAMPLE CASE
              </Button>
            </div>

            <div className="pt-4 flex items-center gap-6 font-mono text-xs text-muted">
              <span>&bull; Predetermined Culprits</span>
              <span>&bull; No Generative Halts</span>
              <span>&bull; Zero Solution Leaks</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              {/* Backing Accent Card */}
              <div className="absolute inset-0 bg-neoBlue border-3 border-ink rounded-2xl translate-x-3 translate-y-3 shadow-hard-lg"></div>

              {/* Main Dossier Card */}
              <Card accent="purple" className="relative z-10 border-3">
                <div className="flex items-center justify-between border-b-2 border-ink pb-3 mb-4">
                  <span className="font-mono font-bold text-xs bg-neoYellow px-2.5 py-1 border border-ink rounded">
                    ACTIVE DOSSIER
                  </span>
                  <span className="font-mono text-xs font-bold text-ink">
                    CONFIDENTIAL
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-3xl mb-2 text-ink">
                  {activeCase.title}
                </h3>

                <p className="text-sm font-medium text-ink leading-relaxed mb-6">
                  {activeCase.summary}
                </p>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between bg-white p-3 border-2 border-ink rounded-lg shadow-hard-sm">
                    <span className="font-bold">SUSPECT PROFILES</span>
                    <span className="bg-neoPink px-2 py-0.5 border border-ink rounded font-bold">4 PERSONS OF INTEREST</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 border-2 border-ink rounded-lg shadow-hard-sm">
                    <span className="font-bold">EVIDENCE RECORD</span>
                    <span className="bg-neoYellow px-2 py-0.5 border border-ink rounded font-bold">6 VERIFIED ARTIFACTS</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 border-2 border-ink rounded-lg shadow-hard-sm">
                    <span className="font-bold">INVESTIGATION STATUS</span>
                    <span className="bg-neoGreen px-2 py-0.5 border border-ink rounded font-bold">READY TO PLAY</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-ink">
                  <Button
                    variant="primary"
                    className="w-full justify-between"
                    onClick={() => navigate(`/case/${activeCase.id}`)}
                  >
                    ENTER DOSSIER ROOM
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <HowItWorks />

      {/* Feature Grid */}
      <FeatureGrid />

      {/* Sample Case */}
      <SampleCaseCard caseData={activeCase} />

      {/* Closing CTA */}
      <section className="py-20 border-t-2 border-ink bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-ink">
            BECOME THE DETECTIVE NOW.
          </h2>
          <p className="text-lg text-ink font-medium max-w-2xl mx-auto">
            Generate an original custom mystery from any premise, or inspect existing case files on your personal dashboard.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/create')}
            >
              CREATE A MYSTERY
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              OPEN DASHBOARD
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
