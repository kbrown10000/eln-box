import BoxSDK from 'box-node-sdk';

export type BoxClient = any;

let cachedClient: BoxClient | null = null;

/**
 * Validate all required Box environment variables are present
 * Fails fast with clear error messages
 */
function validateBoxEnvVars(): void {
  const required = [
    'BOX_CLIENT_ID',
    'BOX_CLIENT_SECRET',
    'BOX_ENTERPRISE_ID',
    'BOX_PUBLIC_KEY_ID',
    'BOX_PRIVATE_KEY',
    'BOX_PASSPHRASE',
    'BOX_PROJECTS_FOLDER_ID',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Box environment variables: ${missing.join(', ')}. ` +
      'Please configure all Box credentials in your environment.'
    );
  }

  // Validate BOX_PROJECTS_FOLDER_ID is not '0' (Box root)
  if (process.env.BOX_PROJECTS_FOLDER_ID === '0') {
    throw new Error(
      'BOX_PROJECTS_FOLDER_ID cannot be "0" (Box root folder). ' +
      'Please create a dedicated /ELN-Root/Projects folder and set its ID.'
    );
  }
}

/**
 * Get or create the Box SDK client instance
 * Uses JWT authentication with service account
 */
export function getBoxClient() {
  if (cachedClient) {
    return cachedClient;
  }

  // Validate all required environment variables
  validateBoxEnvVars();

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
    cachedClient = sdk.getAppAuthClient('enterprise');

    return cachedClient;
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

/**
 * Get a Box client scoped to the current user's OAuth access token.
 * This enforces Box permissions for that user.
 */
export function getUserClient(accessToken: string): BoxClient {
  if (!accessToken) {
    throw new Error('Missing Box access token for user');
  }

  if (!process.env.BOX_OAUTH_CLIENT_ID || !process.env.BOX_OAUTH_CLIENT_SECRET) {
    throw new Error('BOX_OAUTH_CLIENT_ID and BOX_OAUTH_CLIENT_SECRET are required for user Box clients');
  }

  const sdk = new BoxSDK({
    clientID: process.env.BOX_OAUTH_CLIENT_ID!,
    clientSecret: process.env.BOX_OAUTH_CLIENT_SECRET!,
  });

  return sdk.getBasicClient(accessToken);
}

// Export singleton for convenience (enterprise service account)
export const boxClient = getBoxClient;

/**
 * Get a service account access token for Box UI Elements.
 * We return the full service account token to maximize compatibility.
 */
export async function getServiceAccountToken(): Promise<{ accessToken: string; expiresIn: number; tokenType: string }> {
  const client = getBoxClient();
  const token = await client._session.getAccessToken();
  return {
    accessToken: token,
    expiresIn: 3600,
    tokenType: 'bearer',
  };
}
