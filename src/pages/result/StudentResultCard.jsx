import React from "react";

const StudentResultCard = ({ student, isFailed }) => {
  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow-2xl transform transition-all overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white flex justify-center items-center flex-col px-4 py-4 md:py-6">
        <h2 className="text-lg md:text-3xl font-bold text-center">AL MADRASSATHUL FALAHIYYA</h2>
        <p className="text-xs md:text-sm text-center mt-1">
          Kalarundi, Valiyaparamba P.O, SKIMV Board | Reg No: 10610
        </p>
        <p className="text-xs md:text-sm mt-2 font-semibold">Annual Examination Result 2024-25</p>
      </div>

      {/* Student Details Section */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 text-sm md:text-base text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">Student's Name:</span> {student.name}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Class:</span> {student.class}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Roll No.:</span> {student.rollNo}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Father's Name:</span> {student.guardian || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Reg No.:</span> {student.regNo || "N/A"}
            </p>
          </div>
          {student.image && (
            <div className="flex justify-center md:justify-end items-center">
              <img
                src={student.image}
                alt={student.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-blue-100 shadow-lg object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Marks Section */}
      <div className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Mark List</h3>
        
        {student.marks && student.marks.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-700">Obtained</th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-700">Total</th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-700">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {student.marks.map((subject, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 text-sm text-gray-700">{subject.name}</td>
                      <td className="p-3 text-sm text-gray-700 text-right font-medium">
                        {subject.obtained}
                      </td>
                      <td className="p-3 text-sm text-gray-700 text-right">
                        {subject.total}
                      </td>
                      <td className="p-3 text-sm text-gray-700 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(subject.percentage) >= 40 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {subject.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <div className="text-base md:text-lg font-bold text-gray-800 mb-2 sm:mb-0">
                Rank:{" "}
                <span
                  className={`${
                    isFailed ? "text-red-600" : "text-blue-600"
                  } font-bold ml-1`}
                >
                  {student.rank}
                </span>
              </div>
              <div className="text-base md:text-lg font-bold text-gray-800">
                Total: {student.totalObtained} / {student.totalMarks} 
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({student.percentage}%)
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 py-8">No marks data available</p>
        )}
      </div>

      {/* Footer Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 text-xs md:text-sm">
        All Rights © Reserved for Falahiyya Kalarundi
      </div>
    </div>
  );
};

export default StudentResultCard;