import React from "react";

const RankCard = () => {
  const ranks = [
    { grade: 'TOP PLUS', threshold: '97% and Above', color: 'from-violet-600 to-indigo-600', description: 'Exceptional Performance' },
    { grade: 'Distinction', threshold: '80% - 96%', color: 'from-blue-600 to-cyan-600', description: 'Excellent Achievement' },
    { grade: 'First Class', threshold: '60% - 79%', color: 'from-emerald-600 to-teal-600', description: 'Very Good Performance' },
    { grade: 'Second Class', threshold: '40% - 59%', color: 'from-amber-600 to-yellow-600', description: 'Satisfactory' },
    { grade: 'Third Class', threshold: '35% - 39%', color: 'from-orange-600 to-red-600', description: 'Minimum Passing' },
    { grade: 'Failed', threshold: 'Below 35%', color: 'from-red-600 to-rose-600', description: 'Needs Improvement' }
  ];

  return (
    <div className="w-full mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl border border-gray-100">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Grade Classification
        </h2>
        <p className="text-gray-500 text-xs md:text-sm mt-1">Academic Performance Criteria</p>
      </div>

      <div className="space-y-3 md:space-y-4">
        {ranks.map((rank, index) => (
          <div
            key={index}
            className="bg-gradient-to-r p-[1px] rounded-xl transition-transform duration-300 hover:scale-[1.02]"
            style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
          >
            <div className="bg-white rounded-xl p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className={`text-base md:text-lg font-semibold bg-gradient-to-r ${rank.color} bg-clip-text text-transparent`}>
                    {rank.grade}
                  </h3>
                  <p className="text-gray-500 text-xs md:text-sm mt-1">{rank.threshold}</p>
                  <p className="text-gray-400 text-xs mt-1 hidden sm:block">{rank.description}</p>
                </div>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${rank.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <span className="text-white text-base md:text-xl font-bold">
                    {index + 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-amber-800 text-xs md:text-sm font-medium">
            <span className="font-bold">Note:</span> ഓരോ വിഷയത്തിലും നിശ്ചിത ശതമാനം മാർക്ക് നേടിയാൽ മാത്രമേ അതാത് ഗ്രേഡിലേക്ക് യോഗ്യത നേടാനാകൂ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RankCard;