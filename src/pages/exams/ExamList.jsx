import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, MoreHorizontal, FileText } from 'lucide-react';
import { examAPI } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import toast from 'react-hot-toast';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, examId: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    filterExams();
  }, [searchTerm, exams]);

  const fetchExams = async () => {
    try {
      const response = await examAPI.getAll();
      setExams(response.data);
      setFilteredExams(response.data);
    } catch (error) {
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    if (!searchTerm.trim()) {
      setFilteredExams(exams);
      return;
    }

    const filtered = exams.filter(exam => 
      exam.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.studentId?.rollNo?.toString().includes(searchTerm)
    );
    setFilteredExams(filtered);
  };

  const handleDelete = async () => {
    try {
      await examAPI.delete(deleteDialog.examId);
      toast.success('Exam record deleted successfully');
      fetchExams();
    } catch (error) {
      toast.error('Failed to delete exam record');
    } finally {
      setDeleteDialog({ open: false, examId: null });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
          <p className="text-gray-600 mt-1">Manage exam records and marks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/exams/marks-by-phone')}>
            <FileText className="w-4 h-4 mr-2" />
            Search by Phone
          </Button>
          <Button onClick={() => navigate('/exams/add')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Exam
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Exam Records</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by student name or roll no..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Exam Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No exam records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredExams.map((exam) => {
                  const obtained = exam.marks?.obtainedMark || 0;
                  const total = exam.marks?.totalMark || 50;
                  const percentage = getMarksPercentage(obtained, total);
                  const grade = getGrade(percentage);

                  return (
                    <TableRow key={exam._id}>
                      <TableCell className="font-medium">{exam.studentId?.name || 'N/A'}</TableCell>
                      <TableCell>{exam.studentId?.rollNo || 'N/A'}</TableCell>
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
                      <TableCell>{new Date(exam.examDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/exams/${exam._id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/exams/edit/${exam._id}`)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setDeleteDialog({ open: true, examId: exam._id })}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, examId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exam Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this exam record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, examId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamList;