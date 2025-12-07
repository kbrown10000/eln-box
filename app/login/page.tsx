import { signIn } from '@/lib/auth/config';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary font-body">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white shadow-md">
              {/* Synapse Abstract Logo Icon */}
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-primary font-heading tracking-tight">
            Synapse
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            The Intelligent Lab OS
          </p>
        </div>
        
        <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800 text-center">
            Securely access your GxP compliant workspace using your organization's Box credentials.
          </p>
        </div>

        <form
          action={async () => {
            'use server';
            await signIn('box');
          }}
          className="mt-8 space-y-6"
        >
          <button
            type="submit"
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-bold rounded-lg text-primary bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-primary group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </span>
            Sign in with Box
          </button>
        </form>
        
        <p className="text-center text-xs text-gray-400 mt-8">
          &copy; 2025 USDM Life Sciences. All rights reserved.
        </p>
      </div>
    </div>
  );
}