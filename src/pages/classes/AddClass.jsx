import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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

const AddClass = () => {
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachersRes, subjectsRes] = await Promise.all([
        authAPI.getTeachers(),
        subjectAPI.getAll()
      ]);
      setTeachers(teachersRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const classData = {
        ...data,
        classSubjects: data.classSubjects.map(s => s.subjectId)
      };
      await classAPI.create(classData);
      toast.success('Class added successfully');
      navigate('/classes');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Class</CardTitle>
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
                <Select onValueChange={(value) => setValue('classTeacher', value)}>
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
                  onClick={() => append({ subjectId: '' })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <Select onValueChange={(value) => setValue(`classSubjects.${index}.subjectId`, value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject._id} value={subject._id}>
                          {subject.subjectName}
                        </SelectItem>
                      ))}
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
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/classes')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Class'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddClass;