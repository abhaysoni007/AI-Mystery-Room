import React from 'react';
import { FileText, FlaskConical, User, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export function DocumentEvidenceViewer({ evidence }) {
  const content = evidence?.content || {};

  // Case 1: Keycard Access Audit Log
  if (content.records && Array.isArray(content.records)) {
    return (
      <div className="bg-paper-light border-3 border-ink rounded-xl shadow-hard overflow-hidden flex flex-col">
        {/* Document Header */}
        <div className="bg-paper border-b-2 border-ink p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase px-2 py-0.5 bg-neoYellow border border-ink rounded font-bold">
                AUDIT TELEMETRY
              </span>
              <span className="font-mono text-xs text-ink/70">
                {content.documentNumber || 'ACC-LOG-8829-VAULT'}
              </span>
            </div>
            <h3 className="font-display font-extrabold text-xl text-ink uppercase tracking-tight">
              {evidence.title}
            </h3>
            <p className="font-mono text-xs text-ink/70">
              ISSUER: {content.issuer || 'Central Security Telemetry Server'}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neoGreen/20 border border-neoGreen text-ink rounded-lg font-mono text-xs font-bold shadow-hard-xs">
            <ShieldCheck className="w-4 h-4 text-neoGreen stroke-[2.5]" />
            SERVER LOG AUTHENTICATED
          </div>
        </div>

        {/* Access Records Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse border-2 border-ink font-mono text-xs">
            <thead>
              <tr className="bg-ink text-white">
                <th className="p-3 border border-ink">TIMESTAMP</th>
                <th className="p-3 border border-ink">BADGE IDENTIFIER</th>
                <th className="p-3 border border-ink">LOCATION / ACCESS POINT</th>
                <th className="p-3 border border-ink">ACTION / STATUS</th>
              </tr>
            </thead>
            <tbody>
              {content.records.map((rec, idx) => {
                const isExit = rec.action?.includes('EGRESS') || rec.action?.includes('EXIT');
                const isOverride = rec.action?.includes('Override');

                return (
                  <tr
                    key={idx}
                    className={`border-b border-ink/30 hover:bg-neoYellow/20 transition-colors ${
                      idx % 2 === 0 ? 'bg-paper-light' : 'bg-paper'
                    }`}
                  >
                    <td className="p-3 border-r border-ink font-bold">{rec.timestamp}</td>
                    <td className="p-3 border-r border-ink font-bold text-ink">{rec.badge}</td>
                    <td className="p-3 border-r border-ink">{rec.door}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded border text-[11px] font-bold ${
                          isOverride
                            ? 'bg-neoCoral/30 border-neoCoral text-ink'
                            : 'bg-neoGreen/20 border-neoGreen text-ink'
                        }`}
                      >
                        {rec.action}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Stamp */}
        <div className="bg-paper border-t-2 border-ink px-6 py-3 font-mono text-[11px] text-ink/70 flex justify-between items-center">
          <span>EXTRACTION METHOD: SQL DUMP via ADMIN CONSOLE</span>
          <span>INTEGRITY HASH: SHA-256 VERIFIED</span>
        </div>
      </div>
    );
  }

  // Case 2: Forensic Chemical / Toxicology Report
  if (content.findings && Array.isArray(content.findings)) {
    return (
      <div className="bg-paper-light border-3 border-ink rounded-xl shadow-hard overflow-hidden flex flex-col">
        {/* Lab Header */}
        <div className="bg-paper border-b-2 border-ink p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase px-2 py-0.5 bg-neoGreen border border-ink rounded font-bold">
                FORENSIC LAB REPORT
              </span>
              <span className="font-mono text-xs text-ink/70">
                LAB ID #TX-4410
              </span>
            </div>
            <h3 className="font-display font-extrabold text-xl text-ink uppercase tracking-tight">
              {evidence.title}
            </h3>
            <p className="font-mono text-xs text-ink/70">
              FACILITY: {content.laboratory || 'Metropolitan Forensic Chemistry Center'}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neoYellow border border-ink rounded-lg font-mono text-xs font-bold shadow-hard-xs">
            <FlaskConical className="w-4 h-4 text-ink stroke-[2.5]" />
            SPECIMEN: {content.specimenType || 'Solvent Swabs'}
          </div>
        </div>

        {/* Chemical Findings List */}
        <div className="p-6 space-y-4">
          <h4 className="font-mono text-xs font-bold text-ink uppercase flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-neoPurple stroke-[2.5]" />
            MASS SPECTROMETRY & CHROMATOGRAPHY FINDINGS
          </h4>

          <div className="space-y-3">
            {content.findings.map((finding, idx) => (
              <div
                key={idx}
                className="bg-paper border-2 border-ink rounded-lg p-4 flex items-start gap-3 shadow-hard-xs"
              >
                <div className="w-6 h-6 rounded bg-neoGreen border border-ink flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-ink stroke-[2.5]" />
                </div>
                <p className="font-sans text-sm text-ink leading-relaxed">
                  {finding}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Lab Footer */}
        <div className="bg-paper border-t-2 border-ink px-6 py-3 font-mono text-[11px] text-ink/70 flex justify-between items-center">
          <span>CERTIFYING AGENT: SENIOR TOXICOLOGIST H. VOGEL</span>
          <span>CONFIDENCE LEVEL: 99.8% SPECIFICITY</span>
        </div>
      </div>
    );
  }

  // Case 3: Witness Statement / Interview Transcript
  if (content.statement) {
    return (
      <div className="bg-paper-light border-3 border-ink rounded-xl shadow-hard overflow-hidden flex flex-col">
        {/* Interview Header */}
        <div className="bg-paper border-b-2 border-ink p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase px-2 py-0.5 bg-neoPurple text-white border border-ink rounded font-bold">
                SWORN DEPOSITION
              </span>
              <span className="font-mono text-xs text-ink/70">
                INTERVIEW ROOM #2
              </span>
            </div>
            <h3 className="font-display font-extrabold text-xl text-ink uppercase tracking-tight">
              {evidence.title}
            </h3>
            <p className="font-mono text-xs text-ink/70">
              WITNESS: {content.witnessName || 'Anonymous Witness'} • INTERVIEWER: {content.interviewer || 'Investigating Detective'}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neoYellow border border-ink rounded-lg font-mono text-xs font-bold shadow-hard-xs">
            <User className="w-4 h-4 text-ink stroke-[2.5]" />
            SWORN TESTIMONY RECORDED
          </div>
        </div>

        {/* Deposition Text */}
        <div className="p-6">
          <div className="bg-paper border-2 border-ink rounded-xl p-6 shadow-hard-xs">
            <div className="font-mono text-xs font-bold text-ink/70 uppercase mb-3">
              TRANSCRIPT TEXT:
            </div>
            <p className="font-sans text-base text-ink leading-relaxed italic pl-4 border-l-3 border-neoPurple">
              "{content.statement}"
            </p>
          </div>
        </div>

        {/* Deposition Footer */}
        <div className="bg-paper border-t-2 border-ink px-6 py-3 font-mono text-[11px] text-ink/70 flex justify-between items-center">
          <span>RECORDING METHOD: DIGITAL AUDIO DICTATION</span>
          <span>LEGAL ATTESTATION: VERIFIED UNDER PENALTY OF PERJURY</span>
        </div>
      </div>
    );
  }

  // Fallback Generic Document
  return (
    <div className="bg-paper-light border-3 border-ink rounded-xl p-6 shadow-hard">
      <h3 className="font-display font-extrabold text-xl text-ink uppercase mb-2">
        {evidence.title}
      </h3>
      <p className="font-sans text-sm text-ink/80 leading-relaxed">
        {evidence.description || evidence.summary}
      </p>
    </div>
  );
}
