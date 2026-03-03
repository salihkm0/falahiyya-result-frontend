import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { attendanceAPI, classAPI, studentAPI } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Calendar, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

const MarkAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [existingAttendance, setExistingAttendance] = useState([]);
  const [globalTotalDays, setGlobalTotalDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      fetchExistingAttendance();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      setClasses(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const response = await attendanceAPI.getByClass(selectedClass);
      setExistingAttendance(response.data || []);
    } catch (error) {
      // It's okay if no attendance exists
      setExistingAttendance([]);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getByClass(selectedClass);
      const studentsList = response.data || [];
      setStudents(studentsList);
      
      // Initialize attendance data for all students
      // Check if there's existing attendance for today or use defaults
      const today = new Date().toISOString().split('T')[0];
      
      setAttendanceData(
        studentsList.map(student => {
          // Check if there's existing attendance for this student
          const existing = existingAttendance.find(
            record => record.studentId?._id === student._id || record.studentId === student._id
          );
          
          return {
            studentId: student._id,
            studentName: student.name,
            rollNo: student.rollNo,
            presentDays: existing?.attendance[0]?.presentDays || 0,
            totalDays: existing?.attendance[0]?.totalDays || globalTotalDays,
            attendanceId: existing?._id || null, // Store ID for updates
          };
        })
      );
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handlePresentDaysChange = (studentId, value) => {
    const numValue = parseInt(value) || 0;
    setAttendanceData(prev =>
      prev.map(item => {
        if (item.studentId === studentId) {
          // Ensure present days don't exceed total days
          const maxPresent = item.totalDays;
          return { 
            ...item, 
            presentDays: Math.min(Math.max(0, numValue), maxPresent)
          };
        }
        return item;
      })
    );
  };

  const handleTotalDaysChange = (studentId, value) => {
    const numValue = parseInt(value) || 1;
    setAttendanceData(prev =>
      prev.map(item => {
        if (item.studentId === studentId) {
          // Ensure total days is at least 1
          const newTotal = Math.max(1, numValue);
          // Adjust present days if it exceeds new total
          const newPresent = Math.min(item.presentDays, newTotal);
          return { 
            ...item, 
            totalDays: newTotal,
            presentDays: newPresent
          };
        }
        return item;
      })
    );
  };

  const handleGlobalTotalDaysChange = (value) => {
    const numValue = parseInt(value) || 1;
    const newGlobalTotal = Math.max(1, numValue);
    setGlobalTotalDays(newGlobalTotal);
    
    // Update all students with new total days, adjusting present days if needed
    setAttendanceData(prev =>
      prev.map(item => ({
        ...item,
        totalDays: newGlobalTotal,
        presentDays: Math.min(item.presentDays, newGlobalTotal)
      }))
    );
  };

  const handleIncrementPresent = (studentId) => {
    setAttendanceData(prev =>
      prev.map(item => {
        if (item.studentId === studentId) {
          const newPresent = Math.min(item.presentDays + 1, item.totalDays);
          return { ...item, presentDays: newPresent };
        }
        return item;
      })
    );
  };

  const handleDecrementPresent = (studentId) => {
    setAttendanceData(prev =>
      prev.map(item => {
        if (item.studentId === studentId) {
          const newPresent = Math.max(item.presentDays - 1, 0);
          return { ...item, presentDays: newPresent };
        }
        return item;
      })
    );
  };

  const setAllPresent = () => {
    setAttendanceData(prev =>
      prev.map(item => ({
        ...item,
        presentDays: item.totalDays
      }))
    );
  };

  const setAllAbsent = () => {
    setAttendanceData(prev =>
      prev.map(item => ({
        ...item,
        presentDays: 0
      }))
    );
  };

  const onSubmit = async (data) => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    if (attendanceData.length === 0) {
      toast.error('No students to mark attendance for');
      return;
    }

    setLoading(true);
    try {
      const date = data.date || new Date().toISOString().split('T')[0];
      
      // Create or update attendance records for each student
      const promises = attendanceData.map(record => {
        const attendancePayload = {
          classId: selectedClass,
          studentId: record.studentId,
          presentDays: record.presentDays,
          totalDays: record.totalDays
        };

        // If attendance ID exists, update instead of create
        if (record.attendanceId) {
          return attendanceAPI.update(record.attendanceId, {
            presentDays: record.presentDays,
            totalDays: record.totalDays
          });
        } else {
          return attendanceAPI.create(attendancePayload);
        }
      });

      await Promise.all(promises);
      toast.success('Attendance marked successfully');
      navigate('/attendance');
    } catch (error) {
      console.error('Attendance error:', error);
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = attendanceData.length;
  const totalPresent = attendanceData.reduce((sum, item) => sum + item.presentDays, 0);
  const totalDaysSum = attendanceData.reduce((sum, item) => sum + item.totalDays, 0);
  const averageAttendance = totalDaysSum > 0 
    ? ((totalPresent / totalDaysSum) * 100).toFixed(1) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto relative">
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {/* Fixed Class Select with proper z-index */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Class *</label>
                <Select 
                  onValueChange={(value) => {
                    setSelectedClass(value);
                    setValue('classId', value);
                  }} 
                  value={selectedClass}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper" 
                    className="z-[100] bg-white"
                  >
                    {classes.length > 0 ? (
                      classes.map((cls) => (
                        <SelectItem key={cls._id} value={cls._id}>
                          Class {cls.classNumber || cls.className} {cls.section ? `- ${cls.section}` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        No classes available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!selectedClass && (
                  <p className="text-sm text-red-500">Please select a class</p>
                )}
              </div>

              {/* Date Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date *</label>
                <Input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  {...register('date', { required: 'Date is required' })}
                  className="w-full"
                />
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date.message}</p>
                )}
              </div>

              {/* Global Total Days */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Days (All Students)</label>
                <Input
                  type="number"
                  min="1"
                  value={globalTotalDays}
                  onChange={(e) => handleGlobalTotalDaysChange(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {selectedClass && (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : students.length > 0 ? (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Total Students</p>
                        <p className="text-2xl font-bold text-blue-700">{totalStudents}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Total Present Days</p>
                        <p className="text-2xl font-bold text-green-700">{totalPresent}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Average Attendance</p>
                        <p className="text-2xl font-bold text-purple-700">{averageAttendance}%</p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-4 mb-4">
                      <Button type="button" variant="outline" size="sm" onClick={setAllPresent}>
                        Mark All Present
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={setAllAbsent}>
                        Mark All Absent
                      </Button>
                      <span className="text-sm text-gray-500 ml-auto">
                        {attendanceData.filter(d => d.presentDays > 0).length} students with attendance
                      </span>
                    </div>

                    {/* Attendance Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Roll No</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead className="text-center">Present Days</TableHead>
                            <TableHead className="text-center">Total Days</TableHead>
                            <TableHead className="text-center">Percentage</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendanceData.map((item) => {
                            const percentage = item.totalDays > 0 
                              ? ((item.presentDays / item.totalDays) * 100).toFixed(1) 
                              : 0;
                            
                            let statusColor = 'text-gray-600';
                            if (percentage >= 75) statusColor = 'text-green-600 font-bold';
                            else if (percentage >= 50) statusColor = 'text-yellow-600';
                            else if (percentage > 0) statusColor = 'text-orange-600';
                            else statusColor = 'text-red-600';

                            return (
                              <TableRow key={item.studentId}>
                                <TableCell>{item.rollNo || 'N/A'}</TableCell>
                                <TableCell className="font-medium">{item.studentName || 'Unknown'}</TableCell>
                                <TableCell className="text-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max={item.totalDays}
                                    value={item.presentDays}
                                    onChange={(e) => handlePresentDaysChange(item.studentId, e.target.value)}
                                    className="w-20 text-center mx-auto"
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.totalDays}
                                    onChange={(e) => handleTotalDaysChange(item.studentId, e.target.value)}
                                    className="w-20 text-center mx-auto"
                                  />
                                </TableCell>
                                <TableCell className={`text-center font-medium ${statusColor}`}>
                                  {percentage}%
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleDecrementPresent(item.studentId)}
                                      disabled={item.presentDays <= 0}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleIncrementPresent(item.studentId)}
                                      disabled={item.presentDays >= item.totalDays}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No students found in this class
                  </div>
                )}

                {students.length > 0 && (
                  <div className="flex justify-end gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/attendance')}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading || !selectedClass || students.length === 0}
                    >
                      {loading ? 'Saving...' : 'Save Attendance'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarkAttendance;