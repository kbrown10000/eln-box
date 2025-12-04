const projects = [
  { name: "Project Alpha", progress: 75, color: "bg-blue-600" },
  { name: "Project Beta", progress: 40, color: "bg-blue-600" },
  { name: "Clinical Trial C", progress: 10, color: "bg-blue-600" },
];

const ProjectsOverview = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Projects Overview
      </h3>
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.name}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {project.name} ({project.progress}% Complete)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`${project.color} h-2.5 rounded-full`}
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsOverview;
