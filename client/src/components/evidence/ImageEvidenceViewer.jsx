import React, { useState } from 'react';
import { Camera, ZoomIn, ZoomOut, Crosshair, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export function ImageEvidenceViewer({ evidence }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const content = evidence?.content || {};
  const observations = content.observations || [];

  return (
    <div className="bg-paper-light border-3 border-ink rounded-xl shadow-hard overflow-hidden flex flex-col">
      {/* Photo Toolbar */}
      <div className="bg-ink text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink">
        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase">
          <Camera className="w-4 h-4 text-neoPurple" />
          <span>FORENSIC IMAGING CAPTURE • {evidence.id}</span>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsZoomed(!isZoomed)}
          className="flex items-center gap-1.5 text-xs py-1 px-3"
        >
          {isZoomed ? (
            <>
              <ZoomOut className="w-3.5 h-3.5 stroke-[2.5]" />
              RESET VIEW
            </>
          ) : (
            <>
              <ZoomIn className="w-3.5 h-3.5 stroke-[2.5]" />
              ZOOM (2X)
            </>
          )}
        </Button>
      </div>

      {/* Crime Scene Photo Container */}
      <div className="p-6 bg-paper/60 border-b-2 border-ink flex flex-col items-center justify-center relative overflow-hidden min-h-[320px]">
        {/* Scale Ruler & Crosshair Overlay */}
        <div className="w-full max-w-2xl bg-black rounded-lg border-3 border-ink p-4 relative shadow-hard-md overflow-hidden text-white flex flex-col items-center justify-center min-h-[260px] group">
          <div className="absolute top-3 left-3 font-mono text-[10px] text-neoYellow border border-neoYellow/40 px-1.5 py-0.5 rounded">
            CALIBRATION SCALE: 1cm = 42px
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1 font-mono text-[10px] text-white/70">
            <Crosshair className="w-3.5 h-3.5 text-neoCoral" />
            <span>OPTICAL SENSOR #F-902</span>
          </div>

          {/* Simulated Macro Still Frame */}
          <div
            className={`transition-transform duration-300 flex flex-col items-center text-center p-6 ${
              isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-neoCoral/80 flex items-center justify-center mb-4 animate-pulse">
              <Crosshair className="w-10 h-10 text-neoCoral" />
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-neoYellow font-bold mb-1">
              [ THERMAL LASER INCISION CRIME SCENE DETAIL ]
            </div>
            <p className="font-mono text-[11px] text-white/80 max-w-md">
              HIGH-RESOLUTION OPTICAL MACRO REVEALS ZERO SHATTER FRACTURES ALONG ACRYLIC LAMINATE
            </p>
          </div>

          {/* Bottom Forensic Ruler Graphic */}
          <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[9px] font-mono text-white/50 border-t border-white/20 pt-1">
            <span>0cm</span>
            <span>|</span>
            <span>5cm</span>
            <span>|</span>
            <span>10cm</span>
            <span>|</span>
            <span>15cm</span>
            <span>|</span>
            <span>20cm</span>
          </div>
        </div>
      </div>

      {/* Caption & Observations */}
      <div className="p-6 space-y-6">
        {/* Caption */}
        {content.caption && (
          <div className="bg-paper border-2 border-ink rounded-lg p-4">
            <div className="font-mono text-xs font-bold text-ink uppercase mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-neoPurple stroke-[2.5]" />
              PRIMARY FORENSIC INTERPRETATION
            </div>
            <p className="font-sans text-sm text-ink leading-relaxed">
              {content.caption}
            </p>
          </div>
        )}

        {/* Observations Checklist */}
        {observations.length > 0 && (
          <div>
            <h4 className="font-mono text-xs font-bold text-ink uppercase mb-3">
              BALLISTIC & PHYSICAL OBSERVATIONS ({observations.length})
            </h4>
            <div className="space-y-2.5">
              {observations.map((obs, idx) => (
                <div
                  key={idx}
                  className="bg-paper-light border-2 border-ink rounded-lg p-3 flex items-start gap-3 shadow-hard-xs"
                >
                  <div className="w-5 h-5 rounded bg-neoYellow border border-ink flex items-center justify-center shrink-0 mt-0.5">
                    <span className="font-mono text-[10px] font-bold text-ink">{idx + 1}</span>
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-ink/90 leading-relaxed">
                    {obs}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
