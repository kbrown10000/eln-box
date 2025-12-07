import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary text-white font-body overflow-hidden relative">
      {/* Abstract Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      </div>

      {/* Hero Section */}
      <div className="relative container mx-auto px-6 pt-20 pb-32 text-center z-10">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm text-cyan-400 text-sm font-medium tracking-wide animate-fade-in">
          THE FUTURE OF LIFE SCIENCES IS HERE
        </div>
        
        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-8 leading-tight">
          Accelerate Discovery with <br />
          <span className="text-gradient">Intelligent Architecture</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
          Synapse is the operating system for modern R&D. We fuse Box's content cloud with Vercel's edge intelligence to deliver a GxP-compliant platform that thinks as fast as you do.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link 
            href="/dashboard" 
            className="group relative px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
          >
            Launch Platform
            <span className="absolute inset-0 rounded-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></span>
          </Link>
          <Link 
            href="/about" 
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg border border-slate-600 transition-all"
          >
            Explore Architecture
          </Link>
        </div>

        {/* Simulated Video/Hero Image Placeholder */}
        <div className="mt-20 relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-700 group cursor-pointer">
          <div className="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden">
             {/* Fallback visual if image fails */}
             <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 opacity-80"></div>
             <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30"></div>
             
             {/* Text Overlay */}
             <div className="relative z-10 text-center">
                <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/20 group-hover:scale-110 transition-transform">
                   <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <h3 className="text-2xl font-heading font-bold text-white tracking-widest">VISION 2030</h3>
                <p className="text-cyan-400 text-sm uppercase tracking-widest mt-2">Powered by Veo 3</p>
             </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="relative bg-slate-900/50 border-t border-slate-800 py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-6 text-cyan-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Generative Protocols</h3>
              <p className="text-slate-400">
                Describe your science in plain English. Our Gemini-powered agents generate compliant, step-by-step protocols instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 text-purple-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Universal Ingestion</h3>
              <p className="text-slate-400">
                Upload any instrument file—PDF, Image, Raw Text. Synapse extracts structured data (peaks, yields) and populates your database automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 text-blue-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">GxP at the Core</h3>
              <p className="text-slate-400">
                Built on Box's validated content cloud. Every action is logged, every file is versioned, and every signature is Part 11 compliant.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
