import { FaCalendarAlt } from "react-icons/fa";

const bookings = [
  { time: "10:30 AM", event: null },
  { time: "2-4 PM", event: { name: "Flow Cytometer", color: "bg-blue-600 text-white" } },
  { time: "3 PM", event: { name: "Incubator 3", status: "Available", color: "bg-green-300 text-green-800" } },
  { time: "4 PM", event: null },
];

const ResourceBooking = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Resource & Equipment Booking
        </h3>
        <button className="flex items-center space-x-2 text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
          <FaCalendarAlt />
          <span>Calendar</span>
        </button>
      </div>
      <div>
        <div className="text-center text-sm font-semibold text-gray-600 mb-2">
          Sorx, 2023
        </div>
        <div className="space-y-2">
          {bookings.map((booking, index) => (
            <div key={index} className="flex items-center">
              <div className="w-16 text-xs text-gray-500 text-right pr-4">
                {booking.time}
              </div>
              <div className="flex-1 border-l-2 border-gray-200 pl-4">
                {booking.event ? (
                  <div className={`p-2 rounded-lg ${booking.event.color}`}>
                    <p className="font-semibold text-sm">{booking.event.name}</p>
                    {booking.event.status && (
                       <p className="text-xs">{booking.event.status}</p>
                    )}
                  </div>
                ) : (
                  <div className="h-8"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceBooking;
