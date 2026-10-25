import React, { useState } from 'react';
import { Video, Play, Pause, RotateCcw, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '../ui/Button';

export function SurveillanceEvidenceViewer({ evidence }) {
  const content = evidence?.content || {};
  const observations = content.observations || [];
  const [selectedObservation, setSelectedObservation] = useState(observations[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-paper-light border-3 border-ink rounded-xl shadow-hard overflow-hidden flex flex-col">
      {/* CCTV Monitor Header */}
      <div className="bg-ink text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-neoCoral animate-ping" />
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-neoYellow">
            SIMULATED SURVEILLANCE RECONSTRUCTION
          </div>
        </div>

        <div className="font-mono text-xs text-white/70">
          CHANNEL: {content.cameraCode || 'CAM-04B (CONCOURSE-NORTH)'}
        </div>
      </div>

      {/* Simulated Video Display Screen */}
      <div className="bg-black text-green-400 font-mono p-6 border-b-2 border-ink relative overflow-hidden flex flex-col justify-between min-h-[300px]">
        {/* Monitor HUD Overlay */}
        <div className="flex items-center justify-between text-xs border-b border-green-800/60 pb-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            <span className="font-bold text-white tracking-widest">REC [ACTIVE]</span>
            <span className="text-green-500/80">30 FPS 1080P</span>
          </div>
          <div className="text-yellow-400 font-bold">
            TIMESTAMP: {selectedObservation?.time || '21:28:44'}
          </div>
        </div>

        {/* Video Canvas Graphic Center */}
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 relative">
          {/* Scanline Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

          <div className="w-16 h-16 rounded-xl border-2 border-green-500/60 flex items-center justify-center mb-3 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <Video className="w-8 h-8" />
          </div>

          <div className="text-white text-sm font-bold tracking-wider uppercase mb-1">
            {selectedObservation ? `TELEMETRY LOG @ ${selectedObservation.time}` : 'FEED ARCHIVE'}
          </div>
          <p className="text-green-300 text-xs max-w-lg leading-relaxed bg-black/60 px-3 py-1.5 rounded border border-green-800">
            {selectedObservation?.event || 'Select an observation below to review recorded telemetry.'}
          </p>
        </div>

        {/* Monitor Footer Bar */}
        <div className="flex flex-wrap items-center justify-between text-[11px] border-t border-green-800/60 pt-2 mt-4 text-green-500/70">
          <span>SOURCE: FIXED DOME MATRIX 04-B</span>
          <span>COMPRESSION: H.264 DUAL-STREAM</span>
          <span>SIGNAL: 98.4% RECOVERED</span>
        </div>
      </div>

      {/* Observation Telemetry Sequence Log */}
      <div className="p-6">
        <h4 className="font-mono text-xs font-bold text-ink uppercase mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-neoCoral stroke-[2.5]" />
          TELEMETRY TIMESTAMPS & RECONSTRUCTED OBSERVATIONS ({observations.length})
        </h4>

        <div className="space-y-3">
          {observations.map((obs, idx) => {
            const isSelected = selectedObservation?.time === obs.time;
            return (
              <div
                key={idx}
                onClick={() => setSelectedObservation(obs)}
                className={`p-4 rounded-xl border-2 border-ink cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-neoYellow shadow-hard-xs translate-x-1'
                    : 'bg-paper-light hover:bg-paper'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 bg-paper border border-ink rounded shrink-0">
                    {obs.time}
                  </span>
                  <p className="font-sans text-xs sm:text-sm text-ink leading-relaxed">
                    {obs.event}
                  </p>
                </div>

                <div className="text-[11px] font-mono text-ink/70 shrink-0 uppercase self-end sm:self-auto font-bold">
                  {isSelected ? '● VIEWING' : 'CLICK TO CUE'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
