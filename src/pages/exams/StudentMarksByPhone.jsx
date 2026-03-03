import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { examAPI } from '../../services/api';
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
import { Badge } from '../../components/ui/badge';
import { Search, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentMarksByPhone = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [marksData, setMarksData] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await examAPI.getMarksByPhone({
        mobile: data.mobile,
        classId: data.classId
      });
      setMarksData(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'No records found');
      setMarksData(null);
    } finally {
      setLoading(false);
    }
  };

  const getMarksPercentage = (obtained, total) => {
    return ((obtained / total) * 100).toFixed(1);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Search Student Marks</h1>
        <p className="text-gray-600 mt-1">View marks by phone number and class</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    className="pl-10"
                    placeholder="Enter 10-digit mobile number"
                    {...register('mobile', { 
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Please enter a valid 10-digit mobile number'
                      }
                    })}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-sm text-red-500">{errors.mobile.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Class ID</label>
                <Input
                  placeholder="Enter class ID (optional)"
                  {...register('classId')}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                'Searching...'
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {marksData && (
        <Card>
          <CardHeader>
            <CardTitle>Marks Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg">{marksData.student?.name}</h3>
              <p className="text-gray-600">Roll No: {marksData.student?.rollNo} | Class: {marksData.student?.classNumber?.classNumber}</p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Marks Obtained</TableHead>
                  <TableHead>Total Marks</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Exam Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marksData.marks?.map((exam, index) => {
                  const percentage = getMarksPercentage(exam.obtainedMark, exam.totalMark);
                  const grade = getGrade(percentage);
                  
                  return exam.subjects?.map((subject, subIndex) => (
                    <TableRow key={`${index}-${subIndex}`}>
                      <TableCell>{subject.subjectName}</TableCell>
                      <TableCell>{exam.obtainedMark}</TableCell>
                      <TableCell>{exam.totalMark}</TableCell>
                      <TableCell>{percentage}%</TableCell>
                      <TableCell>
                        <Badge className={grade.color}>
                          {grade.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(exam.examDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentMarksByPhone;