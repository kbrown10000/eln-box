import { FaFileAlt, FaCalendarAlt } from "react-icons/fa";

const feed = [
  {
    icon: (
      <img
        className="h-8 w-8 rounded-full"
        src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        alt=""
      />
    ),
    text: "Dr. Lee shared 'PCR_results.xlsx' via Box in Project Alpha.",
    time: "3 minutes ago",
  },
  {
    icon: <FaCalendarAlt className="h-6 w-6 text-gray-400" />,
    text: "Meeting scheduled for Friday regarding Project Beta.",
    time: "17 months ago",
  },
];

const CollaborationFeed = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Collaboration Feed
      </h3>
      <div className="space-y-6">
        {feed.map((item, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0">{item.icon}</div>
            <div>
              <p className="text-sm text-gray-700">{item.text}</p>
              <p className="text-xs text-gray-500">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaborationFeed;
