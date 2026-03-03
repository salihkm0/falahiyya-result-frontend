import axiosInstance from './axiosInstance';

// Auth APIs
export const authAPI = {
  login: (data) => axiosInstance.post('/auth/login', data),
  register: (data) => axiosInstance.post('/auth/register', data),
  getTeachers: () => axiosInstance.get('/auth/teachers'),
};

// Student APIs
export const studentAPI = {
  getAll: () => axiosInstance.get('/student'),
  getById: (id) => axiosInstance.get(`/student/${id}`),
  getByClass: (classId) => axiosInstance.get(`/student/class/${classId}`),
  create: (data) => axiosInstance.post('/student', data),
  update: (id, data) => axiosInstance.put(`/student/${id}`, data),
  delete: (id) => axiosInstance.delete(`/student/${id}`),
};

// Class APIs
export const classAPI = {
  getAll: () => axiosInstance.get('/class'),
  getById: (id) => axiosInstance.get(`/class/${id}`),
  create: (data) => axiosInstance.post('/class', data),
  update: (id, data) => axiosInstance.put(`/class/${id}`, data),
  delete: (id) => axiosInstance.delete(`/class/${id}`),
};

// Subject APIs
export const subjectAPI = {
  getAll: () => axiosInstance.get('/subject'),
  create: (data) => axiosInstance.post('/subject', data),
};

// Exam APIs - Updated to match backend routes
export const examAPI = {
  // Get all exams
  getAll: () => axiosInstance.get('/exams'),
  
  // Get exam by ID
  getById: (id) => axiosInstance.get(`/exams/${id}`),
  
  // Get exams by student ID
  getByStudent: (studentId) => axiosInstance.get(`/exams/student/${studentId}`),
  
  // Get exams by class ID
  getByClass: (classId) => axiosInstance.get(`/exams/class/${classId}`),
  
  // Create new exam
  create: (data) => axiosInstance.post('/exams', data),
  
  // Update exam by ID
  update: (id, data) => axiosInstance.put(`/exams/${id}`, data),
  
  // Delete exam by ID
  delete: (id) => axiosInstance.delete(`/exams/${id}`),
  
  // Get student marks by phone and class (for result search)
  getMarksByPhoneAndClass: (data) => axiosInstance.post('/exams/marks-by-phone', data),
};

// Attendance APIs
export const attendanceAPI = {
  // Get attendance by student ID
  getByStudent: (studentId) => axiosInstance.get(`/attendance/student/${studentId}`),
  
  // Get attendance by class ID
  getByClass: (classId) => axiosInstance.get(`/attendance/class/${classId}`),
  
  // Create new attendance
  create: (data) => axiosInstance.post('/attendance', data),
  
  // Update attendance by ID
  update: (id, data) => axiosInstance.put(`/attendance/${id}`, data),
  
  // Delete attendance by ID
  delete: (id) => axiosInstance.delete(`/attendance/${id}`),
};