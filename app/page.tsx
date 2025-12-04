export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Welcome to ELN Box</h1>

        <p className="text-lg mb-6">
          ELN Box is an Electronic Lab Notebook system that stores all your research data in Box,
          with a modern web interface powered by Next.js and Vercel.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div className="border rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-semibold mb-3">Features</h2>
            <ul className="space-y-2">
              <li>✅ All data stored in Box (files + metadata)</li>
              <li>✅ Hierarchical organization (Projects → Experiments → Entries)</li>
              <li>✅ Native Box versioning and permissions</li>
              <li>✅ Markdown-based entries</li>
              <li>✅ File attachments (images, data, reports)</li>
              <li>✅ Digital signatures and compliance tracking</li>
            </ul>
          </div>

          <div className="border rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-semibold mb-3">Quick Start</h2>
            <ol className="space-y-2 list-decimal list-inside">
              <li>Create a new project</li>
              <li>Add experiments to your project</li>
              <li>Write entries documenting your work</li>
              <li>Attach files and data</li>
              <li>Sign and lock completed work</li>
            </ol>
          </div>
        </div>

        <div className="text-center mt-8">
          <a
            href="/projects"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            View Projects
          </a>
        </div>

        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">Architecture</h2>
          <p className="mb-4">
            This application uses a Box-first architecture where Box is the single source of truth:
          </p>
          <ul className="space-y-2 ml-6 list-disc">
            <li><strong>Box:</strong> Stores all files, folders, and structured metadata</li>
            <li><strong>Vercel:</strong> Hosts the Next.js frontend and API routes</li>
            <li><strong>No Database:</strong> All persistent data lives in Box</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
