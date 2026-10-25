import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MapPin, Users, FileText, ArrowRight } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';

export function TimelineView() {
  const { caseId } = useParams();
  const { currentCase } = useInvestigation();

  const events = currentCase?.timeline || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neoYellow border-2 border-ink rounded-lg font-mono text-xs font-bold uppercase mb-2 shadow-hard-xs">
          <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
          CHRONOLOGICAL RECONSTRUCTION ({events.length} EVENTS)
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink uppercase tracking-tight">
          INCIDENT TIMELINE & RECONSTRUCTION
        </h2>
        <p className="font-sans text-sm text-ink/80 mt-1 max-w-2xl">
          Follow the precise chronological sequence of established movements, security logs, and power fluctuations.
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 border-l-3 border-ink space-y-8 my-6">
        {events.map((event, index) => {
          return (
            <div key={event.id || index} className="relative group">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full bg-neoYellow border-3 border-ink group-hover:scale-125 transition-transform" />

              <div className="bg-paper-light border-3 border-ink rounded-xl p-5 sm:p-6 shadow-hard">
                {/* Event Top Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold px-3 py-1 bg-neoYellow border-2 border-ink rounded-lg shadow-hard-xs">
                      {event.timeDescription || event.time}
                    </span>
                    {event.location && (
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-ink/80 bg-paper px-2.5 py-1 border border-ink rounded">
                        <MapPin className="w-3.5 h-3.5 text-neoCoral stroke-[2.5]" />
                        {event.location}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-ink/60 uppercase">
                    EVENT #{index + 1}
                  </span>
                </div>

                {/* Event Title or Heading */}
                <h3 className="font-display font-extrabold text-lg sm:text-xl text-ink uppercase tracking-tight mb-2">
                  {event.title || event.description}
                </h3>

                {/* Event Full Narrative if title was present */}
                {event.title && event.description && (
                  <p className="font-sans text-sm text-ink/80 leading-relaxed mb-4">
                    {event.description}
                  </p>
                )}

                {/* Related Suspects and Evidence Tags */}
                <div className="flex flex-wrap items-center gap-4 pt-3 border-t-2 border-ink/10 text-xs font-mono">
                  {event.relatedSuspectIds?.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-neoBlue stroke-[2.5]" />
                      <span className="font-bold text-ink">Involved:</span>
                      <div className="flex gap-1">
                        {event.relatedSuspectIds.map((sid) => {
                          const suspect = currentCase?.suspects?.find((s) => s.id === sid);
                          return (
                            <span
                              key={sid}
                              className="px-2 py-0.5 bg-paper border border-ink rounded font-bold"
                            >
                              {suspect ? suspect.name : sid}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {event.relatedEvidenceIds?.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-neoPurple stroke-[2.5]" />
                      <span className="font-bold text-ink">Clues:</span>
                      <div className="flex gap-1">
                        {event.relatedEvidenceIds.map((eid) => (
                          <Link
                            key={eid}
                            to={`/case/${caseId}/evidence/${eid}`}
                            className="px-2 py-0.5 bg-paper border border-ink rounded font-bold hover:bg-neoYellow transition-colors inline-flex items-center gap-0.5"
                          >
                            <span>{eid}</span>
                            <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
