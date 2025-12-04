import NextAuth from 'next-auth';
import type { NextAuthConfig, Session, User } from 'next-auth';
import type { JWT } from '@auth/core/jwt';
import BoxProvider from './box-provider';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      boxUserId: string;
      name: string;
      email: string;
      image?: string;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    boxUserId?: string;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

// Refresh access token
async function refreshAccessToken(token: any) {
  try {
    const response = await fetch('https://api.box.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
        client_id: process.env.BOX_OAUTH_CLIENT_ID!,
        client_secret: process.env.BOX_OAUTH_CLIENT_SECRET!,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    BoxProvider({
      clientId: process.env.BOX_OAUTH_CLIENT_ID!,
      clientSecret: process.env.BOX_OAUTH_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // Create or update user in database
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.boxUserId, user.id!))
          .limit(1);

        let dbUser;
        if (existingUser.length === 0) {
          // Create new user
          const [newUser] = await db
            .insert(users)
            .values({
              boxUserId: user.id!,
              email: user.email!,
              name: user.name!,
              avatarUrl: user.image,
              role: 'researcher', // Default role
            })
            .returning();
          dbUser = newUser;
        } else {
          dbUser = existingUser[0];
          // Update user info
          await db
            .update(users)
            .set({
              email: user.email!,
              name: user.name!,
              avatarUrl: user.image,
              updatedAt: new Date(),
            })
            .where(eq(users.boxUserId, user.id!));
        }

        return {
          id: dbUser.id,
          boxUserId: user.id,
          role: dbUser.role,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: Date.now() + (account.expires_in as number) * 1000,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.boxUserId = token.boxUserId as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.accessTokenExpires = token.accessTokenExpires as number;
        session.error = token.error as string | undefined;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = request.nextUrl.pathname.startsWith('/login');
      const isOnApiAuth = request.nextUrl.pathname.startsWith('/api/auth');
      const isPublicPath = request.nextUrl.pathname === '/' ||
                          request.nextUrl.pathname.startsWith('/_next') ||
                          request.nextUrl.pathname === '/favicon.ico';

      // Allow public paths and auth API
      if (isPublicPath || isOnApiAuth) {
        return true;
      }

      // Redirect logged-in users away from login page
      if (isOnLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/projects', request.nextUrl));
        }
        return true;
      }

      // Require auth for all other paths
      return isLoggedIn;
    },
  },
  session: {
    strategy: 'jwt',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
