import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search, Filter } from 'lucide-react';
import { attendanceAPI, classAPI } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import toast from 'react-hot-toast';

const AttendanceList = () => {
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      setClasses(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await attendanceAPI.getByClass(selectedClass);
      // Filter by date if needed (you might need to adjust this based on your API)
      setAttendance(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (record) => {
    if (!record || !record.attendance || record.attendance.length === 0) {
      return { status: 'Not Marked', color: 'bg-gray-100 text-gray-800' };
    }
    
    const presentDays = record.attendance[0]?.presentDays || 0;
    const totalDays = record.attendance[0]?.totalDays || 0;
    
    if (presentDays === totalDays && totalDays > 0) {
      return { status: 'Full Attendance', color: 'bg-green-100 text-green-800' };
    } else if (presentDays > 0) {
      return { status: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
    } else if (totalDays > 0) {
      return { status: 'Absent', color: 'bg-red-100 text-red-800' };
    } else {
      return { status: 'Not Marked', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">Manage student attendance</p>
        </div>
        <Button onClick={() => navigate('/attendance/mark')}>
          <Plus className="w-4 h-4 mr-2" />
          Mark Attendance
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Attendance Records</CardTitle>
            <div className="flex gap-4">
              {/* Fixed Select with proper z-index */}
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Class" />
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
              
              {/* Date Input */}
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-[200px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedClass ? (
            <div className="text-center py-12 text-gray-500">
              Please select a class to view attendance
            </div>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Present Days</TableHead>
                  <TableHead>Total Days</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No attendance records found for this class
                    </TableCell>
                  </TableRow>
                ) : (
                  attendance.map((record) => {
                    const status = getAttendanceStatus(record);
                    const presentDays = record.attendance?.[0]?.presentDays || 0;
                    const totalDays = record.attendance?.[0]?.totalDays || 0;
                    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

                    return (
                      <TableRow key={record._id}>
                        <TableCell>{record.studentId?.rollNo || 'N/A'}</TableCell>
                        <TableCell className="font-medium">{record.studentId?.name || 'Unknown'}</TableCell>
                        <TableCell>{presentDays}</TableCell>
                        <TableCell>{totalDays}</TableCell>
                        <TableCell>{percentage}%</TableCell>
                        <TableCell>
                          <Badge className={status.color}>
                            {status.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceList;