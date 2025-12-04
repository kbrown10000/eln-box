/**
 * Seed script for LabNoteX demo data
 * Creates realistic chemistry lab experiments with protocols, reagents, yields, and spectra
 *
 * Run with: npx tsx scripts/seed-demo-data.ts
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

// Demo user (will be created or found)
const demoUser = {
  boxUserId: 'demo-user-001',
  email: 'researcher@labnotex.demo',
  name: 'Dr. Sarah Chen',
  role: 'researcher' as const,
};

// Demo projects
const demoProjects = [
  {
    boxFolderId: '354150913701', // Use actual projects folder ID
    projectCode: 'CHEM-2024-001',
    projectName: 'Organic Synthesis Methods',
    description: 'Development of novel organic synthesis techniques for pharmaceutical intermediates',
    piName: 'Dr. Sarah Chen',
    piEmail: 'sarah.chen@labnotex.demo',
    department: 'Chemistry',
    status: 'active',
  },
  {
    boxFolderId: '354150913702',
    projectCode: 'CHEM-2024-002',
    projectName: 'Green Chemistry Initiative',
    description: 'Sustainable and environmentally friendly chemical processes',
    piName: 'Dr. Michael Torres',
    piEmail: 'michael.torres@labnotex.demo',
    department: 'Chemistry',
    status: 'active',
  },
];

// Demo experiments with full data
const demoExperiments = [
  {
    boxFolderId: '354210879809', // Actual experiment folder ID from Box
    experimentId: 'EXP-001',
    title: 'Synthesis of Aspirin (Acetylsalicylic Acid)',
    objective: 'To synthesize aspirin via acetylation of salicylic acid and determine the purity of the product.',
    hypothesis: 'Acetylation of salicylic acid with acetic anhydride in the presence of sulfuric acid catalyst will produce aspirin with >80% yield.',
    status: 'completed' as const,
    protocolSteps: [
      'Weigh 2.00 g of salicylic acid (MW: 138.12 g/mol) into a clean, dry 125 mL Erlenmeyer flask.',
      'Add 5.0 mL of acetic anhydride (MW: 102.09 g/mol, density: 1.08 g/mL) using a graduated cylinder.',
      'Carefully add 5 drops of concentrated sulfuric acid (18 M) as catalyst. CAUTION: Corrosive!',
      'Heat the mixture on a water bath at 85°C for 15 minutes with occasional swirling.',
      'Remove from heat and carefully add 20 mL of cold distilled water to decompose excess acetic anhydride.',
      'Cool the flask in an ice bath until crystallization is complete (~10 minutes).',
      'Vacuum filter the crystals using a Büchner funnel. Wash with 10 mL cold water.',
      'Recrystallize from hot ethanol: dissolve in minimum hot ethanol, add water until cloudy, then cool.',
      'Dry the purified crystals and weigh. Calculate percent yield.',
      'Perform melting point analysis. Pure aspirin: 135-136°C.',
    ],
    reagents: [
      { name: 'Salicylic Acid', amount: 2.01, unit: 'g', molarAmount: 0.01455, observations: 'White crystalline powder, slight phenolic odor' },
      { name: 'Acetic Anhydride', amount: 5.0, unit: 'mL', molarAmount: 0.0529, observations: 'Clear liquid, pungent odor' },
      { name: 'Sulfuric Acid (conc.)', amount: 0.25, unit: 'mL', molarAmount: 0.0045, observations: 'Catalyst, used sparingly' },
      { name: 'Distilled Water', amount: 70, unit: 'mL', molarAmount: null, observations: 'For washing and recrystallization' },
      { name: 'Ethanol', amount: 25, unit: 'mL', molarAmount: null, observations: '95% ethanol for recrystallization' },
    ],
    yieldData: {
      productName: 'Acetylsalicylic Acid (Aspirin)',
      theoretical: 2.61,
      actual: 2.20,
      unit: 'g',
    },
    spectra: [
      {
        spectrumType: 'IR' as const,
        title: 'IR_aspirin_product.pdf',
        caption: 'Figure 1: IR Spectrum of Purified Aspirin Product',
        peakData: {
          '3000 cm⁻¹': 'C-H stretches',
          '1750 cm⁻¹': 'C=O stretch (ester)',
          '1680 cm⁻¹': 'C=O stretch (carboxylic acid)',
          '1220 cm⁻¹': 'C-O stretch',
        },
      },
      {
        spectrumType: 'NMR' as const,
        title: '1H_NMR_aspirin.pdf',
        caption: 'Figure 2: ¹H NMR Spectrum (400 MHz, CDCl₃)',
        peakData: {
          '2.3 ppm': 'Singlet, 3H, acetyl CH₃',
          '7.1-7.5 ppm': 'Multiplet, 3H, aromatic H',
          '8.1 ppm': 'Doublet, 1H, aromatic H ortho to ester',
          '11.0 ppm': 'Broad singlet, 1H, COOH',
        },
      },
    ],
  },
  {
    boxFolderId: '354210879810',
    experimentId: 'EXP-002',
    title: 'Grignard Synthesis of Triphenylmethanol',
    objective: 'To prepare triphenylmethanol via Grignard reaction of phenylmagnesium bromide with benzophenone.',
    hypothesis: 'The Grignard reagent will add to the carbonyl of benzophenone to produce triphenylmethanol after acidic workup.',
    status: 'in-progress' as const,
    protocolSteps: [
      'Set up a completely dry round-bottom flask under nitrogen atmosphere.',
      'Add 0.50 g of magnesium turnings and cover with 10 mL dry diethyl ether.',
      'Slowly add a solution of bromobenzene (2.0 mL in 10 mL ether) dropwise with stirring.',
      'Initiate the reaction by gently heating. Watch for bubbling and gray color.',
      'Once initiated, add remaining bromobenzene solution at a rate to maintain gentle reflux.',
      'Stir for 30 minutes after addition is complete to ensure complete Grignard formation.',
      'Add a solution of benzophenone (3.0 g in 20 mL ether) dropwise with stirring.',
      'Reflux for 1 hour, then cool to room temperature.',
      'Hydrolyze by careful addition of saturated ammonium chloride solution.',
      'Separate organic layer, wash with brine, dry over MgSO₄.',
      'Evaporate solvent and recrystallize from petroleum ether.',
    ],
    reagents: [
      { name: 'Magnesium Turnings', amount: 0.50, unit: 'g', molarAmount: 0.0206, observations: 'Activated by gentle scraping' },
      { name: 'Bromobenzene', amount: 2.0, unit: 'mL', molarAmount: 0.019, observations: 'Density: 1.49 g/mL' },
      { name: 'Benzophenone', amount: 3.0, unit: 'g', molarAmount: 0.0165, observations: 'White crystalline solid' },
      { name: 'Diethyl Ether (anhydrous)', amount: 50, unit: 'mL', molarAmount: null, observations: 'Dried over molecular sieves' },
      { name: 'Ammonium Chloride (sat.)', amount: 30, unit: 'mL', molarAmount: null, observations: 'For hydrolysis' },
    ],
    yieldData: null, // In progress, no yield yet
    spectra: [],
  },
  {
    boxFolderId: '354210879811',
    experimentId: 'EXP-003',
    title: 'Fischer Esterification of Benzoic Acid',
    objective: 'To synthesize methyl benzoate via acid-catalyzed esterification of benzoic acid with methanol.',
    hypothesis: 'Refluxing benzoic acid with excess methanol and catalytic sulfuric acid will drive the equilibrium toward ester formation.',
    status: 'completed' as const,
    protocolSteps: [
      'Add 3.0 g benzoic acid (MW: 122.12 g/mol) to a 100 mL round-bottom flask.',
      'Add 20 mL methanol and 2 mL concentrated sulfuric acid.',
      'Set up a reflux condenser and reflux for 1.5 hours.',
      'Cool the mixture and pour into 50 mL cold water.',
      'Extract with 3 × 25 mL diethyl ether.',
      'Wash combined organic extracts with saturated NaHCO₃ until no more CO₂ evolution.',
      'Wash with saturated NaCl solution.',
      'Dry over anhydrous MgSO₄, filter, and evaporate ether.',
      'Distill the product. Collect fraction at 198-200°C.',
      'Record yield and perform IR analysis.',
    ],
    reagents: [
      { name: 'Benzoic Acid', amount: 3.0, unit: 'g', molarAmount: 0.0246, observations: 'White crystalline solid' },
      { name: 'Methanol', amount: 20, unit: 'mL', molarAmount: 0.494, observations: 'Excess drives equilibrium' },
      { name: 'Sulfuric Acid (conc.)', amount: 2.0, unit: 'mL', molarAmount: 0.036, observations: 'Catalyst' },
      { name: 'Diethyl Ether', amount: 75, unit: 'mL', molarAmount: null, observations: 'For extraction' },
      { name: 'Sodium Bicarbonate (sat.)', amount: 50, unit: 'mL', molarAmount: null, observations: 'Neutralization wash' },
    ],
    yieldData: {
      productName: 'Methyl Benzoate',
      theoretical: 3.34,
      actual: 2.87,
      unit: 'g',
    },
    spectra: [
      {
        spectrumType: 'IR' as const,
        title: 'IR_methyl_benzoate.pdf',
        caption: 'Figure 1: IR Spectrum of Methyl Benzoate',
        peakData: {
          '3060 cm⁻¹': 'Aromatic C-H stretch',
          '2950 cm⁻¹': 'Aliphatic C-H stretch',
          '1720 cm⁻¹': 'C=O stretch (ester)',
          '1280 cm⁻¹': 'C-O stretch',
        },
      },
    ],
  },
  {
    boxFolderId: '354210879812',
    experimentId: 'EXP-004',
    title: 'Aldol Condensation: Dibenzalacetone Synthesis',
    objective: 'To synthesize dibenzalacetone through a crossed aldol condensation reaction.',
    hypothesis: 'Base-catalyzed condensation of benzaldehyde with acetone will produce dibenzalacetone predominantly as the E,E-isomer.',
    status: 'completed' as const,
    protocolSteps: [
      'Prepare a solution of 2.5 g NaOH in 25 mL water and 20 mL ethanol in a 250 mL Erlenmeyer flask.',
      'Cool the solution to 20-25°C in a water bath.',
      'Add 5.3 g (5.1 mL) of freshly distilled benzaldehyde.',
      'Add 1.5 g (1.9 mL) of acetone in small portions over 5 minutes with swirling.',
      'Stir the reaction mixture at 20-25°C for 30 minutes.',
      'Collect the yellow precipitate by vacuum filtration.',
      'Wash the product with cold water (3 × 15 mL).',
      'Wash once with cold ethanol (10 mL) to remove any unreacted benzaldehyde.',
      'Dry the product in air, then recrystallize from ethyl acetate.',
      'Determine the melting point. Pure dibenzalacetone: 110-111°C.',
    ],
    reagents: [
      { name: 'Benzaldehyde', amount: 5.3, unit: 'g', molarAmount: 0.050, observations: 'Freshly distilled, pale yellow oil' },
      { name: 'Acetone', amount: 1.5, unit: 'g', molarAmount: 0.026, observations: 'Reagent grade' },
      { name: 'Sodium Hydroxide', amount: 2.5, unit: 'g', molarAmount: 0.0625, observations: 'Pellets dissolved in water' },
      { name: 'Ethanol', amount: 20, unit: 'mL', molarAmount: null, observations: '95% ethanol' },
      { name: 'Ethyl Acetate', amount: 30, unit: 'mL', molarAmount: null, observations: 'For recrystallization' },
    ],
    yieldData: {
      productName: 'Dibenzalacetone (E,E-isomer)',
      theoretical: 5.87,
      actual: 4.91,
      unit: 'g',
    },
    spectra: [
      {
        spectrumType: 'UV-Vis' as const,
        title: 'UV_dibenzalacetone.pdf',
        caption: 'Figure 1: UV-Vis Spectrum in Ethanol',
        peakData: {
          '330 nm': 'π→π* transition of extended conjugation',
        },
      },
      {
        spectrumType: 'IR' as const,
        title: 'IR_dibenzalacetone.pdf',
        caption: 'Figure 2: IR Spectrum (KBr pellet)',
        peakData: {
          '1650 cm⁻¹': 'C=O stretch (conjugated ketone)',
          '1590 cm⁻¹': 'C=C stretch (vinyl)',
          '980 cm⁻¹': 'trans C=C-H bend',
        },
      },
    ],
  },
  {
    boxFolderId: '354210879813',
    experimentId: 'EXP-005',
    title: 'Diels-Alder Reaction: Anthracene-Maleic Anhydride Adduct',
    objective: 'To perform a Diels-Alder cycloaddition reaction between anthracene and maleic anhydride.',
    hypothesis: 'Heating anthracene (diene) with maleic anhydride (dienophile) will produce a [4+2] cycloadduct.',
    status: 'draft' as const,
    protocolSteps: [
      'Add 1.0 g of anthracene to a 50 mL round-bottom flask.',
      'Add 0.5 g of maleic anhydride.',
      'Add 10 mL of xylene as solvent.',
      'Set up a reflux condenser and heat to reflux for 30 minutes.',
      'Cool the reaction mixture slowly to room temperature.',
      'Further cool in an ice bath to complete crystallization.',
      'Collect the product by vacuum filtration.',
      'Wash with cold petroleum ether.',
      'Dry and determine melting point. Expected: 262-264°C.',
    ],
    reagents: [
      { name: 'Anthracene', amount: 1.0, unit: 'g', molarAmount: 0.0056, observations: 'White crystalline solid, slight blue fluorescence' },
      { name: 'Maleic Anhydride', amount: 0.5, unit: 'g', molarAmount: 0.0051, observations: 'White crystalline solid' },
      { name: 'Xylene', amount: 10, unit: 'mL', molarAmount: null, observations: 'Technical grade, mixture of isomers' },
    ],
    yieldData: null,
    spectra: [],
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // 1. Create or find demo user
    console.log('Creating demo user...');
    let user = await db.query.users.findFirst({
      where: eq(schema.users.boxUserId, demoUser.boxUserId),
    });

    if (!user) {
      const [newUser] = await db.insert(schema.users).values(demoUser).returning();
      user = newUser;
      console.log(`  ✓ Created user: ${user.name}`);
    } else {
      console.log(`  ✓ Found existing user: ${user.name}`);
    }

    // 2. Create demo projects
    console.log('\nCreating demo projects...');
    for (const project of demoProjects) {
      const existing = await db.query.projects.findFirst({
        where: eq(schema.projects.boxFolderId, project.boxFolderId),
      });

      if (!existing) {
        await db.insert(schema.projects).values({
          ...project,
          createdById: user.id,
        });
        console.log(`  ✓ Created project: ${project.projectName}`);
      } else {
        console.log(`  ✓ Project exists: ${project.projectName}`);
      }
    }

    // Get the first project for experiments
    const mainProject = await db.query.projects.findFirst({
      where: eq(schema.projects.boxFolderId, demoProjects[0].boxFolderId),
    });

    // 3. Create demo experiments with all data
    console.log('\nCreating demo experiments...');
    for (const exp of demoExperiments) {
      // Check if experiment exists
      let experiment = await db.query.experiments.findFirst({
        where: eq(schema.experiments.boxFolderId, exp.boxFolderId),
      });

      if (!experiment) {
        const [newExp] = await db.insert(schema.experiments).values({
          boxFolderId: exp.boxFolderId,
          projectId: mainProject!.id,
          experimentId: exp.experimentId,
          title: exp.title,
          objective: exp.objective,
          hypothesis: exp.hypothesis,
          status: exp.status,
          authorId: user.id,
          startedAt: new Date(),
        }).returning();
        experiment = newExp;
        console.log(`  ✓ Created experiment: ${exp.title}`);
      } else {
        console.log(`  ✓ Experiment exists: ${exp.title}`);
      }

      // Add protocol steps
      const existingSteps = await db.query.protocolSteps.findFirst({
        where: eq(schema.protocolSteps.experimentId, experiment.id),
      });

      if (!existingSteps) {
        for (let i = 0; i < exp.protocolSteps.length; i++) {
          await db.insert(schema.protocolSteps).values({
            experimentId: experiment.id,
            stepNumber: i + 1,
            instruction: exp.protocolSteps[i],
          });
        }
        console.log(`    + Added ${exp.protocolSteps.length} protocol steps`);
      }

      // Add reagents
      const existingReagents = await db.query.reagents.findFirst({
        where: eq(schema.reagents.experimentId, experiment.id),
      });

      if (!existingReagents) {
        for (const reagent of exp.reagents) {
          await db.insert(schema.reagents).values({
            experimentId: experiment.id,
            name: reagent.name,
            amount: reagent.amount.toString(),
            unit: reagent.unit,
            molarAmount: reagent.molarAmount?.toString() || null,
            observations: reagent.observations,
          });
        }
        console.log(`    + Added ${exp.reagents.length} reagents`);
      }

      // Add yield data
      if (exp.yieldData) {
        const existingYield = await db.query.yields.findFirst({
          where: eq(schema.yields.experimentId, experiment.id),
        });

        if (!existingYield) {
          const percentage = ((exp.yieldData.actual / exp.yieldData.theoretical) * 100).toFixed(2);
          await db.insert(schema.yields).values({
            experimentId: experiment.id,
            productName: exp.yieldData.productName,
            theoretical: exp.yieldData.theoretical.toString(),
            actual: exp.yieldData.actual.toString(),
            percentage: percentage,
            unit: exp.yieldData.unit,
          });
          console.log(`    + Added yield data: ${percentage}% yield`);
        }
      }

      // Add spectra
      const existingSpectra = await db.query.spectra.findFirst({
        where: eq(schema.spectra.experimentId, experiment.id),
      });

      if (!existingSpectra && exp.spectra.length > 0) {
        for (const spectrum of exp.spectra) {
          await db.insert(schema.spectra).values({
            experimentId: experiment.id,
            spectrumType: spectrum.spectrumType,
            title: spectrum.title,
            caption: spectrum.caption,
            peakData: spectrum.peakData,
          });
        }
        console.log(`    + Added ${exp.spectra.length} spectra`);
      }
    }

    console.log('\n✅ Database seed complete!');
    console.log('\nDemo data summary:');
    console.log(`  - Users: 1`);
    console.log(`  - Projects: ${demoProjects.length}`);
    console.log(`  - Experiments: ${demoExperiments.length}`);
    console.log(`  - Protocol steps: ${demoExperiments.reduce((acc, e) => acc + e.protocolSteps.length, 0)}`);
    console.log(`  - Reagents: ${demoExperiments.reduce((acc, e) => acc + e.reagents.length, 0)}`);
    console.log(`  - Yield records: ${demoExperiments.filter(e => e.yieldData).length}`);
    console.log(`  - Spectra: ${demoExperiments.reduce((acc, e) => acc + e.spectra.length, 0)}`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seedDatabase();
