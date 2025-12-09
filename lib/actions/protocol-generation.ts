'use server';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { logActivity } from '@/lib/actions/audit';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateProtocol(userPrompt: string, experimentFolderId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  try {
    const { object: protocol } = await generateObject({
      model: google('gemini-1.5-flash-latest'),
      schema: z.object({
        title: z.string().optional(),
        objective: z.string().optional(),
        hypothesis: z.string().optional(),
        steps: z.array(z.object({
          instruction: z.string(),
          expectedResult: z.string().optional(),
          reagents: z.array(z.string()).optional(), // Simple list of reagent names
        })),
        notes: z.string().optional(),
      }),
      prompt: `You are an expert chemist and lab assistant. Generate a detailed, step-by-step experimental protocol based on the following request.
               Focus on safety, clarity, and scientific accuracy. Include reagents if necessary.
               Format the output as a JSON object strictly following the provided Zod schema.

               User request: "${userPrompt}"`,
    });

    await logActivity('generate_protocol_ai', 'experiment', experimentFolderId, {
      userPrompt: userPrompt,
      generatedProtocolTitle: protocol.title || 'N/A',
      numSteps: protocol.steps.length,
    });

    return protocol;
  } catch (error: any) {
    console.error('Error generating protocol with Gemini:', error);
    throw new Error(error.message || 'Failed to generate protocol');
  }
}
