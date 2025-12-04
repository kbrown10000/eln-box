import BoxSDK from 'box-node-sdk';

let boxClient: any = null;

/**
 * Get or create the Box SDK client instance
 * Uses JWT authentication with service account
 */
export function getBoxClient() {
  if (boxClient) {
    return boxClient;
  }

  // Check for required environment variables
  if (!process.env.BOX_CLIENT_ID) {
    throw new Error('BOX_CLIENT_ID environment variable is required');
  }

  try {
    const sdk = BoxSDK.getPreconfiguredInstance({
      boxAppSettings: {
        clientID: process.env.BOX_CLIENT_ID!,
        clientSecret: process.env.BOX_CLIENT_SECRET!,
        appAuth: {
          publicKeyID: process.env.BOX_PUBLIC_KEY_ID!,
          privateKey: process.env.BOX_PRIVATE_KEY!.replace(/\\n/g, '\n'),
          passphrase: process.env.BOX_PASSPHRASE!,
        },
      },
      enterpriseID: process.env.BOX_ENTERPRISE_ID!,
    });

    // Service account client (acts as the app)
    boxClient = sdk.getAppAuthClient('enterprise');

    return boxClient;
  } catch (error) {
    console.error('Failed to initialize Box SDK client:', error);
    throw new Error('Box SDK initialization failed. Check your environment variables.');
  }
}

/**
 * Helper to get client for specific user (future: per-user permissions)
 */
export function getBoxClientForUser(userId: string) {
  const sdk = BoxSDK.getPreconfiguredInstance({
    boxAppSettings: {
      clientID: process.env.BOX_CLIENT_ID!,
      clientSecret: process.env.BOX_CLIENT_SECRET!,
      appAuth: {
        publicKeyID: process.env.BOX_PUBLIC_KEY_ID!,
        privateKey: process.env.BOX_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        passphrase: process.env.BOX_PASSPHRASE!,
      },
    },
    enterpriseID: process.env.BOX_ENTERPRISE_ID!,
  });

  return sdk.getAppAuthClient('user', userId);
}

// Export singleton for convenience
export const boxClient = getBoxClient;
