// Firebase Configuration
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyClXV9PzskFjGVzTa2OVG3nJQZ170qjrrE",
  authDomain: "pesalai-undergraduate.firebaseapp.com",
  projectId: "pesalai-undergraduate",
  storageBucket: "pesalai-undergraduate.firebasestorage.app",
  messagingSenderId: "819849679669",
  appId: "1:819849679669:web:418491be5cbfa0fc62b27c",
  measurementId: "G-T9X602C1X2"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Database Collections and Field Names
export const DB_COLLECTIONS = {
  STUDENTS: 'students',
  CLASSES: 'classes',
  CLASS_ATTENDANCE: 'classAttendance',
  EXAMS: 'exams',
  EXPENSES: 'expenses'
}

export const DB_FIELDS = {
  // Student fields
  STUDENT: {
    INDEX_NO: 'indexNo',
    NAME: 'name',
    GENDER: 'gender',
    PARENT_PHONE: 'parentPhone',
    BATCH: 'batch',
    STREAM: 'stream', // BIO or MATH
    ATTENDANCE_LIST: 'attendanceList', // Array of dates
    EXAM_RECORDS: 'examRecords' // Map of examId -> {fee, mark, examDate}
  },
  
  // Class fields
  CLASS: {
    CLASS_ID: 'classId',
    BATCH: 'batch',
    SUBJECT: 'subject', // BIO, MATH, PHY, CHE
    CREATED_AT: 'createdAt'
  },
  
  // Class Attendance fields (classId as document ID)
  CLASS_ATTENDANCE: {
    STUDENT_IDS: 'studentIds' // Array of student IDs for the date
  },
  
  // Exam fields
  EXAM: {
    SUBJECT: 'subject',
    BATCH: 'batch',
    DATE: 'date',
    FEE: 'fee',
    STATUS: 'status',
    TOTAL_INCOME: 'totalIncome',
    COLLECTED_MONEY: 'collectedMoney', // Sum of fees from studentRecords
    COMPLETED_AT: 'completedAt',
    STUDENT_RECORDS: 'studentRecords' // Map of studentId -> {fee, mark}
  },
  
  // Expense fields
  EXPENSE: {
    AMOUNT: 'amount',
    REASON: 'reason',
    DATE: 'date',
    TYPE: 'type'
  }
}

// Constants
export const CONSTANTS = {
  BATCHES: {
    BATCH_26AL: '26AL',
    BATCH_27AL: '27AL'
  },
  
  STREAMS: {
    BIO: 'BIO',
    MATH: 'MATH'
  },
  
  SUBJECTS: {
    BIO: 'BIO',
    MATH: 'MATH',
    PHY: 'PHY',
    CHE: 'CHE'
  },
  
  GENDERS: {
    MALE: 'M',
    FEMALE: 'F'
  },
  
  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent'
  },
  
  EXAM_STATUS: {
    UPCOMING: 'upcoming',
    ACTIVE: 'active',
    COMPLETED: 'completed'
  },
  
  EXPENSE_TYPES: {
    INCOME: 'income',
    EXPENSE: 'expense'
  },
  
  ADMIN_PASSWORD: 'pesalai2025',
  
  APP_NAME: 'Pesalai Undergraduates',
  APP_SLOGAN: 'Choose harder rights, not easier wrongs',
  
  // Date format for consistency
  DATE_FORMAT: 'YYYY-MM-DD'
}

// Utility Functions
export const generateExamId = (batch, subject, date) => {
  const dateStr = date.replace(/-/g, '')
  return `${batch}_${subject.toLowerCase()}_${dateStr}`
}

export const generateClassId = (batch, subject) => {
  return `${batch}_${subject.toLowerCase()}`
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0]
}

export const formatDateForSystem = (date) => {
  // Always use YYYY-MM-DD format for consistency
  if (typeof date === 'string') {
    return date.split('T')[0] // Remove time part if present
  }
  return date.toISOString().split('T')[0]
}

export const generateExpenseId = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const year = now.getFullYear()
  return `${month}${hour}${minute}${day}${year}`
}

// Console logging utility
export const log = (message, data = null, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  const prefix = `[${timestamp}] [${type.toUpperCase()}]`
  
  if (data) {
    console.log(`${prefix} ${message}:`, data)
  } else {
    console.log(`${prefix} ${message}`)
  }
}

export const logError = (message, error) => {
  log(message, error, 'error')
}

export const logSuccess = (message, data = null) => {
  log(message, data, 'success')
}

export const logWarning = (message, data = null) => {
  log(message, data, 'warning')
}
