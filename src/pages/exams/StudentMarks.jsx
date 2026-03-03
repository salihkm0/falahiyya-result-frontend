import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { examAPI } from '../../services/api';
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
import { Badge } from '../../components/ui/badge';
import { Award, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentMarks = () => {
  const { studentId } = useParams();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    averagePercentage: 0,
    highestMarks: 0,
    lowestMarks: 100
  });

  useEffect(() => {
    if (studentId) {
      fetchStudentMarks();
    }
  }, [studentId]);

  const fetchStudentMarks = async () => {
    try {
      const response = await examAPI.getByStudent(studentId);
      setExams(response.data);
      
      // Calculate stats
      if (response.data.length > 0) {
        let totalPercentage = 0;
        let highest = 0;
        let lowest = 100;
        
        response.data.forEach(exam => {
          if (exam.marks) {
            const percentage = (exam.marks.obtainedMark / exam.marks.totalMark) * 100;
            totalPercentage += percentage;
            
            if (percentage > highest) highest = percentage;
            if (percentage < lowest) lowest = percentage;
          }
        });
        
        setStats({
          totalExams: response.data.length,
          averagePercentage: (totalPercentage / response.data.length).toFixed(1),
          highestMarks: highest.toFixed(1),
          lowestMarks: lowest.toFixed(1)
        });
      }
    } catch (error) {
      toast.error('Failed to fetch student marks');
    } finally {
      setLoading(false);
    }
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'bg-green-100 text-green-800' };
    if (percentage >= 80) return { grade: 'A', color: 'bg-green-100 text-green-800' };
    if (percentage >= 70) return { grade: 'B+', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 60) return { grade: 'B', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 50) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800' };
    if (percentage >= 40) return { grade: 'D', color: 'bg-orange-100 text-orange-800' };
    return { grade: 'F', color: 'bg-red-100 text-red-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Marks</h1>
        <p className="text-gray-600 mt-1">View all exam marks for this student</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Exams</p>
                <p className="text-xl font-bold">{stats.totalExams}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average</p>
                <p className="text-xl font-bold">{stats.averagePercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Highest</p>
                <p className="text-xl font-bold">{stats.highestMarks}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Lowest</p>
                <p className="text-xl font-bold">{stats.lowestMarks}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Marks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Exam History</CardTitle>
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
                  const grade = getGrade(percentage);

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
                        <Badge className={grade.color}>
                          {grade.grade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMarks;