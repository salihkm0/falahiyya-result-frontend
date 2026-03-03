import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { classAPI, subjectAPI, authAPI } from '../../services/api';
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
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EditClass = () => {
  const { id } = useParams();
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      classSubjects: []
    }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'classSubjects'
  });
  
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const navigate = useNavigate();

  // Watch subjects to get selected values
  const selectedSubjects = watch('classSubjects') || [];

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [teachersRes, subjectsRes, classRes] = await Promise.all([
        authAPI.getTeachers(),
        subjectAPI.getAll(),
        classAPI.getById(id)
      ]);
      
      setTeachers(teachersRes.data);
      setSubjects(subjectsRes.data);
      
      const classData = classRes.data;
      
      // Populate form fields
      setValue('classNumber', classData.classNumber);
      setValue('classTeacher', classData.classTeacher?._id);
      setValue('classTime.start', classData.classTime?.start);
      setValue('classTime.end', classData.classTime?.end);
      
      // Clear existing subjects first
      setValue('classSubjects', []);
      
      // Populate subjects - check for duplicates in the original data
      if (classData.classSubjects && classData.classSubjects.length > 0) {
        // Use a Set to track unique subject IDs
        const uniqueSubjectIds = new Set();
        
        classData.classSubjects.forEach(subject => {
          const subjectId = subject._id || subject;
          
          // Only add if not already added
          if (!uniqueSubjectIds.has(subjectId)) {
            uniqueSubjectIds.add(subjectId);
            append({ subjectId: subjectId });
          }
        });
      }
      
    } catch (error) {
      console.error('Error fetching class data:', error);
      toast.error('Failed to fetch class data');
      navigate('/classes');
    } finally {
      setFetchLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Remove any duplicate subjects before submitting
      const uniqueSubjects = [];
      const subjectIds = new Set();
      
      data.classSubjects.forEach(item => {
        if (item.subjectId && !subjectIds.has(item.subjectId)) {
          subjectIds.add(item.subjectId);
          uniqueSubjects.push(item);
        }
      });
      
      const classData = {
        ...data,
        classSubjects: uniqueSubjects.map(s => s.subjectId)
      };
      
      await classAPI.update(id, classData);
      toast.success('Class updated successfully');
      navigate('/classes');
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error(error.response?.data?.message || 'Failed to update class');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = () => {
    append({ subjectId: '' });
  };

  const handleSubjectChange = (index, value) => {
    // Check if this subject is already selected elsewhere
    const isDuplicate = selectedSubjects.some((subject, i) => 
      i !== index && subject?.subjectId === value
    );

    if (isDuplicate) {
      toast.error('This subject is already added');
      return;
    }

    setValue(`classSubjects.${index}.subjectId`, value);
  };

  const getAvailableSubjects = (currentIndex) => {
    // Get IDs of subjects already selected (excluding current one)
    const selectedIds = selectedSubjects
      .map((subject, index) => index !== currentIndex ? subject?.subjectId : null)
      .filter(id => id != null);

    // Return subjects that are not already selected
    return subjects.filter(subject => !selectedIds.includes(subject._id));
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Class</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Class Number *</label>
                <Input
                  {...register('classNumber', { required: 'Class number is required' })}
                  placeholder="e.g., 10A, 9B"
                />
                {errors.classNumber && (
                  <p className="text-sm text-red-500">{errors.classNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Class Teacher</label>
                <Select 
                  onValueChange={(value) => setValue('classTeacher', value)}
                  defaultValue={watch('classTeacher')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time *</label>
                <Input
                  type="time"
                  {...register('classTime.start', { required: 'Start time is required' })}
                />
                {errors.classTime?.start && (
                  <p className="text-sm text-red-500">{errors.classTime.start.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Time *</label>
                <Input
                  type="time"
                  {...register('classTime.end', { required: 'End time is required' })}
                />
                {errors.classTime?.end && (
                  <p className="text-sm text-red-500">{errors.classTime.end.message}</p>
                )}
              </div>
            </div>

            {/* Subjects */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Subjects</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSubject}
                  disabled={subjects.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </div>

              {fields.map((field, index) => {
                const availableSubjects = getAvailableSubjects(index);
                
                return (
                  <div key={field.id} className="flex gap-2 items-center">
                    <Select 
                      onValueChange={(value) => handleSubjectChange(index, value)}
                      defaultValue={field.subjectId}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubjects.length > 0 ? (
                          availableSubjects.map((subject) => (
                            <SelectItem key={subject._id} value={subject._id}>
                              {subject.subjectName}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-data" disabled>
                            No available subjects
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}

              {fields.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No subjects added. Click "Add Subject" to add subjects.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/classes')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Class'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditClass;