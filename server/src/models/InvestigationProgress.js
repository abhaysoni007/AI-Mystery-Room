import mongoose from 'mongoose';

const investigationProgressSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
      index: true,
    },
    userId: {
      type: String,
      default: 'user_anonymous',
      index: true,
    },
    openedEvidenceIds: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

investigationProgressSchema.index({ userId: 1, caseId: 1 }, { unique: true });
investigationProgressSchema.index({ userId: 1, lastActivityAt: -1 });

export const InvestigationProgress =
  mongoose.models.InvestigationProgress ||
  mongoose.model('InvestigationProgress', investigationProgressSchema);
