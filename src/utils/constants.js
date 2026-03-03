export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  STUDENT: 'student'
};

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late'
};

export const EXAM_GRADES = {
  A_PLUS: { min: 90, grade: 'A+', points: 4.0 },
  A: { min: 80, grade: 'A', points: 3.7 },
  B_PLUS: { min: 70, grade: 'B+', points: 3.3 },
  B: { min: 60, grade: 'B', points: 3.0 },
  C_PLUS: { min: 50, grade: 'C+', points: 2.7 },
  C: { min: 40, grade: 'C', points: 2.3 },
  D: { min: 30, grade: 'D', points: 2.0 },
  F: { min: 0, grade: 'F', points: 0.0 }
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    TEACHERS: '/auth/teachers'
  },
  STUDENTS: {
    BASE: '/student',
    BY_CLASS: (classId) => `/student/class/${classId}`
  },
  CLASSES: {
    BASE: '/class'
  },
  SUBJECTS: {
    BASE: '/subject'
  },
  ATTENDANCE: {
    BASE: '/attendance',
    BY_STUDENT: (studentId) => `/attendance/student/${studentId}`,
    BY_CLASS: (classId) => `/attendance/class/${classId}`
  },
  EXAMS: {
    BASE: '/exams',
    BY_STUDENT: (studentId) => `/exams/student/${studentId}`,
    BY_CLASS: (classId) => `/exams/class/${classId}`,
    MARKS_BY_PHONE: '/exams/marks-by-phone'
  },
  ANNOUNCEMENTS: {
    BASE: '/announcement'
  }
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme'
};

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm'
};