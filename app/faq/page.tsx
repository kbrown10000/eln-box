import React from 'react';

export default function TechnicalFAQPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Technical FAQ</h1>
      <p className="text-xl text-gray-600 mb-12">
        Understanding the Hybrid Architecture of LabNoteX: How Box and PostgreSQL Power Modern Science.
      </p>

      <div className="space-y-12">
        {/* Section 1: Core Architecture */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-6 border-b pb-2">
            Core Architecture & Data Flow
          </h2>
          
          <div className="space-y-8">
            <FAQItem 
              question="How do Box Metadata and PostgreSQL work together in this app?"
              answer={
                <div className="space-y-4">
                  <p>
                    LabNoteX utilizes a <strong>Hybrid Storage Architecture</strong> where Box serves as the System of Record and PostgreSQL acts as the Application State engine. They are linked by a unique <code>boxFolderId</code>.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>
                      <strong>Box (The Macro Layer):</strong> Handles the folder structure (Projects/Experiments), file storage (PDFs, Raw Data), permissions, and high-level search via Metadata Templates (Project Code, PI Name, Status). This ensures all files remain secure and compliant within your Box Enterprise instance.
                    </li>
                    <li>
                      <strong>PostgreSQL (The Micro Layer):</strong> Manages granular, structured scientific data that Box Metadata handles poorly, such as ordered lists (Protocol Steps), relational data (Reagents with specific amounts/units), and application-specific logic like Signatures and Yield Calculations.
                    </li>
                  </ul>
                  <p>
                    When you view an experiment, the app fetches the "shell" and status from Box and "hydrates" it with the detailed scientific data from the database, giving you the best of both worlds.
                  </p>
                </div>
              }
            />

            <FAQItem 
              question="Why do I need a database if I have Box?"
              answer="While Box Metadata is powerful for classification and search, it is not a relational database. Features like ordered protocol steps, complex many-to-many relationships (e.g., a Reagent used across 50 experiments), and transactional integrity for audit logs require a database. This hybrid approach prevents 'metadata bloat' in Box while keeping your files in the platform you trust."
            />

            <FAQItem 
              question="Is my data secure? Where does it live?"
              answer="Yes. All files (PDF reports, instrument outputs, images) are stored exclusively in your Box Enterprise instance, inheriting all your existing compliance policies (retention, legal holds, governance). Only the structured metadata (text fields, numbers) required for the application interface lives in the PostgreSQL database. The application uses a secure Service Account to mediate access."
            />
          </div>
        </section>

        {/* Section 2: Box Integration */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-6 border-b pb-2">
            Empowering Box
          </h2>

          <div className="space-y-8">
            <FAQItem 
              question="How does this app make Box 'more powerful'?"
              answer={
                <div className="space-y-4">
                  <p>
                    LabNoteX transforms Box from a passive file storage drive into an active <strong>Scientific Knowledge Engine</strong>:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>
                      <strong>Smart Metadata:</strong> Instead of manually tagging files, the app automatically applies structured metadata (Experiment ID, Owner, Status) to every folder and file created. This makes your scientific data instantly searchable via the Box API or Web UI.
                    </li>
                    <li>
                      <strong>AI & Automation:</strong> We leverage Box's AI capabilities (or external LLMs) to read files stored in Box, extract key data (like yield percentages or instrument parameters), and write it back as metadata. This turns "dead" PDF files into structured, queryable data points.
                    </li>
                    <li>
                      <strong>Standardization:</strong> The app enforces a consistent folder structure (`/Project/Experiment/Attachments`), preventing the "folder chaos" typical of shared drives.
                    </li>
                  </ul>
                </div>
              }
            />

            <FAQItem 
              question="Does this support Box Sign?"
              answer="Yes. The application integrates directly with Box Sign. When an experiment is completed, a PDF report is generated, uploaded to Box, and a signature request is automatically triggered for the Principal Investigator. The signed document is then stored securely back in the experiment folder, maintaining a complete digital chain of custody."
            />

            <FAQItem 
              question="Can I search for experiments using Box Search?"
              answer="Absolutely. Because we write key details (Project Code, PI Name, Experiment Status, Tags) directly to Box Metadata Templates, you can use the native Box Search (web or API) to run complex queries like 'Show me all completed experiments tagged with 'Synthesis' from 2024'—even without opening this app."
            />
          </div>
        </section>

        {/* Section 3: Functional & Technical */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-6 border-b pb-2">
            Functional & Technical
          </h2>

          <div className="space-y-8">
            <FAQItem 
              question="What happens if the database goes down?"
              answer="The application would lose access to the granular steps and reagent details, but your files and the folder structure remain safe and accessible in Box. Because the 'Macro' structure is mirrored in Box, you never lose the context of which files belong to which experiment."
            />

            <FAQItem 
              question="How does the AI Protocol Generation work?"
              answer="We use advanced Large Language Models (LLMs) like Gemini via the Vercel AI SDK. When you prompt the system (e.g., 'Create a protocol for Aspirin synthesis'), the AI generates a structured JSON response containing steps, reagents, and safety notes. This structured data is then parsed by our app and saved into the PostgreSQL database as editable protocol steps."
            />

            <FAQItem 
              question="Can I integrate this with my lab instruments?"
              answer="Yes. The 'Ingestion' feature allows you to upload raw instrument files (CSV, PDF, txt) to the Box folder. The app can then trigger an analysis pipeline to parse these files, extract relevant data (like peaks from an NMR spectrum), and automatically populate the 'Spectra' or 'Results' sections of your experiment."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-gray-900 mb-3">{question}</h3>
      <div className="text-gray-600 leading-relaxed">
        {answer}
      </div>
    </div>
  );
}
