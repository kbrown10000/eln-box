import Image from "next/image";

const CloudIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-blue-600 mb-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-blue-600 mb-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a12.02 12.02 0 009 2.056 12.02 12.02 0 009-2.056c0-3.333-1.423-6.41-3.618-8.618z"
    />
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-blue-600 mb-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.184-1.268-.5-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.184-1.268.5-1.857m0 0a5.002 5.002 0 019 0m0 0a5 5 0 005 5m-5-5a5 5 0 00-9 0"
    />
  </svg>
);


export default function Home() {
  return (
    <>
      <div className="bg-[#001E4C] text-white">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                The Future of Your Lab's Research, Powered by Box.
              </h1>
              <p className="text-lg md:text-xl text-blue-200 mb-8">
                Seamlessly manage your experiments, data, and collaboration with our Vercel-deployed platform. Securely store and access all content via your trusted Box account.
              </p>
              <a
                href="#"
                className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-md hover:bg-gray-200"
              >
                Start Free Trial
              </a>
            </div>
            <div className="md:w-1/2">
              {/* Placeholder for tablet image */}
              <div className="bg-gray-700 w-full h-80 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Tablet Image Placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why LabNoteX?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8 border border-gray-200 rounded-lg shadow-sm">
              <CloudIcon />
              <h3 className="text-xl font-semibold mb-2">Fast, Reliable & Scalable Access</h3>
              <p className="text-gray-600">Vercel Deployed</p>
            </div>
            <div className="p-8 border border-blue-600 rounded-lg shadow-lg">
              <ShieldIcon />
              <h3 className="text-xl font-semibold mb-2">Enterprise-Grade Security & Compliance</h3>
              <p className="text-gray-600">Box Integrated</p>
            </div>
            <div className="p-8 border border-gray-200 rounded-lg shadow-sm">
              <UsersIcon />
              <h3 className="text-xl font-semibold mb-2">Real-time Team Collaboration & Data Sharing</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
