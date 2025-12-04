/**
 * Check database experiments and projects
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';

async function main() {
  const queryClient = postgres(process.env.POSTGRES_URL!);
  const db = drizzle(queryClient);

  // Check experiments
  const experiments = await db.execute(sql`SELECT id, box_folder_id, experiment_id, title FROM experiments`);
  console.log('Experiments in database:');
  experiments.forEach((e: any) => {
    console.log(`  - ${e.experiment_id}: ${e.title} (box_folder_id: ${e.box_folder_id})`);
  });

  // Check projects
  const projects = await db.execute(sql`SELECT id, box_folder_id, project_code, project_name FROM projects`);
  console.log('\nProjects in database:');
  projects.forEach((p: any) => {
    console.log(`  - ${p.project_code}: ${p.project_name} (box_folder_id: ${p.box_folder_id})`);
  });

  await queryClient.end();
}

main();
