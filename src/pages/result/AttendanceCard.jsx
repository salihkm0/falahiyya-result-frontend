import React from "react";

const AttendanceCard = ({ attendance }) => {
  // Calculate attendance percentage
  const presentDays = attendance?.presentDays || 0;
  const totalDays = attendance?.totalDays || 0;
  const attendancePercentage = totalDays > 0 
    ? ((presentDays / totalDays) * 100).toFixed(2) 
    : "0.00";

  // Calculate progress ring parameters
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (circumference * (100 - parseFloat(attendancePercentage))) / 100;

  return (
    <div className="w-full mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-6 md:p-8 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl border border-gray-100">
      {/* Header with Progress Ring */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="text-center sm:text-left">
          <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Attendance Details
          </h3>
          <p className="text-gray-500 text-xs md:text-sm mt-1">Academic Year 2024-25</p>
        </div>
        
        <div className="relative w-20 h-20 md:w-24 md:h-24">
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              className={`${
                parseFloat(attendancePercentage) >= 75
                  ? "text-emerald-500"
                  : "text-rose-500"
              } transition-all duration-1000 ease-out`}
              style={{ strokeLinecap: 'round' }}
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-xs md:text-sm font-bold text-gray-800">
              {attendancePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div className="text-xs text-gray-500 mb-1">Present Days</div>
          <div className="text-xl md:text-2xl font-bold text-gray-800">
            {presentDays}
          </div>
        </div>
        
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div className="text-xs text-gray-500 mb-1">Total Days</div>
          <div className="text-xl md:text-2xl font-bold text-gray-800">
            {totalDays}
          </div>
        </div>
      </div>

      {/* Class Rank Card */}
      {attendance?.rank && (
        <div className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 p-3 md:p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-80">Class Rank (Attendance)</div>
              <div className="text-xl md:text-2xl font-bold mt-1">
                #{attendance.rank}
              </div>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="mt-4 flex justify-center">
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            parseFloat(attendancePercentage) >= 75
              ? "bg-emerald-100 text-emerald-800"
              : parseFloat(attendancePercentage) > 0
              ? "bg-amber-100 text-amber-800"
              : "bg-rose-100 text-rose-800"
          }`}
        >
          {parseFloat(attendancePercentage) >= 75 
            ? "Good Standing" 
            : parseFloat(attendancePercentage) > 0
            ? "Needs Improvement"
            : "No Attendance Data"}
        </span>
      </div>
    </div>
  );
};

export default AttendanceCard;