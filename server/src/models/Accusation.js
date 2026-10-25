import mongoose from 'mongoose';

const accusationSchema = new mongoose.Schema(
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
    selectedSuspectId: {
      type: String,
      required: true,
    },
    reasoning: {
      type: String,
      default: '',
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

accusationSchema.index({ caseId: 1, userId: 1 });

export const Accusation =
  mongoose.models.Accusation || mongoose.model('Accusation', accusationSchema);
