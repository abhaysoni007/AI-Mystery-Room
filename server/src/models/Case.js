import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    location: { type: String, default: '' },
    occurredAt: { type: Date, default: null },
    timeDescription: { type: String, default: '' },
  },
  { _id: false }
);

const suspectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    occupation: { type: String, default: '' },
    relationship: { type: String, default: '' },
    summary: { type: String, required: true },
    background: { type: String, default: '' },
    publicStatement: { type: String, default: '' },
    alibiPublicText: { type: String, default: '' },
    portraitAssetId: { type: String, default: null },
    relatedEvidenceIds: { type: [String], default: [] },
    relatedEventIds: { type: [String], default: [] },
  },
  { _id: false }
);

const timelineEventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    timeDescription: { type: String, default: '' },
    occurredAt: { type: Date, default: null },
    description: { type: String, required: true },
    relatedSuspectIds: { type: [String], default: [] },
    relatedEvidenceIds: { type: [String], default: [] },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const evidenceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    occurredAt: { type: Date, default: null },
    timeDescription: { type: String, default: '' },
    sourceContext: { type: String, default: '' },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    relatedSuspectIds: { type: [String], default: [] },
    relatedEventIds: { type: [String], default: [] },
  },
  { _id: false }
);

const solutionSchema = new mongoose.Schema(
  {
    culpritId: { type: String, required: true },
    culpritName: { type: String, default: '' },
    motive: { type: String, required: true },
    method: { type: String, required: true },
    rationale: { type: String, required: true },
    decisiveEvidenceIds: { type: [String], default: [] },
    redHerrings: [
      {
        suspectId: { type: String },
        evidenceId: { type: String },
        explanation: { type: String },
        _id: false,
      },
    ],
  },
  { _id: false }
);

const caseSchema = new mongoose.Schema(
  {
    ownerId: { type: String, default: 'user_anonymous', index: true },
    title: { type: String, required: true, trim: true },
    prompt: { type: String, required: true },
    category: {
      type: String,
      enum: ['theft', 'murder', 'disappearance', 'corporate_espionage', 'cybercrime', 'blackmail', 'other'],
      default: 'theft',
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    length: {
      type: String,
      enum: ['short', 'standard', 'extended'],
      default: 'standard',
    },
    status: {
      type: String,
      enum: ['generating', 'active', 'completed', 'failed'],
      default: 'active',
      index: true,
    },
    summary: { type: String, required: true },
    incident: { type: incidentSchema, required: true },
    suspects: { type: [suspectSchema], default: [] },
    timeline: { type: [timelineEventSchema], default: [] },
    evidence: { type: [evidenceSchema], default: [] },
    solution: { type: solutionSchema, required: true },
    activatedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

caseSchema.index({ ownerId: 1, status: 1, updatedAt: -1 });

export const Case = mongoose.models.Case || mongoose.model('Case', caseSchema);
