import { FaCloud, FaShieldAlt, FaUsers } from "react-icons/fa";
import { FaBox } from "react-icons/fa";
import { FaShareAlt } from "react-icons/fa";

const featureCards = [
    {
      icon: <FaCloud className="h-10 w-10 text-blue-600" />,
      title: "Fast, Reliable & Scalable Access",
      badge: "Vercel Deployed",
    },
    {
      icon: <FaShieldAlt className="h-10 w-10 text-blue-600" />,
      title: "Enterprise-Grade Security & Compliance",
      badge: "Box Integrated",
    },
    {
      icon: <FaUsers className="h-10 w-10 text-blue-600" />,
      title: "Real-time Team Collaboration & Data Sharing",
      badge: "Team Ready",
    },
  ];

const Features = () => {
  return (
    <section id="features" className="container mx-auto px-6 py-12 lg:py-16">
      <div className="flex flex-col items-center text-center space-y-4 mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Why LabNoteX?</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {featureCards.map((card, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            {card.icon}
            <h3 className="text-xl font-semibold mt-4 text-gray-900">{card.title}</h3>
            <div className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold mt-2">
                {card.badge}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
