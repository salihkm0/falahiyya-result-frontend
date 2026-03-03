import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  User,
  BookOpen,
  Award
} from 'lucide-react';
import { studentAPI, attendanceAPI, examAPI } from '../../services/api';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import toast from 'react-hot-toast';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      const [studentRes, attendanceRes, examsRes] = await Promise.all([
        studentAPI.getById(id),
        attendanceAPI.getByStudent(id),
        examAPI.getByStudent(id)
      ]);
      
      setStudent(studentRes.data);
      setAttendance(attendanceRes.data);
      setExams(examsRes.data);
    } catch (error) {
      toast.error('Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  };

  const getAttendancePercentage = () => {
    if (!attendance || attendance.length === 0) return 0;
    
    let totalPresent = 0;
    let totalDays = 0;
    
    attendance.forEach(record => {
      if (record.attendance && record.attendance.length > 0) {
        totalPresent += record.attendance[0].presentDays || 0;
        totalDays += record.attendance[0].totalDays || 0;
      }
    });
    
    return totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(1) : 0;
  };

  const getAverageMarks = () => {
    if (!exams || exams.length === 0) return 0;
    
    let totalPercentage = 0;
    exams.forEach(exam => {
      if (exam.marks) {
        const percentage = (exam.marks.obtainedMark / exam.marks.totalMark) * 100;
        totalPercentage += percentage;
      }
    });
    
    return (totalPercentage / exams.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found</p>
        <Button onClick={() => navigate('/students')} className="mt-4">
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/students')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-600">Student Details</p>
        </div>
        <Button 
          className="ml-auto"
          onClick={() => navigate(`/students/edit/${student._id}`)}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Student
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-xl font-bold">{getAttendancePercentage()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Marks</p>
                <p className="text-xl font-bold">{getAverageMarks()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Exams</p>
                <p className="text-xl font-bold">{exams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Class</p>
                <p className="text-xl font-bold">{student.classNumber?.classNumber || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Roll Number</p>
              <p className="font-medium">{student.rollNo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Registration No</p>
              <p className="font-medium">{student.regNo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium capitalize">{student.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">{new Date(student.dob).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Guardian</p>
              <p className="font-medium">{student.guardian}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mobile</p>
              <p className="font-medium">{student.mobile || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Place</p>
              <p className="font-medium">{student.place}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Attendance and Exams */}
      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Attendance History</TabsTrigger>
          <TabsTrigger value="exams">Exam Results</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Present Days</TableHead>
                    <TableHead>Total Days</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendance.map((record) => {
                      const presentDays = record.attendance[0]?.presentDays || 0;
                      const totalDays = record.attendance[0]?.totalDays || 0;
                      const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

                      return (
                        <TableRow key={record._id}>
                          <TableCell>{new Date().toLocaleDateString()}</TableCell>
                          <TableCell>{record.classId?.classNumber || 'N/A'}</TableCell>
                          <TableCell>{presentDays}</TableCell>
                          <TableCell>{totalDays}</TableCell>
                          <TableCell>{percentage}%</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle>Exam Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Date</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No exam records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    exams.map((exam) => {
                      const obtained = exam.marks?.obtainedMark || 0;
                      const total = exam.marks?.totalMark || 50;
                      const percentage = ((obtained / total) * 100).toFixed(1);
                      
                      let grade = 'F';
                      if (percentage >= 90) grade = 'A+';
                      else if (percentage >= 80) grade = 'A';
                      else if (percentage >= 70) grade = 'B+';
                      else if (percentage >= 60) grade = 'B';
                      else if (percentage >= 50) grade = 'C';
                      else if (percentage >= 40) grade = 'D';

                      return (
                        <TableRow key={exam._id}>
                          <TableCell>{new Date(exam.examDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {exam.subjects?.map((subject) => (
                                <Badge key={subject._id} variant="secondary">
                                  {subject.subjectName}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{obtained}/{total}</TableCell>
                          <TableCell>{percentage}%</TableCell>
                          <TableCell>
                            <Badge>{grade}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDetails;