'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/projects';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">LabNoteX</h1>
            <p className="text-gray-600 mt-2">Secure, Cloud-Based Research</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {error === 'OAuthCallback'
                  ? 'There was a problem signing in. Please try again.'
                  : error === 'AccessDenied'
                  ? 'Access denied. Please contact your administrator.'
                  : 'An error occurred. Please try again.'}
              </p>
            </div>
          )}

          {/* Sign In Button */}
          <button
            onClick={() => signIn('box', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 bg-[#0061D5] hover:bg-[#0052B4] text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Sign in with Box
          </button>

          {/* Info Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Sign in with your Box account to access your lab notebooks.
              Your data stays secure in your Box folders.
            </p>
          </div>

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-1">🔒</div>
                <p className="text-xs text-gray-500">Secure</p>
              </div>
              <div>
                <div className="text-2xl mb-1">☁️</div>
                <p className="text-xs text-gray-500">Cloud-Based</p>
              </div>
              <div>
                <div className="text-2xl mb-1">📊</div>
                <p className="text-xs text-gray-500">Scientific</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Powered by Box and Vercel
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
