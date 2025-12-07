import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            The Architecture of Innovation
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90 text-gray-200">
            Synapse bridges the gap between unstructured content and structured data, powered by USDM's Cloud Assurance technology.
          </p>
        </div>
      </section>

      {/* Architecture Diagram Section */}
      <section className="py-16 container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 bg-white p-4 rounded-2xl shadow-xl border border-gray-200">
            <img 
              src="/images/architecture.png" 
              alt="Synapse Platform Architecture" 
              className="w-full rounded-xl"
            />
          </div>
          
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-heading font-bold text-primary mb-6">
              Why Box + Vercel + AI?
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Traditional ELNs force you to migrate your data into their proprietary formats. Synapse leaves your data where it belongs—in <strong>Box</strong>—while adding a layer of intelligent application logic on top using <strong>Vercel</strong> and <strong>Google Gemini</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-2xl font-bold text-primary mb-4">The "Content" Layer (Box)</h3>
              <p className="text-gray-600 mb-4">
                We use Box as the <strong>System of Record</strong>. Every protocol, result, and image is stored as a native Box file.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2"><span className="text-accent">●</span> 21 CFR Part 11 Compliance</li>
                <li className="flex items-center gap-2"><span className="text-accent">●</span> Enterprise-grade Security</li>
                <li className="flex items-center gap-2"><span className="text-accent">●</span> Version History & Metadata</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-2xl font-bold text-primary mb-4">The "Intelligence" Layer (App)</h3>
              <p className="text-gray-600 mb-4">
                The Synapse app provides the <strong>System of Engagement</strong>. It adds the scientific context, workflow, and AI capabilities.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2"><span className="text-accent">●</span> AI Protocol Generation</li>
                <li className="flex items-center gap-2"><span className="text-accent">●</span> Structured Data Extraction</li>
                <li className="flex items-center gap-2"><span className="text-accent">●</span> Approval Workflows</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-white py-16 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Lab?</h2>
          <div className="flex justify-center gap-4">
            <Link href="/" className="bg-white/10 text-white border border-white/30 px-8 py-3 rounded-lg font-bold hover:bg-white/20 transition">
              Back to Home
            </Link>
            <Link href="/dashboard" className="bg-accent text-primary px-8 py-3 rounded-lg font-bold hover:bg-accent-hover transition">
              Start Exploring
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}