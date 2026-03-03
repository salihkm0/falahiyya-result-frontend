import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { examAPI, studentAPI, subjectAPI, classAPI } from '../../services/api';
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
import { Plus, X, Copy, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AddExam = () => {
  const { register, handleSubmit, control, setValue, watch, getValues, formState: { errors } } = useForm({
    defaultValues: {
      exams: [{
        examDate: '',
        marks: {
          totalMark: 50,
          obtainedMark: 0
        },
        subjects: []
      }]
    }
  });
  
  // Single field array for multiple exams
  const { fields: examFields, append: appendExam, remove: removeExam } = useFieldArray({
    control,
    name: 'exams'
  });

  const [classes, setClasses] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [classSubjects, setClassSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass(selectedClass);
      fetchClassSubjects(selectedClass);
    } else {
      setFilteredStudents([]);
      setClassSubjects([]);
    }
  }, [selectedClass]);

  const fetchInitialData = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        classAPI.getAll(),
        subjectAPI.getAll()
      ]);
      
      setClasses(classesRes.data || []);
      setAllSubjects(subjectsRes.data || []);
      
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch data');
    }
  };

  const fetchStudentsByClass = async (classId) => {
    try {
      setLoading(true);
      const response = await studentAPI.getByClass(classId);
      setFilteredStudents(response.data || []);
      
      // Reset selected student when class changes
      setSelectedStudent('');
      setValue('studentId', '');
      
    } catch (error) {
      console.error('Error fetching students by class:', error);
      toast.error('Failed to fetch students for selected class');
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassSubjects = async (classId) => {
    try {
      const response = await classAPI.getById(classId);
      const classData = response.data;
      
      // Get subjects assigned to this class
      if (classData.classSubjects && classData.classSubjects.length > 0) {
        setClassSubjects(classData.classSubjects);
      } else {
        setClassSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching class subjects:', error);
      toast.error('Failed to fetch class subjects');
    }
  };

  const handleAddExam = () => {
    appendExam({
      examDate: '',
      marks: {
        totalMark: 50,
        obtainedMark: 0
      },
      subjects: []
    });
  };

  const handleCopyExam = (index) => {
    const examData = getValues(`exams.${index}`);
    appendExam({
      examDate: examData.examDate,
      marks: {
        totalMark: examData.marks.totalMark,
        obtainedMark: examData.marks.obtainedMark
      },
      subjects: examData.subjects.map(s => ({ subjectId: s.subjectId }))
    });
    
    toast.success('Exam copied');
  };

  const handleRemoveExam = (index) => {
    if (examFields.length > 1) {
      removeExam(index);
    } else {
      toast.error('At least one exam is required');
    }
  };

  const handleAddSubject = (examIndex) => {
    const currentSubjects = getValues(`exams.${examIndex}.subjects`) || [];
    setValue(`exams.${examIndex}.subjects`, [...currentSubjects, { subjectId: '' }]);
  };

  const handleRemoveSubject = (examIndex, subjectIndex) => {
    const currentSubjects = getValues(`exams.${examIndex}.subjects`) || [];
    const updatedSubjects = currentSubjects.filter((_, index) => index !== subjectIndex);
    setValue(`exams.${examIndex}.subjects`, updatedSubjects);
  };

  const onSubmit = async (data) => {
    if (!selectedClass || !selectedStudent) {
      toast.error('Please select class and student');
      return;
    }

    setLoading(true);
    try {
      // Create multiple exam records
      const promises = data.exams.map(exam => {
        const examData = {
          studentId: selectedStudent,
          subjects: exam.subjects.map(s => s.subjectId),
          marks: exam.marks,
          examDate: exam.examDate
        };
        return examAPI.create(examData);
      });

      await Promise.all(promises);
      toast.success(`${data.exams.length} exam record(s) added successfully`);
      navigate('/exams');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to add exam records');
    } finally {
      setLoading(false);
    }
  };

  // Get available subjects for dropdown
  const getAvailableSubjects = () => {
    return classSubjects.length > 0 ? classSubjects : allSubjects;
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      <Card>
        <CardHeader>
          <CardTitle>Add Exam Records</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Common Fields - Class and Student */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Class Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Class *</label>
                <Select 
                  onValueChange={(value) => {
                    setSelectedClass(value);
                    setValue('classId', value);
                  }}
                  value={selectedClass}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper" 
                    className="z-[100] bg-white"
                  >
                    {classes.length > 0 ? (
                      classes.map((cls) => (
                        <SelectItem key={cls._id} value={cls._id}>
                          {cls.classNumber} {cls.section ? `- Section ${cls.section}` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        No classes available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.classId && (
                  <p className="text-sm text-red-500">Class is required</p>
                )}
              </div>

              {/* Student Selection - Filtered by Class */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Student *</label>
                <Select 
                  onValueChange={(value) => {
                    setSelectedStudent(value);
                    setValue('studentId', value);
                  }}
                  value={selectedStudent}
                  disabled={!selectedClass || loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      !selectedClass 
                        ? "Select a class first" 
                        : loading 
                        ? "Loading students..." 
                        : "Select student"
                    } />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper" 
                    className="z-[100] bg-white max-h-[300px]"
                  >
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <SelectItem key={student._id} value={student._id}>
                          {student.name} (Roll: {student.rollNo})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {selectedClass 
                          ? "No students found in this class" 
                          : "Select a class to view students"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.studentId && (
                  <p className="text-sm text-red-500">Student is required</p>
                )}
              </div>
            </div>

            {/* Multiple Exams Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Exam Details</h3>
              
              {examFields.map((examField, examIndex) => {
                const subjects = watch(`exams.${examIndex}.subjects`) || [];
                
                return (
                  <Card key={examField.id} className="border-2 border-gray-200">
                    <CardHeader className="py-3 px-4 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Exam #{examIndex + 1}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyExam(examIndex)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveExam(examIndex)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {/* Exam Fields */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Exam Date *</label>
                          <Input
                            type="date"
                            {...register(`exams.${examIndex}.examDate`, { 
                              required: 'Exam date is required' 
                            })}
                            className="w-full"
                          />
                          {errors.exams?.[examIndex]?.examDate && (
                            <p className="text-sm text-red-500">Date required</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Total Marks *</label>
                          <Input
                            type="number"
                            {...register(`exams.${examIndex}.marks.totalMark`, { 
                              required: 'Total marks is required',
                              valueAsNumber: true,
                              min: { value: 1, message: 'Min 1' }
                            })}
                            placeholder="Enter total marks"
                            className="w-full"
                          />
                          {errors.exams?.[examIndex]?.marks?.totalMark && (
                            <p className="text-sm text-red-500">Required</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Obtained Marks *</label>
                          <Input
                            type="number"
                            {...register(`exams.${examIndex}.marks.obtainedMark`, { 
                              required: 'Obtained marks is required',
                              valueAsNumber: true,
                              min: { value: 0, message: 'Cannot be negative' }
                            })}
                            placeholder="Enter obtained marks"
                            className="w-full"
                          />
                          {errors.exams?.[examIndex]?.marks?.obtainedMark && (
                            <p className="text-sm text-red-500">Required</p>
                          )}
                        </div>
                      </div>

                      {/* Subjects for this exam */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium">Subjects</label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddSubject(examIndex)}
                            disabled={!selectedClass}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Subject
                          </Button>
                        </div>

                        {subjects.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-2">
                            No subjects added. Click "Add Subject" to add subjects.
                          </p>
                        )}

                        {subjects.map((subject, subjectIndex) => (
                          <div key={subjectIndex} className="flex gap-2 items-center">
                            <Select 
                              onValueChange={(value) => 
                                setValue(`exams.${examIndex}.subjects.${subjectIndex}.subjectId`, value)
                              }
                              value={subjects[subjectIndex]?.subjectId}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                              <SelectContent 
                                position="popper"
                                className="z-[100] bg-white max-h-[300px]"
                              >
                                {getAvailableSubjects().length > 0 ? (
                                  getAvailableSubjects().map((subject) => (
                                    <SelectItem key={subject._id} value={subject._id}>
                                      {subject.subjectName}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-data" disabled>
                                    {selectedClass 
                                      ? "No subjects assigned to this class" 
                                      : "Select a class first"}
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveSubject(examIndex, subjectIndex)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Add Another Exam Button - Moved to bottom */}
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  onClick={handleAddExam}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Exam
                </Button>
              </div>
            </div>

            {/* Selected Student Info */}
            {selectedStudent && filteredStudents.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Selected Student:</h4>
                {filteredStudents
                  .filter(s => s._id === selectedStudent)
                  .map(student => (
                    <div key={student._id} className="text-sm text-blue-600">
                      <p><span className="font-medium">Name:</span> {student.name}</p>
                      <p><span className="font-medium">Roll No:</span> {student.rollNo}</p>
                      <p><span className="font-medium">Registration No:</span> {student.regNo}</p>
                      <p><span className="font-medium">Guardian:</span> {student.guardian}</p>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/exams')}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !selectedClass || !selectedStudent}
              >
                {loading ? 'Adding...' : `Add ${examFields.length} Exam Record(s)`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddExam;