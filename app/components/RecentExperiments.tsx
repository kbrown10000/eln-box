const experiments = [
  {
    name: "Gene Expression Analysis",
    scientist: "Dr. B. Lee",
    time: "Today",
  },
  {
    name: "Cell Culture Passage",
    scientist: "Dr. A. Chemist",
    time: "Yesterday",
  },
  { name: "HPLC Run", scientist: "T. Student", time: "Yesterday" },
  { name: "HPLC Run", scientist: "T. Student", time: "Yesterday" },
];

const RecentExperiments = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Experiments
        </h3>
        <button className="text-gray-500 hover:text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        {experiments.map((exp, index) => (
          <div key={index} className="border-b pb-2">
            <p className="font-semibold text-gray-800">{exp.name}</p>
            <p className="text-sm text-gray-600">
              ({exp.scientist}, {exp.time})
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentExperiments;
