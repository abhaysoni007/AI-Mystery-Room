import { Case } from '../models/Case.js';
import { InvestigationProgress } from '../models/InvestigationProgress.js';
import { Accusation } from '../models/Accusation.js';

/**
 * Safely quarantines legacy or unowned cases without deleting user data.
 * Cases originally tagged with 'user_anonymous' are segregated so they cannot leak
 * into any new or authenticated user's case listings.
 */
export async function quarantineLegacyCases() {
  try {
    const unownedCases = await Case.find({ ownerId: 'user_anonymous' });
    if (unownedCases.length === 0) {
      return { quarantinedCount: 0 };
    }

    const caseIds = unownedCases.map((c) => c._id);

    // Reassign owner to a segregated quarantine identity
    await Case.updateMany(
      { _id: { $in: caseIds } },
      { $set: { ownerId: 'quarantine_unclaimed' } }
    );

    await InvestigationProgress.updateMany(
      { caseId: { $in: caseIds }, userId: 'user_anonymous' },
      { $set: { userId: 'quarantine_unclaimed' } }
    );

    await Accusation.updateMany(
      { caseId: { $in: caseIds }, userId: 'user_anonymous' },
      { $set: { userId: 'quarantine_unclaimed' } }
    );

    return { quarantinedCount: unownedCases.length };
  } catch (error) {
    console.error('Error during legacy case quarantine migration:', error);
    throw error;
  }
}
