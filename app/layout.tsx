import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LabNoteX - Secure, Cloud-Based Research",
  description:
    "Seamlessly manage your experiments, data, and collaboration with our Vercel-deployed platform. Securely store and access all content via your trusted Box account.",
};

const BeakerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 inline-block mr-2 text-white"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 3h15" />
    <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
    <path d="M6 14h12" />
  </svg>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-800`}>
        <header className="bg-[#001E4C] text-white shadow-md">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="/" className="flex items-center">
              <BeakerIcon />
              <span className="text-2xl font-bold">LabNoteX</span>
            </a>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="hover:text-blue-300">Features</a>
              <a href="#" className="hover:text-blue-300">Pricing</a>
              <a href="#" className="hover:text-blue-300">Box Integration</a>
              <a href="#" className="hover:text-blue-300">Contact</a>
              <a
                href="#"
                className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Login / Sign Up
              </a>
            </nav>
            <button className="md:hidden flex items-center">
              <svg viewBox="0 0 20 20" fill="currentColor" className="menu w-6 h-6">
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </header>

        <main>{children}</main>

        <footer className="bg-white border-t mt-12">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex space-x-4">
                <a href="#" className="hover:underline">Privacy Policy</a>
                <a href="#" className="hover:underline">Terms of Service</a>
                <a href="#" className="hover:underline">Vercel Status</a>
                <a href="#" className="hover:underline">Box Partner Portal</a>
              </div>
              <div className="flex items-center space-x-2">
                <span>▲ Vercel</span>
                <span>|</span>
                <span className="font-bold">box</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
