import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-secondary font-body relative">
      
      {/* Hero Section with Background Image */}
      <div className="relative w-full h-[800px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-bg.png')" }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 hero-overlay"></div>

        {/* Content */}
        <div className="relative container mx-auto px-6 h-full flex flex-col justify-center items-center text-center text-white z-10 pt-20">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-accent font-medium tracking-wide animate-fade-in">
            POWERED BY USDM LIFE SCIENCES
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight drop-shadow-lg">
            The Intelligent Lab OS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">Built on Box</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-md">
            Synapse unifies your scientific data, documents, and workflows in one GxP-compliant platform. No silos. No compromises. Just science.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 bg-accent hover:bg-accent-hover text-primary font-bold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Launch Platform
            </Link>
            <Link 
              href="/about" 
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-lg border border-white/30 transition-all"
            >
              Our Vision
            </Link>
          </div>
        </div>
      </div>

      {/* Vision Video Section */}
      <div className="relative -mt-32 z-20 container mx-auto px-6 pb-24">
        <div className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 group cursor-pointer bg-black">
          <div className="aspect-video relative">
             {/* Video Thumbnail Image */}
             <img 
               src="/images/video-thumb.png" 
               alt="Vision 2030 Video" 
               className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
             />
             
             {/* Play Button Overlay */}
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform duration-300">
                   <svg className="w-8 h-8 text-white fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
             </div>
             
             <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-2xl font-heading font-bold text-white tracking-wide">VISION 2030</h3>
                <p className="text-accent text-sm uppercase tracking-widest mt-1">The Future of Digital Trust</p>
             </div>
          </div>
        </div>
      </div>

      {/* Value Props */}
      <div className="bg-white py-24 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">Why Synapse?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">We combined the content management power of Box with the speed of the Vercel edge to create a system that actually works the way scientists do.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-8 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group">
              <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center mb-6 text-white group-hover:bg-accent transition-colors">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">AI-Ready Data</h3>
              <p className="text-gray-600">
                Unstructured PDFs and images are automatically ingested and converted into structured data using Gemini Multimodal AI models.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group">
              <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center mb-6 text-white group-hover:bg-accent transition-colors">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">Compliance Built-In</h3>
              <p className="text-gray-600">
                Leverage Box's 21 CFR Part 11 compliance for all storage. Every file version, access log, and signature is audit-ready by default.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group">
              <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center mb-6 text-white group-hover:bg-accent transition-colors">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">Workflow Automation</h3>
              <p className="text-gray-600">
                Move from "Draft" to "Signed" seamlessly. Our state engine manages approvals, notifications, and locking logic for you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}