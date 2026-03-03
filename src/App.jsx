import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';

// Students
import StudentList from './pages/students/StudentList';
import AddStudent from './pages/students/AddStudent';
import StudentDetails from './pages/students/StudentDetails';
import EditStudent from './pages/students/EditStudent'; 

// Teachers
import TeacherList from './pages/teachers/TeacherList';
import AddTeacher from './pages/teachers/AddTeacher';

// Classes
import ClassList from './pages/classes/ClassList';
import AddClass from './pages/classes/AddClass';
import EditClass from './pages/classes/EditClass'; 
// Subjects
import SubjectList from './pages/subjects/SubjectList';

// Attendance
import AttendanceList from './pages/attendance/AttendanceList';
import MarkAttendance from './pages/attendance/MarkAttendance';

// Exams
import ExamList from './pages/exams/ExamList';
import AddExam from './pages/exams/AddExam';
import StudentMarksByPhone from './pages/exams/StudentMarksByPhone';
import Result from './pages/result/Result';
import ResultMain from './pages/result/ResultMain';
import ResultDetails from './pages/result/ResultDetails';
import EditTeacher from './pages/teachers/EditTeacher';
import EditExam from './pages/exams/EditExam';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/results" element={<ResultMain />} />
      <Route path="/result/:studentId" element={<ResultDetails />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Student Routes */}
        <Route path="students" element={<StudentList />} />
        <Route path="students/add" element={<AddStudent />} />
        <Route path="students/:id" element={<StudentDetails />} />
        <Route path="students/edit/:id" element={<EditStudent />} />
        
        {/* Teacher Routes */}
        <Route path="teachers" element={<TeacherList />} />
        <Route path="teachers/add" element={<AddTeacher />} />
        <Route path="teachers/edit/:id" element={<EditTeacher />} />
        
        {/* Class Routes */}
        <Route path="classes" element={<ClassList />} />
        <Route path="classes/add" element={<AddClass />} />
        <Route path="classes/edit/:id" element={<EditClass />} />
        
        {/* Subject Routes */}
        <Route path="subjects" element={<SubjectList />} />
        
        {/* Attendance Routes */}
        <Route path="attendance" element={<AttendanceList />} />
        <Route path="attendance/mark" element={<MarkAttendance />} />
        
        {/* Exam Routes */}
        <Route path="exams" element={<ExamList />} />
        <Route path="exams/add" element={<AddExam />} />
        <Route path="exams/edit/:id" element={<EditExam />} />
        <Route path="exams/marks-by-phone" element={<StudentMarksByPhone />} />
      </Route>
    </Routes>
  );
}

export default App;