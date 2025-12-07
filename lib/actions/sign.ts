'use server';

import { getBoxClient } from '@/lib/box/client';
import { auth } from '@/lib/auth/config';
import { logActivity } from '@/lib/actions/audit';

interface Signer {
  email: string;
  role?: 'signer' | 'approver' | 'final_copy_reader';
}

export async function createSignRequest(
  fileId: string,
  signers: Signer[],
  destinationFolderId: string
) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const client = getBoxClient();

  try {
    const signRequest = await client.signRequests.createSignRequest({
      sourceFiles: [{ id: fileId, type: 'file' }],
      parentFolder: { id: destinationFolderId, type: 'folder' },
      signers: signers.map(s => ({
        email: s.email,
        role: s.role || 'signer',
      })),
      emailSubject: 'Please sign this experiment report',
      emailMessage: 'This is the final report for the experiment. Please review and sign.',
    });

    await logActivity('create_sign_request', 'file', fileId, {
      signRequestId: signRequest.id,
      signers: signers.map(s => s.email)
    });

    return signRequest;
  } catch (error: any) {
    console.error('Failed to create sign request:', error);
    throw new Error(error.message || 'Failed to create sign request');
  }
}
