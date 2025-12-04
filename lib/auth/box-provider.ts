import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers';

export interface BoxProfile {
  id: string;
  type: string;
  name: string;
  login: string;
  created_at: string;
  modified_at: string;
  language: string;
  timezone: string;
  space_amount: number;
  space_used: number;
  max_upload_size: number;
  status: string;
  job_title: string;
  phone: string;
  address: string;
  avatar_url: string;
}

export default function BoxProvider<P extends BoxProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: 'box',
    name: 'Box',
    type: 'oauth',
    authorization: {
      url: 'https://account.box.com/api/oauth2/authorize',
      params: { scope: '' }, // Box doesn't use scope in the same way
    },
    token: 'https://api.box.com/oauth2/token',
    userinfo: 'https://api.box.com/2.0/users/me',
    profile(profile) {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.login,
        image: profile.avatar_url,
      };
    },
    style: {
      bg: '#0061D5',
      text: '#fff',
    },
    options,
  };
}
