import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            LabNoteX: Your GxP-Compliant ELN Powered by USDM & Box
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Securely manage your entire experimental lifecycle, from protocol generation to data ingestion and digital signatures, all backed by Box and intelligent AI.
          </p>
        </div>
      </section>

      {/* The USDM Vision */}
      <section className="py-16 container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <img 
              src="/usdm-homepage.png" 
              alt="USDM Digital Solutions" 
              className="w-full rounded-xl shadow-2xl border border-gray-200"
            />
          </div>
          <h2 className="text-3xl font-heading font-bold text-primary mb-8 text-center">
            The "Hybrid Data" Architecture: Box as the GxP Source of Truth
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <p className="text-lg mb-6">
              In the regulated world of Life Sciences, data integrity is paramount. Traditional applications often fragment this data—content in one silo, data in another—creating compliance risks and slowing down commercialization.
            </p>
            <p className="text-lg mb-6">
              <strong>USDM takes a revolutionary path.</strong> We treat <strong>Box</strong> not just as storage, but as the <em>single source of truth</em> for GxP content, validated and secure. We pair it with high-performance structured data engines to drive workflows from <strong>R&D to Clinical Trials to Manufacturing</strong>.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-10">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-xl font-bold text-blue-800 mb-3">Unstructured Content (Box)</h3>
                <ul className="space-y-2 text-blue-900">
                  <li>• Clinical Protocols & SOPs</li>
                  <li>• Lab Notebook Scans & Raw Data</li>
                  <li>• Regulatory Submissions (eCTD)</li>
                  <li>• <strong>Why?</strong> Validated storage, 21 CFR Part 11 Compliance, and Audit Trails are native to Box.</li>
                </ul>
              </div>
              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-800 mb-3">Structured Logic (Database)</h3>
                <ul className="space-y-2 text-indigo-900">
                  <li>• Study Workflows & Approvals</li>
                  <li>• Sample Tracking & Chain of Custody</li>
                  <li>• Site & Investigator Relations</li>
                  <li>• <strong>Why?</strong> Enables complex logic, real-time analytics, and process automation without compromising content integrity.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elevating Box */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold text-primary mb-6">
                Elevating Box to an Application Platform
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                By wrapping Box with a specialized application layer (Vercel + Next.js), we transform it from a passive "hard drive in the cloud" into an active <strong>process engine</strong>.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Files aren't just sitting in folders; they are attached to <em>processes</em>. A PDF isn't just a file; it's a signed result of a specific experiment step. An image isn't just a JPEG; it's the evidence for a scientific conclusion.
              </p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-start gap-3">
                  <span className="bg-green-100 text-green-800 p-1 rounded-full mt-1">✓</span>
                  <span className="text-gray-700"><strong>Centralized Intelligence:</strong> All content remains in one secure, compliant Box environment. No data silos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-green-100 text-green-800 p-1 rounded-full mt-1">✓</span>
                  <span className="text-gray-700"><strong>Structure meets Flexibility:</strong> Users get the structure they need (forms, tables) without losing the flexibility of files.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-green-100 text-green-800 p-1 rounded-full mt-1">✓</span>
                  <span className="text-gray-700"><strong>AI-Powered Insights & Automation:</strong> Leverage Gemini for smart data extraction from instrument files and AI-assisted protocol generation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-green-100 text-green-800 p-1 rounded-full mt-1">✓</span>
                  <span className="text-gray-700"><strong>Integrated Digital Signatures:</strong> Streamline approvals and compliance with Box Sign integration.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-green-100 text-green-800 p-1 rounded-full mt-1">✓</span>
                  <span className="text-gray-700"><strong>Robust Audit Trails:</strong> Comprehensive logging of all actions for full traceability and GxP compliance.</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center">
              {/* Visual abstraction of the architecture */}
              <div className="text-center space-y-4">
                <div className="bg-white p-4 rounded shadow-md w-64 mx-auto">Application Layer (Workflow)</div>
                <div className="h-8 w-0.5 bg-gray-400 mx-auto"></div>
                <div className="flex justify-center gap-4">
                  <div className="bg-[#0061D5] text-white p-4 rounded shadow-md w-32">Box Content</div>
                  <div className="bg-[#00C7B7] text-white p-4 rounded shadow-md w-32">Neon Data</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beyond the ELN */}
      <section className="py-16 container mx-auto px-6">
        <h2 className="text-3xl font-heading font-bold text-primary mb-12 text-center">
          Validation, Testing & Trust
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-xl hover:shadow-lg transition bg-white">
            <h3 className="text-xl font-bold mb-3 text-accent">Workflow & Process</h3>
            <p className="text-gray-600">
              From <strong>Legal Case Management</strong> to <strong>Creative Asset Approval</strong>, USDM's Box-Centric apps drive the process while ensuring every document version is tracked, compliant, and audit-ready.
            </p>
          </div>
          <div className="p-6 border rounded-xl hover:shadow-lg transition bg-white">
            <h3 className="text-xl font-bold mb-3 text-accent">AI & Intelligent Agents</h3>
            <p className="text-gray-600">
              Hosting on Vercel opens the door to <strong>Compliance-Aware AI Agents</strong>. Imagine an agent that pre-validates a protocol against SOPs stored in Box, or automatically extracts adverse event data for reporting.
            </p>
          </div>
          <div className="p-6 border rounded-xl hover:shadow-lg transition bg-white">
            <h3 className="text-xl font-bold mb-3 text-accent">Enterprise Integration</h3>
            <p className="text-gray-600">
              This architecture is an <strong>Integration Hub</strong>. We pull structured data from Salesforce, SAP, or Veeva and marry it with unstructured content in Box, providing a unified, validated view for decision makers.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-secondary text-primary py-16 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Ready to Scale Your Science?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the USDM difference. Compliant, Scalable, and Box-Centric.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition">
              Back to Home
            </Link>
            <Link href="/dashboard" className="bg-white text-primary border border-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition">
              Explore the Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
