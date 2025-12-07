import { BoxClient, BoxJwtAuth, JwtConfig, BoxDeveloperTokenAuth } from 'box-typescript-sdk-gen';

export { BoxClient };

let cachedClient: BoxClient | null = null;
let cachedAuth: BoxJwtAuth | null = null;

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

function formatPrivateKey(key: string): string {
  if (!key) return '';
  if (key.includes('\n')) {
    return key;
  }
  return key.replace(/\\n/g, '\n');
}

/**
 * Get or create the Box SDK client instance
 * Uses JWT authentication with service account
 */
export function getBoxClient() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    validateBoxEnvVars();
    
    const privateKey = formatPrivateKey(process.env.BOX_PRIVATE_KEY!);

    const jwtConfig = new JwtConfig({
      clientId: process.env.BOX_CLIENT_ID!,
      clientSecret: process.env.BOX_CLIENT_SECRET!,
      jwtKeyId: process.env.BOX_PUBLIC_KEY_ID!,
      privateKey: privateKey,
      privateKeyPassphrase: process.env.BOX_PASSPHRASE!,
      enterpriseId: process.env.BOX_ENTERPRISE_ID!,
    });

    cachedAuth = new BoxJwtAuth({ config: jwtConfig });
    cachedClient = new BoxClient({ auth: cachedAuth });

    return cachedClient;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '****************************************************************************************************\n' +
        '** WARNING: Box SDK initialization failed. This is likely because required Box environment        **\n' +
        '** variables are not set. The application will use a mock client for local development.           **\n' +
        '** Box UI Elements will not work.                                                                 **\n' +
        '****************************************************************************************************'
      );
      // Return a mock client in development to allow the app to run
      // We cast to any to avoid strict type checks on the mock
      cachedClient = {
        auth: {
          retrieveToken: async () => ({ accessToken: 'mock_token' }),
        },
      } as any;
      return cachedClient;
    } else {
      console.error('Failed to initialize Box SDK client:', error);
      throw new Error('Box SDK initialization failed. Check your environment variables.');
    }
  }
}

/**
 * Helper to get client for specific user (future: per-user permissions)
 */
export function getBoxClientForUser(userId: string) {
  // Ensure we have the base auth initialized
  getBoxClient();

  if (!cachedAuth) {
    throw new Error('Box Auth not initialized');
  }

  const userAuth = cachedAuth.withUserSubject(userId);
  return new BoxClient({ auth: userAuth });
}

/**
 * Get a Box client scoped to the current user's OAuth access token.
 * This enforces Box permissions for that user.
 */
export function getUserClient(accessToken: string): BoxClient {
  if (!accessToken) {
    throw new Error('Missing Box access token for user');
  }

  const auth = new BoxDeveloperTokenAuth({ token: accessToken });
  return new BoxClient({ auth });
}

// Export singleton for convenience (enterprise service account)
export const boxClient = getBoxClient;


