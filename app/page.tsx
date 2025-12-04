const featureCards = [
  {
    title: "Fast, Reliable, Scalable",
    body: "Vercel-hosted frontend with instant deploys, edge caching, and zero-downtime rollouts.",
    badge: "Vercel Deployed",
  },
  {
    title: "Enterprise-Grade Security",
    body: "Box-native encryption, permissions, and audit history keep research data compliant.",
    badge: "Box Integrated",
  },
  {
    title: "Collaboration and Sharing",
    body: "Real-time teamwork on experiments, entries, and attachments stored in Box.",
    badge: "Team Ready",
  },
];

const HeroPanel = () => (
  <div className="relative">
    <div className="relative z-10 rounded-3xl bg-white/10 backdrop-blur border border-white/20 shadow-2xl p-6 md:p-8">
      <div className="text-sm text-blue-50 mb-2">Lab Notebook</div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/90 text-slate-800 p-4 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs text-slate-500">Experiments</p>
              <p className="text-xl font-semibold">Aspirin Study</p>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-md">
              Active
            </span>
          </div>
          <div className="space-y-3">
            <div className="h-16 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 opacity-90"></div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Yield</span>
              <span className="font-semibold text-slate-900">84.3%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Observations</span>
              <span className="font-semibold text-slate-900">Crystalline solid</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white/80 text-slate-800 p-4 shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">Spectroscopy</p>
            <div className="h-24 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
              <div className="w-3/4 h-2 bg-gradient-to-r from-slate-400 via-slate-700 to-slate-400 rounded-full"></div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">Files</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate">IR_spectrum_aspirin.pdf</span>
                <span className="text-slate-500">250 KB</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="truncate">reaction_notes.docx</span>
                <span className="text-slate-500">18 KB</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="truncate">TLC_plate.jpg</span>
                <span className="text-slate-500">450 KB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="absolute -left-8 -bottom-10 h-48 w-48 bg-white/10 rounded-full blur-3xl"></div>
    <div className="absolute -right-10 -top-12 h-32 w-32 bg-cyan-400/30 rounded-full blur-3xl"></div>
  </div>
);

export default function Home() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_35%)]"></div>
        <div className="container mx-auto px-6 py-16 lg:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                The Future of Your Lab&apos;s Research, Powered by Box.
              </h1>
              <p className="text-lg text-blue-100 max-w-2xl">
                Seamlessly manage experiments, data, and collaboration with our Vercel-deployed platform.
                Securely store and access all content via your trusted Box account.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="/start"
                  className="bg-white text-blue-800 font-semibold px-6 py-3 rounded-md shadow-lg hover:bg-blue-50 transition"
                >
                  Start Free Trial
                </a>
                <a
                  href="/demo"
                  className="border border-white/70 text-white font-semibold px-6 py-3 rounded-md hover:bg-white/10 transition"
                >
                  Request a Demo
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <HeroPanel />
            </div>
          </div>
        </div>
        <div className="bg-white h-12 w-full -mb-1 rounded-t-[48px]"></div>
      </section>

      <section id="features" className="container mx-auto px-6 py-12 lg:py-16">
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <div className="inline-flex items-center space-x-2 rounded-full bg-blue-50 text-blue-800 px-4 py-1 text-sm font-semibold">
            <span>Trusted by scientists and IT teams</span>
          </div>
          <h2 className="text-3xl font-bold">Why LabNoteX?</h2>
          <p className="text-gray-600 max-w-2xl">
            Purpose-built for regulated research teams who need Box-grade governance with a modern ELN experience.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className="border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
                {card.badge}
              </div>
              <h3 className="text-xl font-semibold mt-4">{card.title}</h3>
              <p className="text-gray-600 mt-2">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="integration" className="bg-gray-50 py-12 lg:py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Box-First Architecture</h3>
              <p className="text-gray-700">
                Every project, experiment, entry, and attachment is stored in Box with metadata templates for structure.
                No separate database to manage, and permissions stay in sync with your Box policies.
              </p>
              <ul className="space-y-2 text-gray-700 list-disc list-inside">
                <li>Projects and experiments mapped to Box folders</li>
                <li>Entries stored as versioned markdown files in Box</li>
                <li>Attachments live alongside entries with native previews</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Current Experiment</p>
                  <p className="text-xl font-semibold text-slate-900">Acetylation Reaction</p>
                </div>
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-md">
                  Compliant
                </span>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span>Box Folder</span>
                  <span className="font-semibold text-blue-700">/Projects/ASP-001/Experiments</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Versioning</span>
                  <span className="font-semibold text-slate-900">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Signatures</span>
                  <span className="font-semibold text-slate-900">Digital signature ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Permissions</span>
                  <span className="font-semibold text-slate-900">Follows Box access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="container mx-auto px-6 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Flexible plans for your team</h3>
            <p className="text-gray-700">
              Start fast with a pilot, then scale to your entire research organization with enterprise controls.
            </p>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-blue-600"></div>
              <p className="text-gray-700">Simple seat-based pricing with Box and Vercel included.</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <p className="text-gray-700">Onboarding and template setup services available.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 shadow-lg p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Starter</h4>
              <span className="text-2xl font-bold text-blue-700">$29</span>
            </div>
            <p className="text-gray-600 mb-4">Per user per month, billed annually.</p>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li>Unlimited projects, experiments, and entries</li>
              <li>Box metadata templates preconfigured</li>
              <li>Digital signatures and versioning</li>
              <li>Team collaboration and permissions</li>
            </ul>
            <a
              href="/pricing"
              className="inline-flex mt-6 justify-center rounded-md bg-blue-700 text-white px-5 py-3 font-semibold hover:bg-blue-800 transition"
            >
              View detailed pricing
            </a>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h3 className="text-2xl font-bold">Ready to modernize your lab notebook?</h3>
            <p className="text-gray-200">Talk with our team about Box integration, compliance, and deployment.</p>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="/contact"
              className="rounded-md bg-white text-blue-800 px-5 py-3 font-semibold shadow hover:bg-blue-50 transition"
            >
              Contact Sales
            </a>
            <a
              href="/projects"
              className="rounded-md border border-white/60 text-white px-5 py-3 font-semibold hover:bg-white/10 transition"
            >
              View Projects
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
