import React from 'react';
import { MessageSquare, ShieldCheck, CheckCheck, Check, Clock, User } from 'lucide-react';

export function ChatEvidenceViewer({ evidence }) {
  const content = evidence?.content || {};
  const participants = content.participants || [];
  const messages = content.messages || [];

  const getParticipant = (id) => {
    return participants.find((p) => p.id === id) || { displayName: id, role: 'Participant' };
  };

  return (
    <div className="bg-paper-light border-3 border-ink rounded-xl shadow-hard overflow-hidden flex flex-col">
      {/* Terminal App Top Header */}
      <div className="bg-ink text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neoYellow border border-white flex items-center justify-center text-ink shadow-hard-xs">
            <MessageSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-sm sm:text-base tracking-tight uppercase">
              {evidence.title}
            </h3>
            <p className="font-mono text-xs text-white/70">
              DISPOSAL EXTRACTION • {participants.map((p) => p.displayName).join(' & ')}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neoGreen/20 border border-neoGreen text-neoGreen rounded font-mono text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          CRYPTOGRAPHIC DUMP VERIFIED
        </div>
      </div>

      {/* Messages Feed */}
      <div className="p-6 space-y-5 bg-paper/50 min-h-[380px] max-h-[550px] overflow-y-auto">
        {messages.map((msg, index) => {
          const participant = getParticipant(msg.participantId);
          const isUserB = msg.participantId === 'user_b';

          return (
            <div
              key={msg.id || index}
              className={`flex flex-col ${isUserB ? 'items-end' : 'items-start'}`}
            >
              {/* Participant Meta */}
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="font-mono text-xs font-bold text-ink">
                  {participant.displayName}
                </span>
                <span className="font-mono text-[10px] uppercase px-1.5 py-0.2 bg-paper border border-ink/40 rounded text-ink/70">
                  {participant.role}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-md sm:max-w-lg p-4 rounded-xl border-2 border-ink shadow-hard-xs ${
                  isUserB
                    ? 'bg-neoBlue/20 text-ink rounded-tr-xs'
                    : 'bg-paper-light text-ink rounded-tl-xs'
                }`}
              >
                <p className="font-sans text-sm sm:text-base leading-relaxed">
                  {msg.text}
                </p>

                {/* Sent Time & Status */}
                <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] font-mono text-ink/70">
                  <Clock className="w-3 h-3" />
                  <span>
                    {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '21:12'}
                  </span>
                  {msg.status === 'read' ? (
                    <span className="text-neoGreen inline-flex items-center gap-0.5" title="Read by recipient">
                      <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  ) : (
                    <span className="text-ink/60 inline-flex items-center gap-0.5" title="Delivered">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal Footer */}
      <div className="bg-paper border-t-2 border-ink px-4 py-3 text-center font-mono text-xs text-ink/70 uppercase font-bold">
        END OF LOGGED SESSION • DEVICE DESTROYED VIA THERMAL ACCELERANT
      </div>
    </div>
  );
}
