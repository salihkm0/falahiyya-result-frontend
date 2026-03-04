import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Search, Loader2, Award, ChevronRight, Users, Phone, BookOpen } from "lucide-react";
import { examAPI, classAPI } from "../../services/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import toast from "react-hot-toast";

// Professional Loading Screen Component
const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Simple Logo/Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
            <Award className="w-8 h-8 text-gray-600" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center mb-4">
          <h2 className="text-base font-medium text-gray-700 mb-1">
            Loading Result Board
          </h2>
          <p className="text-xs text-gray-500">
            Please wait while we prepare the data
          </p>
        </div>

        {/* Simple Spinner */}
        <div className="flex justify-center mb-4">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>

        {/* Progress Bar - Minimal */}
        <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
          <div className="bg-gray-400 h-1 rounded-full animate-pulse"></div>
        </div>

        {/* Loading Steps - Optional */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Fetching classes and toppers data...
          </p>
        </div>
      </div>
    </div>
  );
};

// Topper Card Component - Improved for mobile
const TopperCard = ({ student, rank }) => {
  const rankColors = {
    1: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", medal: "🥇" },
    2: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", medal: "🥈" },
    3: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", medal: "🥉" }
  };

  const color = rankColors[rank] || rankColors[3];

  return (
    <div className={`${color.bg} rounded-lg border ${color.border} overflow-hidden hover:shadow-md transition-shadow`}>
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Rank Badge */}
          <div className="flex flex-col items-center justify-center min-w-[40px] sm:min-w-[48px]">
            <span className="text-xl sm:text-2xl">{color.medal}</span>
            <span className={`text-[10px] sm:text-xs font-medium ${color.text}`}>#{rank}</span>
          </div>

          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center border-2 border-white shadow-sm">
              {student.image ? (
                <img 
                  src={student.image} 
                  alt={student.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-sm sm:text-base font-semibold text-gray-600">
                  {student.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{student.name}</h3>
            <p className="text-[10px] sm:text-xs text-gray-500">Roll: {student.rollNo}</p>
            
            {/* Marks */}
            <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
              <span className="text-[10px] sm:text-xs font-medium text-gray-700">
                {student.totalObtained || 0}/{student.totalMarks || 0}
              </span>
              <span className="text-[8px] sm:text-xs text-gray-300">•</span>
              <span className="text-[10px] sm:text-xs font-medium text-green-600">
                {student.percentage || 0}%
              </span>
            </div>
          </div>

          {/* Chevron */}
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

const ResultMain = () => {
  const [classes, setClasses] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [toppers, setToppers] = useState({});
  const [classLoading, setClassLoading] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch classes first
        const classesData = await fetchClasses();
        
        // Then fetch toppers using the fetched classes
        if (classesData && classesData.length > 0) {
          await fetchAllToppers(classesData);
        }
        
        // Small delay for smooth transition
        setTimeout(() => {
          setPageLoading(false);
        }, 500);
        
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
        setPageLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      
      // Filter out classes 5A and 7A
      const filteredClasses = (response.data || [])
        .filter(cls => {
          const classStr = `${cls.classNumber} ${cls.section || ''}`.trim();
          return !['5 A', '5A', '7 A', '7A'].includes(classStr);
        })
        .sort((a, b) => {
          const numA = parseInt(a.classNumber) || 0;
          const numB = parseInt(b.classNumber) || 0;
          return numA - numB;
        });
      
      setClasses(filteredClasses);
      return filteredClasses;
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to fetch classes");
      throw error;
    }
  };

  const fetchAllToppers = async (classList) => {
    const toppersData = {};
    
    // Use the provided classList or fallback to state
    const classesToProcess = classList || classes;
    
    if (!classesToProcess || classesToProcess.length === 0) {
      console.log("No classes to process for toppers");
      return;
    }
    
    for (const cls of classesToProcess) {
      try {
        setClassLoading(prev => ({ ...prev, [cls._id]: true }));
        
        const examsRes = await examAPI.getByClass(cls._id);
        const exams = examsRes.data || [];
        
        const studentMarks = {};
        
        exams.forEach(exam => {
          const studentId = exam.studentId?._id || exam.studentId;
          if (!studentId) return;
          
          if (!studentMarks[studentId]) {
            studentMarks[studentId] = {
              studentId,
              name: exam.studentId?.name || "Unknown",
              rollNo: exam.studentId?.rollNo || "N/A",
              image: exam.studentId?.image,
              totalObtained: 0,
              totalMarks: 0,
            };
          }
          
          studentMarks[studentId].totalObtained += exam.marks?.obtainedMark || 0;
          studentMarks[studentId].totalMarks += exam.marks?.totalMark || 0;
        });
        
        const studentsList = Object.values(studentMarks).map(student => ({
          ...student,
          percentage: student.totalMarks > 0 
            ? ((student.totalObtained / student.totalMarks) * 100).toFixed(2)
            : 0
        }));
        
        // Sort by total marks (descending) for toppers
        studentsList.sort((a, b) => b.totalObtained - a.totalObtained);
        toppersData[cls._id] = studentsList.slice(0, 3);
        
      } catch (error) {
        console.error(`Error fetching toppers for class ${cls.classNumber}:`, error);
        toppersData[cls._id] = [];
      } finally {
        setClassLoading(prev => ({ ...prev, [cls._id]: false }));
      }
    }
    
    setToppers(toppersData);
  };

  const onSubmit = async (data) => {
    if (!data.phone || !data.class) {
      toast.error("Please fill all fields");
      return;
    }

    setSearchLoading(true);
    try {
      const response = await examAPI.getMarksByPhoneAndClass({
        phone: data.phone,
        classId: data.class
      });

      if (response.data && response.data.student) {
        navigate(`/result/${response.data.student._id}`);
      } else {
        toast.error("No result found for the given details");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch result");
    } finally {
      setSearchLoading(false);
    }
  };

  // Show loading screen while page is loading
  if (pageLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header with Full School Details */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 md:p-8">
            {/* Arabic Title */}
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 font-arabic">
              الـمـدرسـة الـفـلاحـيـة كـلارونـدي
            </h1>
            
            {/* English Title */}
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-1 sm:mb-2">
              AL MADRASSATHUL FALAHIYYA KALARUNDI
            </h2>
            
            {/* Address and Details */}
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-1">
              Kalarundi, Valiyaparamba P.O | SKIMV Board | Reg No: 10610
            </p>
            
            {/* Exam Title */}
            <div className="mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 md:pt-4 border-t border-gray-100">
              <p className="text-sm sm:text-base md:text-lg font-medium text-gray-700">
                Annual Examination Result 2024-2025
              </p>
            </div>
          </div>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6 sm:mb-8 md:mb-10">
          <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-sm sm:text-base font-medium text-gray-800 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
              Search Your Result
            </h2>
          </div>
          
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">
                    Phone Number <span className="text-gray-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="Enter 10 digit number"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Enter a valid 10-digit number"
                        }
                      })}
                      className="pl-8 sm:pl-9 w-full text-sm"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[10px] sm:text-xs text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Class Selection */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-gray-600 mb-1">
                    Select Class <span className="text-gray-400">*</span>
                  </label>
                  <Select onValueChange={(value) => setValue("class", value)}>
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Choose your class" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {classes.length > 0 ? (
                        classes.map((cls) => (
                          <SelectItem key={cls._id} value={cls._id} className="text-sm">
                            Class {cls.classNumber} {cls.section ? `- ${cls.section}` : ''}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>
                          No classes available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.class && (
                    <p className="text-[10px] sm:text-xs text-red-500 mt-1">Class is required</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center pt-1 sm:pt-2">
                <Button
                  type="submit"
                  disabled={searchLoading}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-colors flex items-center gap-1 sm:gap-2"
                >
                  {searchLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                      <span className="hidden xs:inline">Searching...</span>
                      <span className="xs:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>View Result</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Toppers Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-1 sm:gap-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                Class Toppers
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Top 3 students from each class</p>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-400">{classes.length} classes</span>
          </div>

          {classes.map((cls) => (
            <div key={cls._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50">
                <h3 className="text-xs sm:text-sm font-medium text-gray-700">
                  Class {cls.classNumber} {cls.section ? `- ${cls.section}` : ''}
                </h3>
              </div>

              <div className="p-3 sm:p-4">
                {classLoading[cls._id] ? (
                  <div className="flex justify-center py-4 sm:py-6">
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-gray-400" />
                  </div>
                ) : toppers[cls._id]?.length > 0 ? (
                  <>
                    {/* Desktop Grid */}
                    <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {toppers[cls._id].map((student, index) => (
                        <TopperCard 
                          key={student.studentId} 
                          student={student} 
                          rank={index + 1} 
                        />
                      ))}
                    </div>

                    {/* Mobile Vertical List */}
                    <div className="md:hidden space-y-2">
                      {toppers[cls._id].map((student, index) => (
                        <TopperCard 
                          key={student.studentId} 
                          student={student} 
                          rank={index + 1} 
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-[10px] sm:text-xs text-gray-500 py-3 sm:py-4">
                    No topper data available
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Show message if no classes */}
          {classes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No classes available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 md:mt-10 text-center border-t border-gray-200 pt-4 sm:pt-6">
          <p className="text-[10px] sm:text-xs text-gray-400">
            © 2025 AL Madrassathul Falahiyya Kalarundi. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultMain;