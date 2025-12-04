import BoxSDK from 'box-node-sdk';

let cachedClient: any = null;

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

// Export singleton for convenience
export const boxClient = getBoxClient;
