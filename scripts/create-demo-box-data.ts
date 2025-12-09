import { BoxClient, BoxJwtAuth, JwtConfig } from 'box-typescript-sdk-gen';
import * as dotenv from 'dotenv';
import { createProject, createExperiment, getProject, getExperiment, Project, Experiment } from '../lib/box/folders';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createDemoBoxData() {
  console.log('🚀 Creating Demo Data in Box (Projects & Experiments)...\n');

  // Initialize Box SDK
  const jwtConfig = new JwtConfig({
    clientId: process.env.BOX_CLIENT_ID!,
    clientSecret: process.env.BOX_CLIENT_SECRET!,
    jwtKeyId: process.env.BOX_PUBLIC_KEY_ID!,
    privateKey: process.env.BOX_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    privateKeyPassphrase: process.env.BOX_PASSPHRASE!,
    enterpriseId: process.env.BOX_ENTERPRISE_ID!,
  });

  const auth = new BoxJwtAuth({ config: jwtConfig });
  const client = new BoxClient({ auth });

  // --- 1. Define Demo Data ---

  const demoProjects = [
    {
      projectCode: 'BIO-2025-X',
      projectName: 'CRISPR Gene Editing Alpha',
      piName: 'Dr. Sarah Chen',
      piEmail: 'schen@usdm.com',
      department: 'Bio-Engineering',
      startDate: new Date().toISOString(),
      status: 'active' as const,
      description: 'Phase 1 trials for high-fidelity Cas9 variants in mammalian cells.',
    },
    {
      projectCode: 'CHEM-2025-Y',
      projectName: 'Novel Polymer Synthesis',
      piName: 'Dr. James Wilson',
      piEmail: 'jwilson@usdm.com',
      department: 'Material Science',
      startDate: new Date().toISOString(),
      status: 'planning' as const,
      description: 'Synthesis of biodegradable polymers for sustainable packaging solutions.',
    },
    {
      projectCode: 'PHARMA-2025-Z',
      projectName: 'Oncology Drug Screening',
      piName: 'Dr. Emily Chang',
      piEmail: 'echang@usdm.com',
      department: 'Pharmacology',
      startDate: new Date().toISOString(),
      status: 'active' as const,
      description: 'High-throughput screening of small molecule inhibitors for kinase targets.',
    }
  ];

  const demoExperiments = [
    {
        experimentId: 'EXP-001',
        experimentTitle: 'Cas9 Specificity Test',
        objective: 'Determine off-target effects.',
        hypothesis: 'New variant shows <1% off-target.',
        ownerName: 'Dr. Sarah Chen',
        ownerEmail: 'schen@usdm.com',
        status: 'in-progress' as const,
        tags: ['validation', 'analysis']
    },
    {
        experimentId: 'EXP-002',
        experimentTitle: 'Vector Construction',
        objective: 'Build plasmid vectors.',
        hypothesis: 'N/A',
        ownerName: 'Dr. Sarah Chen',
        ownerEmail: 'schen@usdm.com',
        status: 'completed' as const,
        tags: ['synthesis']
    }
  ];

  // --- 2. Create Projects & Verify ---

  for (const p of demoProjects) {
    console.log(`
📂 Creating Project: ${p.projectName}...`);
    try {
        // Create Project
        const createdProject = await createProject(client, p);
        console.log(`  ✅ Created Folder ID: ${createdProject.folderId}`);

        // Verify Metadata immediately
        console.log(`  🔍 Verifying Metadata...`);
        const verifiedProject = await getProject(client, createdProject.folderId);
        
        if (verifiedProject.projectCode === p.projectCode && verifiedProject.piName === p.piName) {
             console.log(`  ✅ Metadata Verified: ${verifiedProject.projectCode} | ${verifiedProject.piName} | ${verifiedProject.status}`);
        } else {
             console.warn(`  ⚠️  Metadata Mismatch! Expected ${p.projectCode}, got ${verifiedProject.projectCode}`);
        }

        // --- 3. Create Experiments for this Project ---
        for (const e of demoExperiments) {
             // Unique-ify ID per project
             const uniqueExp = { 
                 ...e, 
                 experimentId: `${p.projectCode.split('-')[0]}-${e.experimentId}`,
                 experimentTitle: `${e.experimentTitle} (${p.department})`
             };
             
             console.log(`    🧪 Creating Experiment: ${uniqueExp.experimentTitle}...`);
             const createdExp = await createExperiment(client, createdProject.folderId, uniqueExp);
             console.log(`      ✅ Created Exp Folder ID: ${createdExp.folderId}`);
             
             // Verify Experiment Metadata
             const verifiedExp = await getExperiment(client, createdExp.folderId);
             if (verifiedExp.status === uniqueExp.status) {
                 console.log(`      ✅ Metadata Verified: ${verifiedExp.experimentId} | ${verifiedExp.status} | Tags: ${verifiedExp.tags.join(', ')}`);
             } else {
                 console.warn(`      ⚠️  Exp Metadata Mismatch!`);
             }
        }

    } catch (err: any) {
        // Robust error checking for existing folder
        const isExistsError = 
            err.message?.includes('item_name_in_use') || 
            (err.response?.body?.code === 'item_name_in_use') ||
            err.code === 'item_name_in_use';

        if (isExistsError) {
            console.log(`  ⚠️  Project folder already exists. Skipping creation.`);
        } else {
            console.error(`  ❌ Failed to create project:`, err.message || err);
        }
    }
  }

  console.log('\n✨ Demo Data Creation & Verification Complete!');
}

createDemoBoxData().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});