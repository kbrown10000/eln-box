'use server';

import { getBoxClient } from '@/lib/box/client';
import { auth } from '@/lib/auth/config';
import { logActivity } from '@/lib/actions/audit';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod'; // For schema validation
import { Readable } from 'stream';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function ingestInstrumentFile(boxFileId: string, experimentFolderId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const client = getBoxClient();

  try {
    // 1. Download file stream from Box
    const fileInfo = await client.files.getFileById(boxFileId);
    
    // Ensure the file is not too large for Gemini Vision (e.g., 20MB limit)
    // For now, proceeding directly. If errors, will need size check.

    const downloadStream = await client.files.downloadFile(boxFileId);

    // Convert stream to Buffer (Gemini Vision needs Buffer or Blob)
    const chunks: Buffer[] = [];
    for await (const chunk of downloadStream as AsyncIterable<Buffer>) { // Cast to AsyncIterable<Buffer>
        chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Determine MIME type for Gemini
    // Box SDK provides contentType, but it might be generic like 'application/octet-stream' for images without extension
    // Heuristically check extension if contentType is not specific enough
    let mimeType = fileInfo.contentType || 'application/octet-stream';
    const fileName = fileInfo.name || '';
    if (mimeType === 'application/octet-stream') {
        if (fileName.endsWith('.pdf')) mimeType = 'application/pdf';
        else if (fileName.match(/\.(jpg|jpeg)$/i)) mimeType = 'image/jpeg';
        else if (fileName.endsWith('.png')) mimeType = 'image/png';
        else if (fileName.endsWith('.gif')) mimeType = 'image/gif';
    }
    
    // Gemini vision supports PDF, PNG, JPEG, WEBP, HEIC
    if (!['image/jpeg', 'image/png', 'application/pdf', 'image/gif'].includes(mimeType)) {
        throw new Error(`Unsupported file type for Gemini Vision: ${mimeType}. Only PDF, JPG, PNG, GIF currently supported for ingestion.`);
    }

    // 2. Send to Gemini 1.5 Pro (multimodal)
    const { object: extractedData } = await generateObject({
      model: google.generativeAI(process.env.GEMINI_MODEL_ID || 'gemini-1.5-pro', {
        maxTokens: 4096, // Reasonable token limit for structured output
        temperature: 0.1, // Keep it low for factual extraction
      }),
      schema: z.object({
        yields: z.array(z.object({
          productName: z.string().optional(),
          theoretical: z.number().optional(),
          actual: z.number().optional(),
          percentage: z.number().optional(),
          unit: z.string().optional(),
        })).optional(),
        spectra: z.array(z.object({
          spectrumType: z.enum(['IR', 'NMR', 'MS', 'UV-Vis', 'other']),
          title: z.string(),
          caption: z.string().optional(),
          peakData: z.record(z.string(), z.string()).optional(), // Simple string-string map for peaks
        })).optional(),
        reagents: z.array(z.object({
          name: z.string(),
          amount: z.number().optional(),
          unit: z.string().optional(),
          molarAmount: z.number().optional(),
          observations: z.string().optional(),
        })).optional(),
        notes: z.string().optional(),
      }),
      prompt: `You are an expert lab assistant. Analyze the provided instrument file (image or PDF).
               Extract any quantifiable data for chemical experiments, specifically:
               - Chemical yields (product name, theoretical, actual, percentage, unit)
               - Spectroscopic data (type, title, caption, key peak data like '1H NMR' peaks, 'IR' wavenumbers)
               - Reagent information (name, amount, unit, molar amount, observations)
               - Any general notes or observations.
               Format the output as a JSON object strictly following the provided Zod schema.
               If you find multiple items for a category, list them all in the array.
               If a field is not found, omit it or set to null/undefined.
               Be precise with numbers and units.
               Example for peakData: {"1H NMR (CDC3)": "7.26 (s, 1H), 7.0-7.1 (m, 4H)", "IR (cm-1)": "3300, 1700, 1600"}.`,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `Analyze this instrument file named "${fileName}":` },
            { type: 'image', mimeType: mimeType, image: fileBuffer },
          ],
        },
      ],
    });

    await logActivity('ingest_instrument_file', 'file', boxFileId, {
      fileName: fileInfo.name,
      extractedData: extractedData,
      experimentFolderId: experimentFolderId,
    });

    return extractedData;

  } catch (error: any) {
    console.error('Error ingesting instrument file with Gemini:', error);
    throw new Error(error.message || 'Failed to ingest instrument file');
  }
}
