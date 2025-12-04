import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import UserMenu from "./components/UserMenu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LabNoteX - Secure, Cloud-Based Research",
  description:
    "Seamlessly manage your experiments, data, and collaboration with our Vercel-deployed platform. Securely store and access all content via your trusted Box account.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <header className="bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <a href="/" className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
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
                      <span className="ml-2 text-xl font-bold text-gray-800">
                        LabNoteX
                      </span>
                    </a>
                  </div>
                  <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-6">
                    <a
                      href="/"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Home
                    </a>
                    <a
                      href="/dashboard"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Dashboard
                    </a>
                    <a
                      href="/projects"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Projects
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <UserMenu />
                </div>
              </div>
            </div>
          </header>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <footer className="bg-white border-t">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="py-4 flex justify-between items-center text-sm text-gray-500">
                <div>
                  <span>&copy; 2024 LabNoteX. All rights reserved.</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium">Powered by</span>
                  <span className="font-medium">▲ Vercel</span>
                  <span className="text-gray-400">+</span>
                  <span className="font-bold text-blue-600">box</span>
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
