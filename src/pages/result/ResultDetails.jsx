import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { examAPI, studentAPI, attendanceAPI, classAPI } from "../../services/api";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  Loader2, 
  Award, 
  Calendar, 
  User, 
  AlertCircle,
  BookOpen,
  GraduationCap,
  Phone,
  MapPin,
  Hash,
  UserCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Printer,
  Trophy
} from "lucide-react";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

// Rank Card Component - Responsive
const RankCard = () => {
  const ranks = [
    { grade: 'TOP PLUS', threshold: '97% and above in ALL subjects', color: 'border-l-4 border-violet-200', textColor: 'text-violet-700' },
    { grade: 'Distinction', threshold: '80% and above in ALL subjects', color: 'border-l-4 border-blue-200', textColor: 'text-blue-700' },
    { grade: 'First Class', threshold: '60% and above in ALL subjects', color: 'border-l-4 border-emerald-200', textColor: 'text-emerald-700' },
    { grade: 'Second Class', threshold: '40% and above in ALL subjects', color: 'border-l-4 border-amber-200', textColor: 'text-amber-700' },
    { grade: 'Third Class', threshold: '35% and above in ALL subjects', color: 'border-l-4 border-orange-200', textColor: 'text-orange-700' },
    { grade: 'Failed', threshold: 'Below 35% in any subject', color: 'border-l-4 border-red-200', textColor: 'text-red-700' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-4 md:px-6 py-3 md:py-4">
        <h3 className="text-sm md:text-base font-semibold text-gray-800 flex items-center gap-1.5 md:gap-2">
          <Award className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          Grade Classification
        </h3>
      </div>
      <div className="p-3 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
          {ranks.map((rank, index) => (
            <div key={index} className={`${rank.color} bg-white rounded-r-lg p-2 md:p-3 shadow-sm`}>
              <div className="flex justify-between items-center">
                <div>
                  <span className={`text-xs md:text-sm font-semibold ${rank.textColor}`}>{rank.grade}</span>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">{rank.threshold}</p>
                </div>
                <span className="text-[9px] md:text-xs font-medium text-gray-400">Grade {index + 1}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 md:mt-4 p-2 md:p-3 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-[10px] md:text-xs text-amber-800">
            <span className="font-medium">Note:</span> Rank is determined by the LOWEST percentage among all subjects. 
            If any subject is below 35%, the student fails regardless of other subjects.
          </p>
        </div>
      </div>
    </div>
  );
};

// Function to calculate rank based on subject percentages
const calculateRank = (exams) => {
  if (!exams || exams.length === 0) return "No Exams";
  
  // Calculate percentage for each exam
  const percentages = exams.map(exam => {
    const obtained = exam.marks?.obtainedMark || 0;
    const total = exam.marks?.totalMark || 0;
    return total > 0 ? (obtained / total) * 100 : 0;
  });

  // Find the minimum percentage (lowest score)
  const minPercentage = Math.min(...percentages);
  
  // Check if any subject is below 35% (Failed)
  if (minPercentage < 35) {
    return "Failed";
  }
  
  // Determine rank based on the minimum percentage
  if (minPercentage >= 97) return "TOP PLUS";
  if (minPercentage >= 80) return "Distinction";
  if (minPercentage >= 60) return "First Class";
  if (minPercentage >= 40) return "Second Class";
  if (minPercentage >= 35) return "Third Class";
  
  return "Failed"; // Fallback
};

// Result Summary Card - Responsive
const ResultSummaryCard = ({ student, isFailed, failedCount, minPercentage }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-3 md:gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-base md:text-xl font-semibold text-gray-800 line-clamp-1 md:line-clamp-none">{student.name}</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            {isFailed ? `Failed in ${failedCount} subject${failedCount > 1 ? 's' : ''}` : `Achieved ${student.rank}`}
          </p>
        </div>
        
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3 md:gap-4">
          <div className="text-right">
            <div className="text-xl md:text-2xl font-bold text-gray-900">
              {student.totalObtained}
              <span className="text-xs md:text-sm font-normal text-gray-500">/{student.totalMarks}</span>
            </div>
            <p className="text-[10px] md:text-xs text-gray-500">Total Marks</p>
          </div>
          <Badge className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm ${
            isFailed 
              ? 'bg-red-50 text-red-700 border-red-200' 
              : 'bg-green-50 text-green-700 border-green-200'
          }`}>
            {isFailed ? 'FAILED' : 'PASSED'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 md:gap-3 mt-4 md:mt-6">
        <div className="bg-gray-50 rounded-lg p-2 md:p-3">
          <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Overall %</p>
          <p className="text-sm md:text-lg font-semibold text-gray-800">{student.overallPercentage}%</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 md:p-3">
          <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Lowest %</p>
          <p className="text-xs md:text-lg font-semibold text-gray-800">{minPercentage}%</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 md:p-3">
          <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Rank</p>
          <p className="text-xs md:text-lg font-semibold text-gray-800 truncate">{student.rank}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 md:p-3">
          <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Status</p>
          <p className={`text-xs md:text-lg font-semibold ${isFailed ? 'text-red-600' : 'text-green-600'}`}>
            {isFailed ? 'Fail' : 'Pass'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Student Info Card - Responsive
const StudentInfoCard = ({ student, className }) => {
  const infoItems = [
    { icon: User, label: "Student Name", value: student.name },
    { icon: Hash, label: "Roll Number", value: student.rollNo },
    { icon: BookOpen, label: "Class", value: className },
    { icon: GraduationCap, label: "Registration No", value: student.regNo || "N/A" },
    { icon: UserCircle, label: "Father's Name", value: student.guardian || "N/A" },
    { icon: Phone, label: "Mobile", value: student.mobile || "N/A" },
    { icon: MapPin, label: "Place", value: student.place || "N/A" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-4 md:px-6 py-3 md:py-4">
        <h3 className="text-sm md:text-base font-semibold text-gray-800 flex items-center gap-1.5 md:gap-2">
          <User className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          Student Information
        </h3>
      </div>
      <div className="p-3 md:p-5">
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {infoItems.map((item, index) => (
            <div key={index} className="flex items-start gap-2 md:gap-3 p-1.5 md:p-2 border-b border-gray-100 last:border-0">
              <div className="bg-gray-100 p-1.5 md:p-2 rounded-md shrink-0">
                <item.icon className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-xs text-gray-500">{item.label}</p>
                <p className="text-xs md:text-sm font-medium text-gray-800 truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Marks Table Component - Responsive
const MarksTable = ({ exams, totalObtained, totalMarks, overallPercentage, isFailed, minPercentage }) => {
  const [expandedSubjects, setExpandedSubjects] = useState({});

  const toggleSubject = (examId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [examId]: !prev[examId]
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-4 md:px-6 py-3 md:py-4">
        <h3 className="text-sm md:text-base font-semibold text-gray-800 flex items-center gap-1.5 md:gap-2">
          <FileText className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          Mark List
        </h3>
      </div>
      
      <div className="p-3 md:p-5">
        {exams.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="pb-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Obtained</th>
                    <th className="pb-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="pb-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th className="pb-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {exams.map((exam, index) => {
                    const subjectNames = exam.subjects?.map(s => s.subjectName).join(", ") || "General";
                    const obtained = exam.marks?.obtainedMark || 0;
                    const total = exam.marks?.totalMark || 0;
                    const percentage = total > 0 ? ((obtained / total) * 100).toFixed(2) : 0;
                    const isSubjectPassed = parseFloat(percentage) >= 35;
                    
                    // Determine if this subject is the lowest
                    const isLowest = parseFloat(percentage) === parseFloat(minPercentage);
                    
                    return (
                      <tr key={exam._id || index} className={`hover:bg-gray-50 ${isLowest ? 'bg-yellow-50' : ''}`}>
                        <td className="py-3 text-sm text-gray-500">{index + 1}</td>
                        <td className="py-3 text-sm text-gray-800">{subjectNames}</td>
                        <td className="py-3 text-sm text-right font-medium text-gray-800">{obtained}</td>
                        <td className="py-3 text-sm text-right text-gray-600">{total}</td>
                        <td className="py-3 text-sm text-right">
                          <span className={`font-medium ${isSubjectPassed ? 'text-green-600' : 'text-red-600'}`}>
                            {percentage}% 
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {isSubjectPassed ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="w-3 h-3" />
                              Pass
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600">
                              <XCircle className="w-3 h-3" />
                              Fail
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t border-gray-200 bg-gray-50">
                  <tr>
                    <td colSpan="2" className="pt-3 text-sm font-medium text-gray-700">Total</td>
                    <td className="pt-3 text-sm text-right font-medium text-gray-800">{totalObtained}</td>
                    <td className="pt-3 text-sm text-right text-gray-600">{totalMarks}</td>
                    <td className="pt-3 text-sm text-right font-medium text-gray-800">{overallPercentage}%</td>
                    <td className="pt-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        isFailed ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {isFailed ? (
                          <><XCircle className="w-3 h-3" /> Failed</>
                        ) : (
                          <><CheckCircle2 className="w-3 h-3" /> Passed</>
                        )}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2">
              {exams.map((exam, index) => {
                const subjectNames = exam.subjects?.map(s => s.subjectName).join(", ") || "General";
                const obtained = exam.marks?.obtainedMark || 0;
                const total = exam.marks?.totalMark || 0;
                const percentage = total > 0 ? ((obtained / total) * 100).toFixed(2) : 0;
                const isSubjectPassed = parseFloat(percentage) >= 35;
                const isLowest = parseFloat(percentage) === parseFloat(minPercentage);
                
                return (
                  <div key={exam._id || index} className={`border border-gray-200 rounded-lg overflow-hidden ${isLowest ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                    <div 
                      className="flex justify-between items-center p-3 bg-white cursor-pointer active:bg-gray-50"
                      onClick={() => toggleSubject(exam._id)}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-gray-500 block">Subject {index + 1}</span>
                        <span className="text-sm font-medium text-gray-800 line-clamp-1">{subjectNames}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-base font-semibold text-gray-800">{obtained}</span>
                          <span className="text-xs text-gray-500">/{total}</span>
                        </div>
                        {isSubjectPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    {expandedSubjects[exam._id] && (
                      <div className="p-3 bg-gray-50 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Percentage</p>
                            <p className={`text-sm font-medium ${isSubjectPassed ? 'text-green-600' : 'text-red-600'}`}>
                              {percentage}% 
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Status</p>
                            <p className={`text-sm font-medium ${isSubjectPassed ? 'text-green-600' : 'text-red-600'}`}>
                              {isSubjectPassed ? 'Passed' : 'Failed'}
                            </p>
                          </div>
                          <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500">Exam Date</p>
                            <p className="text-sm">{new Date(exam.examDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Mobile Total Card */}
              <div className="bg-gray-50 p-4 rounded-lg mt-3 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Grand Total</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {totalObtained}/{totalMarks}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium text-gray-600">Overall Percentage</span>
                  <span className="text-base font-semibold text-gray-800">{overallPercentage}%</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium text-gray-600">Lowest Percentage</span>
                  <span className="text-base font-semibold text-gray-800">{minPercentage}%</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Final Status</span>
                  <span className={`text-sm font-semibold ${isFailed ? 'text-red-600' : 'text-green-600'}`}>
                    {isFailed ? 'Failed' : 'Passed'}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">No exam records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Attendance Card - With Rank Display
const AttendanceCard = ({ attendance }) => {
  if (!attendance) return null;

  const presentDays = attendance.presentDays || 0;
  const totalDays = attendance.totalDays || 0;
  const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
  const isGood = parseFloat(percentage) >= 75;
  
  // Get rank from attendance data
  const rank = attendance.rank;
  const totalStudents = attendance.totalStudents;

  // Determine rank color
  const getRankColor = () => {
    if (!rank) return 'text-gray-600';
    if (rank === 1) return 'text-amber-600';
    if (rank === 2) return 'text-gray-500';
    if (rank === 3) return 'text-orange-600';
    return 'text-blue-600';
  };

  // Get rank medal
  const getRankMedal = () => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-4 md:px-6 py-3 md:py-4">
        <h3 className="text-sm md:text-base font-semibold text-gray-800 flex items-center gap-1.5 md:gap-2">
          <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          Attendance Details
        </h3>
      </div>
      
      <div className="p-3 md:p-5">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
            <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Present Days</p>
            <p className="text-sm md:text-lg font-semibold text-gray-800">{presentDays}</p>
          </div>
          <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
            <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Total Days</p>
            <p className="text-sm md:text-lg font-semibold text-gray-800">{totalDays}</p>
          </div>
          <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
            <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Percentage</p>
            <p className={`text-sm md:text-lg font-semibold ${isGood ? 'text-green-600' : 'text-orange-600'}`}>
              {percentage}%
            </p>
          </div>
        </div>

        {/* Rank Display - Only show if rank is available */}
        {rank && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="bg-indigo-50 p-2 md:p-3 rounded-lg">
              <p className="text-[10px] md:text-xs text-indigo-600 mb-0.5 flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Class Rank
              </p>
              <div className="flex items-center gap-1">
                <span className={`text-base md:text-xl font-bold ${getRankColor()}`}>
                  #{rank}
                </span>
                {getRankMedal() && (
                  <span className="text-lg ml-1">{getRankMedal()}</span>
                )}
              </div>
            </div>
            
            {totalStudents && (
              <div className="bg-purple-50 p-2 md:p-3 rounded-lg">
                <p className="text-[10px] md:text-xs text-purple-600 mb-0.5">Total Students</p>
                <p className="text-base md:text-xl font-bold text-purple-700">{totalStudents}</p>
              </div>
            )}
          </div>
        )}

        {/* Status Badge and Top Performer Tag */}
        <div className="mt-3 flex flex-wrap justify-between items-center gap-2">
          <span className={`text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full ${
            isGood 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-orange-50 text-orange-700 border border-orange-200'
          }`}>
            {isGood ? '✅ Good Standing' : '⚠️ Needs Improvement'}
          </span>
          
          {rank && rank <= 3 && (
            <span className="text-[10px] md:text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
              <Award className="w-3 h-3" />
              Top {rank} Performer
            </span>
          )}
        </div>

        {/* Performance Message */}
        {rank && (
          <div className="mt-3 text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-[10px] md:text-xs text-gray-600">
              {rank === 1 && "🏆 Excellent! Best attendance in class"}
              {rank === 2 && "✨ Outstanding attendance record!"}
              {rank === 3 && "⭐ Great attendance performance!"}
              {rank > 3 && rank <= Math.ceil(totalStudents / 2) && "👍 Above average attendance"}
              {rank > Math.ceil(totalStudents / 2) && rank !== 1 && rank !== 2 && rank !== 3 && "💪 Keep improving!"}
            </p>
          </div>
        )}

        {/* Class Average Comparison (if available) */}
        {attendance.classAverage && (
          <div className="mt-2 text-center">
            <p className="text-[8px] md:text-[10px] text-gray-400">
              Class Average: {attendance.classAverage}% | You are {parseFloat(percentage) >= attendance.classAverage ? 'above' : 'below'} average
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ResultDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const resultRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [exams, setExams] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [className, setClassName] = useState("");
  const [failedSubjects, setFailedSubjects] = useState([]);
  const [minPercentage, setMinPercentage] = useState(0);

  useEffect(() => {
    if (studentId) {
      fetchStudentResult();
    }
  }, [studentId]);

  const fetchStudentResult = async () => {
    setLoading(true);
    try {
      const studentRes = await studentAPI.getById(studentId);
      const student = studentRes.data;

      // Handle class information
      let classDisplayName = "Unknown";
      let classId = null;
      
      if (student.classNumber) {
        if (typeof student.classNumber === 'object' && student.classNumber.classNumber) {
          classDisplayName = student.classNumber.classNumber;
          classId = student.classNumber._id;
        } else {
          classId = student.classNumber;
          try {
            const classRes = await classAPI.getById(student.classNumber);
            classDisplayName = classRes.data?.classNumber || "Unknown";
          } catch (error) {
            console.error("Error fetching class:", error);
          }
        }
      }
      setClassName(classDisplayName);

      // Fetch exams
      const examsRes = await examAPI.getByStudent(studentId);
      const examsData = examsRes.data || [];
      setExams(examsData);

      // Calculate percentages for each exam
      const percentages = examsData.map(exam => {
        const obtained = exam.marks?.obtainedMark || 0;
        const total = exam.marks?.totalMark || 0;
        return total > 0 ? (obtained / total) * 100 : 0;
      });

      // Find minimum percentage
      const minPerc = percentages.length > 0 ? Math.min(...percentages) : 0;
      setMinPercentage(minPerc.toFixed(2));

      // Check for failed subjects (below 35%)
      const failed = [];
      examsData.forEach(exam => {
        const obtained = exam.marks?.obtainedMark || 0;
        const total = exam.marks?.totalMark || 0;
        const percentage = total > 0 ? (obtained / total) * 100 : 0;
        
        if (percentage < 35) {
          const subjectNames = exam.subjects?.map(s => s.subjectName).join(", ") || "General";
          failed.push({
            subjects: subjectNames,
            obtained,
            total,
            percentage: percentage.toFixed(2)
          });
        }
      });
      setFailedSubjects(failed);

      // Calculate totals
      let totalObtained = 0;
      let totalMarks = 0;
      
      examsData.forEach(exam => {
        totalObtained += exam.marks?.obtainedMark || 0;
        totalMarks += exam.marks?.totalMark || 0;
      });

      // Calculate rank based on minimum percentage
      const rank = calculateRank(examsData);
      const hasFailedSubject = failed.length > 0;
      const overallPercentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;

      setStudentData({
        ...student,
        totalObtained,
        totalMarks,
        overallPercentage: overallPercentage.toFixed(2),
        rank,
        hasFailed: hasFailedSubject,
        subjectCount: examsData.length
      });

      // Fetch attendance with rank
      try {
        const attendanceRes = await attendanceAPI.getByStudent(studentId);
        
        if (attendanceRes.data && attendanceRes.data.attendance && attendanceRes.data.attendance.length > 0) {
          const attendanceData = attendanceRes.data.attendance[0];
          
          // Extract rank and total students from response
          const attendanceWithRank = {
            ...attendanceData.attendance[0],
            rank: attendanceRes.data.rank,
            totalStudents: attendanceRes.data.totalStudents,
            classAverage: attendanceRes.data.classAverage
          };
          
          setAttendance(attendanceWithRank);
          
          console.log('Attendance with rank:', {
            presentDays: attendanceWithRank.presentDays,
            totalDays: attendanceWithRank.totalDays,
            percentage: ((attendanceWithRank.presentDays / attendanceWithRank.totalDays) * 100).toFixed(2),
            rank: attendanceWithRank.rank,
            outOf: attendanceWithRank.totalStudents
          });
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
        // Don't show toast for attendance error as it's optional
      }

    } catch (error) {
      console.error("Error fetching result:", error);
      toast.error("Failed to load result");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!resultRef.current) return;
    
    setDownloadingImage(true);
    try {
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true
      });
      
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `Result_${studentData?.name || 'Student'}.png`;
      link.click();
      
      toast.success("Result image downloaded successfully");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    } finally {
      setDownloadingImage(false);
    }
  };

  const downloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const pdfUrl = `http://localhost:5559/api/exams/pdf/${studentId}`;
      window.open(pdfUrl, '_blank');
      toast.success("PDF opened successfully");
    } catch (error) {
      console.error("Error opening PDF:", error);
      toast.error("Failed to open PDF");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Loading result...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600 mt-2">No result data found</p>
          <Button 
            onClick={() => navigate('/results')}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isFailed = studentData.hasFailed;

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-6 px-3 md:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Actions */}
        <div className="flex flex-row justify-between items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/results')}
            className="flex items-center gap-1 md:gap-2 h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          
          {/* <div className="flex gap-1 md:gap-2">
            <Button
              onClick={downloadImage}
              disabled={downloadingImage}
              size="sm"
              variant="outline"
              className="h-8 md:h-9 w-8 md:w-9 p-0"
              title="Download as Image"
            >
              {downloadingImage ? (
                <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
              )}
            </Button>
            
            <Button
              onClick={downloadPDF}
              disabled={downloadingPDF}
              size="sm"
              className="h-8 md:h-9 w-8 md:w-9 p-0 bg-blue-600 text-white hover:bg-blue-700"
              title="Download as PDF"
            >
              {downloadingPDF ? (
                <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
              )}
            </Button>
            
            <Button
              onClick={handlePrint}
              size="sm"
              variant="outline"
              className="h-8 md:h-9 w-8 md:w-9 p-0"
              title="Print"
            >
              <Printer className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Button>
          </div> */}
        </div>

        {/* Main Result Content */}
        <div ref={resultRef} className="space-y-4 md:space-y-6">
          {/* School Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 text-center">
            <h1 className="text-base md:text-2xl font-bold text-gray-800 mb-0.5">الـمـدرسـة الـفـلاحـيـة كـلارونـدي</h1>
            <h2 className="text-sm md:text-xl font-medium text-gray-700 mb-1">AL MADRASSATHUL FALAHIYYA KALARUNDI</h2>
            <p className="text-xs md:text-sm text-gray-500">Kalarundi, Valiyaparamba P.O | SKIMV Board | Reg No: 10610</p>
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs md:text-sm font-medium text-gray-700">Annual Examination Result 2025-2026</p>
            </div>
          </div>

          {/* Result Summary */}
          <ResultSummaryCard 
            student={studentData} 
            isFailed={isFailed}
            failedCount={failedSubjects.length}
            minPercentage={minPercentage}
          />

          {/* Failed Subjects Warning */}
          {isFailed && failedSubjects.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm md:text-base font-medium text-red-700 mb-1">Failed Subjects (Below 35%)</h4>
                  <ul className="space-y-1">
                    {failedSubjects.map((subject, index) => (
                      <li key={index} className="text-xs md:text-sm text-red-600">
                        {subject.subjects}: {subject.obtained}/{subject.total} ({subject.percentage}%)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Student Information */}
          <StudentInfoCard student={studentData} className={className} />

          {/* Marks Table */}
          <MarksTable 
            exams={exams}
            totalObtained={studentData.totalObtained}
            totalMarks={studentData.totalMarks}
            overallPercentage={studentData.overallPercentage}
            isFailed={isFailed}
            minPercentage={minPercentage}
          />

          {/* Attendance with Rank */}
          <AttendanceCard attendance={attendance} />

          {/* Rank Card */}
          <RankCard />

          {/* Footer */}
          <div className="text-center py-3 md:py-4 text-[10px] md:text-xs text-gray-500 border-t border-gray-200">
            <p>All Rights Reserved © Falahiyya Kalarundi</p>
            <p className="mt-0.5">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDetails;