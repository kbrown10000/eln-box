import { FiCloud, FiShield, FiUsers } from "react-icons/fi";

const featureCards = [
    {
      icon: <FiCloud className="h-10 w-10 text-accent" />,
      title: "Fast, Reliable & Scalable Access",
      badge: "Vercel Deployed",
    },
    {
      icon: <FiShield className="h-10 w-10 text-accent" />,
      title: "Enterprise-Grade Security & Compliance",
      badge: "Box Integrated",
    },
    {
      icon: <FiUsers className="h-10 w-10 text-accent" />,
      title: "Real-time Team Collaboration & Data Sharing",
      badge: "Team Ready",
    },
  ];

const Features = () => {
  return (
    <section id="features" className="container mx-auto px-6 py-12 lg:py-16">
      <div className="flex flex-col items-center text-center space-y-4 mb-10">
        <h2 className="text-3xl font-heading font-bold text-primary">Why LabNoteX?</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {featureCards.map((card, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center border border-border-light rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            {card.icon}
            <h3 className="text-xl font-heading font-semibold mt-4 text-primary">{card.title}</h3>
            <div className="inline-flex items-center rounded-full bg-secondary text-primary px-3 py-1 text-xs font-body font-semibold mt-2">
                {card.badge}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
