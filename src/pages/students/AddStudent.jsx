import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { studentAPI, classAPI } from '../../services/api';
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
import toast from 'react-hot-toast';

const AddStudent = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      setClasses(response.data);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await studentAPI.create(data);
      toast.success('Student added successfully');
      navigate('/students');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Enter student name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Roll Number *</label>
                <Input
                  type="number"
                  {...register('rollNo', { 
                    required: 'Roll number is required',
                    valueAsNumber: true 
                  })}
                  placeholder="Enter roll number"
                />
                {errors.rollNo && (
                  <p className="text-sm text-red-500">{errors.rollNo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Registration Number *</label>
                <Input
                  {...register('regNo', { required: 'Registration number is required' })}
                  placeholder="Enter registration number"
                />
                {errors.regNo && (
                  <p className="text-sm text-red-500">{errors.regNo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Class *</label>
                <Select onValueChange={(value) => setValue('classNumber', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        Class {cls.classNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.classNumber && (
                  <p className="text-sm text-red-500">Class is required</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Guardian Name *</label>
                <Input
                  {...register('guardian', { required: 'Guardian name is required' })}
                  placeholder="Enter guardian name"
                />
                {errors.guardian && (
                  <p className="text-sm text-red-500">{errors.guardian.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile Number</label>
                <Input
                  type="tel"
                  {...register('mobile')}
                  placeholder="Enter mobile number"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Place *</label>
                <Input
                  {...register('place', { required: 'Place is required' })}
                  placeholder="Enter place"
                />
                {errors.place && (
                  <p className="text-sm text-red-500">{errors.place.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gender *</label>
                <Select onValueChange={(value) => setValue('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-500">Gender is required</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth *</label>
                <Input
                  type="date"
                  {...register('dob', { required: 'Date of birth is required' })}
                />
                {errors.dob && (
                  <p className="text-sm text-red-500">{errors.dob.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/students')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Student'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddStudent;