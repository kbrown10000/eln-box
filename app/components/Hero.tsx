const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-blue-600 text-white py-16 lg:py-24">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              The Future of Your Lab&apos;s Research, Powered by Box.
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl">
              Seamlessly manage your experiments, data, and collaboration with our Vercel-deployed platform.
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
          <div className="hidden lg:flex justify-center">
            {/* Placeholder for the tablet image */}
            <div className="relative w-full max-w-lg">
              <img
                src="https://via.placeholder.com/600x400/0000FF/FFFFFF?text=Tablet+App"
                alt="Lab Notebook Application on Tablet"
                className="w-full rounded-lg shadow-2xl rotate-6"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-blue-700/50 rounded-lg rotate-6"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-white transform -skew-y-3 origin-bottom-left"></div>
    </section>
  );
};

export default Hero;
