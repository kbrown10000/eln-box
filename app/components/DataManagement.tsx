import { FaBox } from "react-icons/fa";

const DataManagement = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Data Management
        </h3>
        <FaBox className="text-blue-500 text-2xl" />
      </div>
      <div>
        <p className="text-sm font-semibold">Box Storage:</p>
        <p className="text-lg font-bold">150 GB</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: "30%" }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">150 GB of 500 GB used</p>
      </div>
      <div className="mt-4">
        <h4 className="font-semibold text-gray-800">Recent Uploads:</h4>
        <ul className="list-disc list-inside text-blue-600 space-y-1 mt-2">
          <li>
            <a href="#" className="hover:underline">western_blot.png</a>
          </li>
          <li>
            <a href="#" className="hover:underline">sequence_data.fasta</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DataManagement;
