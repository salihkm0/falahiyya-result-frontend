import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import StudentResultCard from "./StudentResultCard";
import AttendanceCard from "./AttendanceCard";
import RankCard from "./RankCard";
import { examAPI, studentAPI, attendanceAPI, classAPI } from "../../services/api";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const Result = () => {
  const { studentId } = useParams();
  const resultRef = useRef(null);
  const [studentData, setStudentData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [classRank, setClassRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Fetch student details
      const studentRes = await studentAPI.getById(studentId);
      const student = studentRes.data;

      // Fetch all exams for this student
      const examsRes = await examAPI.getByStudent(studentId);
      const exams = examsRes.data || [];

      // Fetch class details
      const classRes = await classAPI.getById(student.classNumber);
      const classData = classRes.data;

      // Fetch attendance for this student
      const attendanceRes = await attendanceAPI.getByStudent(studentId);
      const attendance = attendanceRes.data || [];

      // Calculate marks
      let totalObtained = 0;
      let totalMarks = 0;

      const marksData = exams.map((exam) => {
        totalObtained += exam.marks.obtainedMark;
        totalMarks += exam.marks.totalMark;

        return {
          name: exam.subjects?.map(s => s.subjectName).join("/") || "General",
          obtained: exam.marks.obtainedMark,
          total: exam.marks.totalMark,
          percentage: ((exam.marks.obtainedMark / exam.marks.totalMark) * 100).toFixed(2),
        };
      });

      const percentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;

      // Determine Rank based on percentage criteria
      let rank = "Failed";
      const allAbove97 = exams.every(
        (exam) => (exam.marks.obtainedMark / exam.marks.totalMark) * 100 >= 97
      );
      const allAbove80 = exams.every(
        (exam) => (exam.marks.obtainedMark / exam.marks.totalMark) * 100 >= 80
      );
      const allAbove60 = exams.every(
        (exam) => (exam.marks.obtainedMark / exam.marks.totalMark) * 100 >= 60
      );
      const allAbove40 = exams.every(
        (exam) => (exam.marks.obtainedMark / exam.marks.totalMark) * 100 >= 40
      );
      const allAbove35 = exams.every(
        (exam) => (exam.marks.obtainedMark / exam.marks.totalMark) * 100 >= 35
      );
      const anyBelow35 = exams.some(
        (exam) => (exam.marks.obtainedMark / exam.marks.totalMark) * 100 < 35
      );

      if (allAbove97) rank = "TOP PLUS";
      else if (allAbove80) rank = "Distinction";
      else if (allAbove60) rank = "First Class";
      else if (allAbove40) rank = "Second Class";
      else if (allAbove35) rank = "Third Class";
      if (anyBelow35) rank = "Failed";

      const formattedData = {
        _id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        guardian: student.guardian || student.parentName,
        regNo: student.regNo || student.registrationNo,
        mobile: student.mobile || student.phone,
        class: classData?.className || classData?.classNumber || "Unknown",
        classId: classData?._id,
        totalObtained,
        totalMarks,
        percentage: percentage.toFixed(2),
        rank,
        marks: marksData,
        image: student.image || student.photo,
      };

      setStudentData(formattedData);

      // Process attendance data
      if (attendance.length > 0 && attendance[0].attendance?.length > 0) {
        const presentDays = attendance[0].attendance[0].presentDays;
        const totalDays = attendance[0].attendance[0].totalDays;
        const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

        // Fetch all attendance for class to calculate rank
        if (classData?._id) {
          const classAttendanceRes = await attendanceAPI.getByClass(classData._id);
          const allAttendance = classAttendanceRes.data || [];

          // Rank students based on attendance
          const rankedStudents = allAttendance
            .filter(att => att.attendance?.length > 0 && att.attendance[0].totalDays > 0)
            .map((att) => ({
              studentId: att.studentId?._id || att.studentId,
              name: att.studentId?.name || "Unknown",
              percentage: ((att.attendance[0].presentDays / att.attendance[0].totalDays) * 100).toFixed(2),
            }))
            .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

          // Assign ranks while handling ties
          let rankMap = new Map();
          let currentRank = 1;

          rankedStudents.forEach((student, index) => {
            if (index > 0 && student.percentage !== rankedStudents[index - 1].percentage) {
              currentRank = index + 1;
            }
            rankMap.set(student.studentId, currentRank);
          });

          const studentRank = rankMap.get(student._id) || null;
          setClassRank(studentRank);

          setAttendanceData({
            presentDays,
            totalDays,
            percentage: attendancePercentage,
            rank: studentRank,
          });
        }
      } else {
        setAttendanceData({
          presentDays: 0,
          totalDays: 0,
          percentage: "0.00",
          rank: null,
        });
      }

    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Failed to load student result");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (resultRef.current) {
      setDownloading(true);
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
        
        toast.success("Result downloaded successfully");
      } catch (error) {
        console.error("Error downloading image:", error);
        toast.error("Failed to download result");
      } finally {
        setDownloading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading result...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">No result data found</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isFailed = studentData.rank === "Failed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-6 md:py-10 px-2 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 bg-white rounded-xl shadow-2xl p-5">
          <h1 className="text-2xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 text-center mb-3 uppercase">
            AL Madrassathul Falahiyya Kalarundi
          </h1>
          <div className="relative">
            <p className="text-md md:text-xl text-gray-600 font-medium">
              Exam Result Board
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
          </div>
        </div>

        {/* Result Summary Card */}
        <div className="bg-white rounded-xl shadow-2xl p-6 mb-8 transform transition-all">
          <p
            className={`text-xl md:text-2xl font-semibold text-center ${
              isFailed ? "text-red-600" : "text-green-600"
            }`}
          >
            {isFailed
              ? `Sorry, ${studentData.name}. You have failed the exam. Better luck next time!`
              : `Congratulations, ${studentData.name}! You Passed The Exam`}
          </p>
          
          <div className="flex justify-center items-center my-6">
            <div className="text-4xl md:text-6xl font-bold text-gray-900">
              {studentData.totalObtained}
              <span className="text-2xl md:text-3xl text-gray-500">
                /{studentData.totalMarks}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-lg text-gray-700 font-semibold">Percentage</p>
              <p className="text-2xl font-bold text-blue-600">
                {studentData.percentage}%
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-lg text-gray-700 font-semibold">Rank</p>
              <p
                className={`text-2xl font-bold ${
                  isFailed ? "text-red-600" : "text-purple-600"
                }`}
              >
                {studentData.rank}
              </p>
            </div>
          </div>
        </div>

        {/* Student Result Card */}
        <div ref={resultRef}>
          <StudentResultCard
            student={studentData}
            isFailed={isFailed}
          />
        </div>

        {/* Attendance Card */}
        <div className="mt-8">
          <AttendanceCard attendance={attendanceData} />
        </div>

        {/* Rank Card */}
        <div className="mt-8">
          <RankCard />
        </div>

        {/* Download Button */}
        <div className="mt-8 text-center">
          <button
            onClick={downloadImage}
            disabled={downloading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Downloading...
              </>
            ) : (
              "Download Result as Image"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;