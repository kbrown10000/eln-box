import type { Metadata } from "next";
import { Roboto, Roboto_Slab } from "next/font/google"; // Import both fonts
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import BoxClientProvider from "./components/box/BoxClientProvider";
import UserMenu from "./components/UserMenu";
import BeakerIcon from "./components/BeakerIcon"; // Import BeakerIcon
import NotificationBell from "./components/NotificationBell";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"], // Specify weights you need
  variable: "--font-roboto", // Define as CSS variable
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["400", "700"], // Specify weights you need
  variable: "--font-roboto-slab", // Define as CSS variable
});

export const metadata: Metadata = {
  title: "Synapse - The Intelligent Lab OS",
  description:
    "The operating system for modern science. AI-powered, Box-centric, and GxP compliant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${roboto.variable} ${robotoSlab.variable}`}>
      <body className="font-body antialiased">
        <AuthProvider>
          <BoxClientProvider>
            <header className="bg-primary text-white shadow-md border-b border-cyan-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <a href="/" className="flex items-center gap-2 group">
                      <div className="relative w-8 h-8">
                         {/* Abstract Synapse Logo Placeholder */}
                         <div className="absolute inset-0 bg-cyan-500 rounded-full opacity-75 group-hover:animate-pulse"></div>
                         <div className="absolute inset-1 bg-white rounded-full"></div>
                      </div>
                      <span className="text-2xl font-bold font-heading tracking-tight">
                        Synapse
                      </span>
                    </a>
                  </div>
                  <div className="hidden sm:-my-px sm:ml-10 sm:flex sm:space-x-8">
                    <a
                      href="/"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                    >
                      Vision
                    </a>
                    <a
                      href="/dashboard"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                    >
                      Dashboard
                    </a>
                    <a
                      href="/projects"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                    >
                      Projects
                    </a>
                    <a
                      href="/about"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                    >
                      Platform
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <NotificationBell />
                  <UserMenu />
                </div>
              </div>
            </div>
          </header>
          <main className="min-h-screen bg-secondary selection:bg-cyan-200 selection:text-cyan-900">
            {children}
          </main>
          <footer className="bg-primary text-slate-400 border-t border-slate-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="py-8 flex flex-col md:flex-row justify-between items-center text-sm">
                <div className="mb-4 md:mb-0">
                  <span className="font-heading font-bold text-white text-lg">Synapse</span>
                  <span className="mx-2">|</span>
                  <span>&copy; 2025 USDM Life Sciences.</span>
                </div>
                <div className="flex items-center space-x-6">
                  <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
                  <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
                  <span className="hover:text-white transition-colors cursor-pointer">Compliance</span>
                </div>
              </div>
            </div>
          </footer>
          </BoxClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


