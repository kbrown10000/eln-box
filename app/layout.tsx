import type { Metadata } from "next";
import { Roboto, Roboto_Slab } from "next/font/google"; // Import both fonts
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import UserMenu from "./components/UserMenu";
import BeakerIcon from "./components/BeakerIcon"; // Import BeakerIcon

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
    <html lang="en" suppressHydrationWarning className={`${roboto.variable} ${robotoSlab.variable}`}>
      <body className="font-body antialiased">
        <AuthProvider>
          <header className="bg-primary text-white shadow-md"> {/* Updated header background and text color */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <a href="/" className="flex items-center">
                      <BeakerIcon /> {/* Use BeakerIcon component */}
                      <span className="ml-2 text-xl font-bold font-heading"> {/* Apply font-heading */}
                        LabNoteX
                      </span>
                    </a>
                  </div>
                  <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-6">
                    <a
                      href="/"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-body hover:border-gray-300 hover:text-gray-200"
                    >
                      Home
                    </a>
                    <a
                      href="/dashboard"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-body hover:border-gray-300 hover:text-gray-200"
                    >
                      Dashboard
                    </a>
                    <a
                      href="/projects"
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-body hover:border-gray-300 hover:text-gray-200"
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
          <main className="min-h-screen bg-secondary"> {/* Updated main background */}
            {children}
          </main>
          <footer className="bg-primary text-white border-t border-border-light"> {/* Updated footer background and text color */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="py-4 flex justify-between items-center text-sm font-body">
                <div>
                  <span>&copy; 2024 LabNoteX. All rights reserved.</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium">Powered by</span>
                  <span className="font-medium">Vercel</span>
                  <span className="text-gray-400">+</span>
                  <span className="font-bold text-white">box</span> {/* Changed to white for contrast */}
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}


