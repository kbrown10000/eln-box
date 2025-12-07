import { db } from '@/lib/db';
import { experiments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export class ExperimentLockedError extends Error {
  constructor(message = 'Experiment is locked and cannot be modified') {
    super(message);
    this.name = 'ExperimentLockedError';
  }
}

/**
 * Checks if an experiment is locked. Throws ExperimentLockedError if it is.
 * @param boxFolderId The Box Folder ID of the experiment
 */
export async function ensureExperimentNotLocked(boxFolderId: string) {
  const experiment = await db.query.experiments.findFirst({
    where: eq(experiments.boxFolderId, boxFolderId),
    columns: {
      status: true,
    },
  });

  if (experiment && experiment.status === 'locked') {
    throw new ExperimentLockedError();
  }
}
