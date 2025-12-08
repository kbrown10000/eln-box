import { BoxClient, BoxJwtAuth, JwtConfig } from 'box-typescript-sdk-gen';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function inspectTemplate() {
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

  try {
    const template = await client.metadataTemplates.getMetadataTemplate('enterprise', 'experimentMetadata');
    console.log('Template Fields:', JSON.stringify(template.fields, null, 2));
  } catch (e) {
    console.error(e);
  }
}

inspectTemplate();

