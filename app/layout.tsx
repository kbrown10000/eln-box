import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ELN Box - Electronic Lab Notebook",
  description: "Electronic Lab Notebook powered by Box and Vercel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <a href="/">ELN Box</a>
            </h1>
            <div className="space-x-4">
              <a href="/projects" className="hover:underline">
                Projects
              </a>
              <a href="/about" className="hover:underline">
                About
              </a>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-800 text-white p-4 mt-8">
          <div className="container mx-auto text-center">
            <p>ELN Box - Powered by Box and Vercel</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
