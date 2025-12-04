const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-primary text-white py-16 lg:py-24">
      {/* Subtle molecular pattern background */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="molecular-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="rgba(255,255,255,0.1)" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#molecular-pattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-heading font-bold leading-tight">
              The Future of Your Lab&apos;s Research, Powered by Box.
            </h1>
            <p className="text-lg font-body text-white max-w-2xl">
              Seamlessly manage your experiments, data, and collaboration with our Vercel-deployed platform.
              Securely store and access all content via your trusted Box account.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/dashboard"
                className="bg-accent text-white font-body font-semibold px-6 py-3 rounded-md shadow-lg hover:bg-opacity-90 transition"
              >
                Start Free Trial
              </a>
              <a
                href="/contact"
                className="border border-white/70 text-white font-body font-semibold px-6 py-3 rounded-md hover:bg-white/10 transition"
              >
                Request a Demo
              </a>
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            {/* Placeholder for the tablet image */}
            <div className="relative w-full max-w-lg">
              <img
                src="https://via.placeholder.com/600x400/0A2540/FFFFFF?text=LabNoteX+App"
                alt="Lab Notebook Application on Tablet"
                className="w-full rounded-lg shadow-2xl transform rotate-3"
              />
              <div className="absolute inset-0 bg-primary/50 rounded-lg transform rotate-3"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-secondary transform -skew-y-3 origin-bottom-left z-0"></div>
    </section>
  );
};

export default Hero;
