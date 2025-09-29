// Firebase Service Functions with New Database Structure
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    setDoc
  } from 'firebase/firestore'
  import { db, DB_COLLECTIONS, DB_FIELDS, log, logError, logSuccess, logWarning } from '../config/database.js'
  
  // Generic CRUD Operations
  export const firestoreService = {
    // Create document
    async create(collectionName, data) {
      try {
        log(`Creating document in ${collectionName}`, data)
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        logSuccess(`Document created in ${collectionName}`, { id: docRef.id })
        return { id: docRef.id, ...data }
      } catch (error) {
        logError(`Error creating document in ${collectionName}`, error)
        throw error
      }
    },
  
    // Create document with custom ID
    async createWithId(collectionName, docId, data) {
      try {
        log(`Creating document with ID ${docId} in ${collectionName}`, data)
        const docRef = doc(db, collectionName, docId)
        await setDoc(docRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        logSuccess(`Document created with ID ${docId} in ${collectionName}`)
        return { id: docId, ...data }
      } catch (error) {
        logError(`Error creating document with ID ${docId} in ${collectionName}`, error)
        throw error
      }
    },
  
    // Read single document
    async getById(collectionName, id) {
      try {
        log(`Getting document ${id} from ${collectionName}`)
        const docRef = doc(db, collectionName, id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          logSuccess(`Document ${id} found in ${collectionName}`)
          return { id: docSnap.id, ...docSnap.data() }
        }
        logWarning(`Document ${id} not found in ${collectionName}`)
        return null
      } catch (error) {
        logError(`Error getting document ${id} from ${collectionName}`, error)
        throw error
      }
    },
  
    // Read all documents
    async getAll(collectionName) {
      try {
        log(`Getting all documents from ${collectionName}`)
        const querySnapshot = await getDocs(collection(db, collectionName))
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        logSuccess(`Retrieved ${docs.length} documents from ${collectionName}`)
        return docs
      } catch (error) {
        logError(`Error getting documents from ${collectionName}`, error)
        throw error
      }
    },
  
    // Update document
    async update(collectionName, id, data) {
      try {
        log(`Updating document ${id} in ${collectionName}`, data)
        const docRef = doc(db, collectionName, id)
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        })
        logSuccess(`Document ${id} updated in ${collectionName}`)
        return { id, ...data }
      } catch (error) {
        logError(`Error updating document ${id} in ${collectionName}`, error)
        throw error
      }
    },
  
    // Delete document
    async delete(collectionName, id) {
      try {
        log(`Deleting document ${id} from ${collectionName}`)
        const docRef = doc(db, collectionName, id)
        await deleteDoc(docRef)
        logSuccess(`Document ${id} deleted from ${collectionName}`)
        return true
      } catch (error) {
        logError(`Error deleting document ${id} from ${collectionName}`, error)
        throw error
      }
    }
  }
  
  // Student Service - Document ID is student index number
  export const studentService = {
    async getAll() {
      log('Getting all students')
      return await firestoreService.getAll(DB_COLLECTIONS.STUDENTS)
    },
  
    async getByBatch(batch) {
      log(`Getting students for batch ${batch}`)
      const students = await firestoreService.getAll(DB_COLLECTIONS.STUDENTS)
      const filteredStudents = students.filter(student => student.batch === batch)
      logSuccess(`Found ${filteredStudents.length} students for batch ${batch}`)
      return filteredStudents
    },
  
    async getByIndexNo(indexNo) {
      log(`Getting student with index number ${indexNo}`)
      const student = await firestoreService.getById(DB_COLLECTIONS.STUDENTS, indexNo)
      return student
    },
  
    async create(studentData) {
      log('Creating new student', studentData)
      const studentDoc = {
        ...studentData,
        attendanceList: [], // Array of dates when student was present
        examRecords: {} // Map of examId -> {fee, mark, examDate}
      }
      return await firestoreService.createWithId(DB_COLLECTIONS.STUDENTS, studentData.indexNo, studentDoc)
    },
  
    async update(indexNo, studentData) {
      log(`Updating student ${indexNo}`, studentData)
      return await firestoreService.update(DB_COLLECTIONS.STUDENTS, indexNo, studentData)
    },
  
    async delete(indexNo) {
      log(`Deleting student ${indexNo}`)
      return await firestoreService.delete(DB_COLLECTIONS.STUDENTS, indexNo)
    },
  
    // Add attendance date to student
    async addAttendanceDate(indexNo, date) {
      try {
        log(`Adding attendance date ${date} for student ${indexNo}`)
        const docRef = doc(db, DB_COLLECTIONS.STUDENTS, indexNo)
        await updateDoc(docRef, {
          attendanceList: arrayUnion(date),
          updatedAt: serverTimestamp()
        })
        logSuccess(`Attendance date ${date} added for student ${indexNo}`)
      } catch (error) {
        logError(`Error adding attendance date for student ${indexNo}`, error)
        throw error
      }
    },
  
    // Add exam record to student
    async addExamRecord(indexNo, examId, examData) {
      try {
        log(`Adding exam record for student ${indexNo}`, { examId, examData })
        const docRef = doc(db, DB_COLLECTIONS.STUDENTS, indexNo)
        await updateDoc(docRef, {
          [`examRecords.${examId}`]: examData,
          updatedAt: serverTimestamp()
        })
        logSuccess(`Exam record added for student ${indexNo}`)
      } catch (error) {
        logError(`Error adding exam record for student ${indexNo}`, error)
        throw error
      }
    }
  }
  
  // Class Service - Document ID is classId (batch_subject)
  export const classService = {
    async getAll() {
      log('Getting all classes')
      return await firestoreService.getAll(DB_COLLECTIONS.CLASSES)
    },
    
    async getByBatch(batch) {
      log(`Getting classes for batch ${batch}`)
      const classes = await firestoreService.getAll(DB_COLLECTIONS.CLASSES)
      const filteredClasses = classes.filter(cls => cls.batch === batch)
      logSuccess(`Found ${filteredClasses.length} classes for batch ${batch}`)
      return filteredClasses
    },
    
    async getByClassId(classId) {
      log(`Getting class with ID ${classId}`)
      const cls = await firestoreService.getById(DB_COLLECTIONS.CLASSES, classId)
      return cls
    },
    
    async create(classData) {
      log('Creating new class', classData)
      const classDoc = {
        ...classData,
        createdAt: serverTimestamp()
      }
      return await firestoreService.createWithId(DB_COLLECTIONS.CLASSES, classData.classId, classDoc)
    },
    
    async update(classId, classData) {
      log(`Updating class ${classId}`, classData)
      return await firestoreService.update(DB_COLLECTIONS.CLASSES, classId, classData)
    },
    
    async delete(classId) {
      log(`Deleting class ${classId}`)
      return await firestoreService.delete(DB_COLLECTIONS.CLASSES, classId)
    }
  }
  
  // Class Attendance Service - Document ID is classId, field is date
  export const classAttendanceService = {
    async getByDateAndClass(date, classId) {
      log(`Getting class attendance for class ${classId} on ${date}`)
      const docRef = doc(db, DB_COLLECTIONS.CLASS_ATTENDANCE, classId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        const studentIds = data[date] || []
        const studentTimes = data[`${date}_times`] || {}
        logSuccess(`Found ${studentIds.length} students present for class ${classId} on ${date}`)
        return { studentIds, studentTimes }
      }
      
      logWarning(`No attendance record found for class ${classId} on ${date}`)
      return { studentIds: [], studentTimes: {} }
    },
  
    async saveAttendance(classId, date, studentIds, studentTimes = {}) {
      try {
        log(`Saving class attendance for class ${classId} on ${date}`, { studentIds, studentTimes })
        const docRef = doc(db, DB_COLLECTIONS.CLASS_ATTENDANCE, classId)
        await setDoc(docRef, {
          [date]: studentIds,
          [`${date}_times`]: studentTimes,
          updatedAt: serverTimestamp()
        }, { merge: true })
        
        logSuccess(`Class attendance saved for class ${classId} on ${date}`)
        
        // Update individual student attendance lists
        for (const studentId of studentIds) {
          await studentService.addAttendanceDate(studentId, date)
        }
        
      } catch (error) {
        logError(`Error saving class attendance for class ${classId}`, error)
        throw error
      }
    }
  }
  
  // Exam Service - Document ID is exam ID (batch_subject_date)
  export const examService = {
    async getAll() {
      log('Getting all exams')
      return await firestoreService.getAll(DB_COLLECTIONS.EXAMS)
    },
  
    async getByStatus(status) {
      log(`Getting exams with status ${status}`)
      const exams = await firestoreService.getAll(DB_COLLECTIONS.EXAMS)
      const filteredExams = exams.filter(exam => exam.status === status)
      logSuccess(`Found ${filteredExams.length} exams with status ${status}`)
      return filteredExams
    },
  
    async getById(examId) {
      log(`Getting exam ${examId}`)
      return await firestoreService.getById(DB_COLLECTIONS.EXAMS, examId)
    },
  
    async create(examData) {
      log('Creating new exam', examData)
      const examDoc = {
        ...examData,
        status: 'upcoming',
        studentRecords: {}, // Map of studentId -> {fee, mark}
        collectedMoney: 0 // Sum of fees from studentRecords
      }
      return await firestoreService.createWithId(DB_COLLECTIONS.EXAMS, examData.id, examDoc)
    },
  
    async update(examId, examData) {
      log(`Updating exam ${examId}`, examData)
      return await firestoreService.update(DB_COLLECTIONS.EXAMS, examId, examData)
    },
  
    // Add student record to exam
    async addStudentRecord(examId, studentId, recordData) {
      try {
        log(`Adding student record to exam ${examId}`, { studentId, recordData })
        const docRef = doc(db, DB_COLLECTIONS.EXAMS, examId)
        await updateDoc(docRef, {
          [`studentRecords.${studentId}`]: recordData,
          updatedAt: serverTimestamp()
        })
        logSuccess(`Student record added to exam ${examId}`)
      } catch (error) {
        logError(`Error adding student record to exam ${examId}`, error)
        throw error
      }
    },
    
    // Update collected money for exam
    async updateCollectedMoney(examId) {
      try {
        log(`Updating collected money for exam ${examId}`)
        const exam = await this.getById(examId)
        if (!exam) {
          throw new Error(`Exam ${examId} not found`)
        }
        
        let totalCollected = 0
        Object.values(exam.studentRecords || {}).forEach(record => {
          if (record.fee) {
            totalCollected += parseFloat(record.fee) || 0
          }
        })
        
        const docRef = doc(db, DB_COLLECTIONS.EXAMS, examId)
        await updateDoc(docRef, {
          collectedMoney: totalCollected,
          updatedAt: serverTimestamp()
        })
        
        logSuccess(`Collected money updated for exam ${examId}: ${totalCollected}`)
        return totalCollected
      } catch (error) {
        logError(`Error updating collected money for exam ${examId}`, error)
        throw error
      }
    }
  }
  
  // Finance Service
  export const financeService = {
    async getAllTransactions() {
      log('Getting all financial transactions')
      return await firestoreService.getAll(DB_COLLECTIONS.EXPENSES)
    },
  
    async getExpenses() {
      log('Getting expense transactions')
      return await this.getTransactionsByType('expense')
    },
  
    async getIncome() {
      log('Getting income transactions')
      return await this.getTransactionsByType('income')
    },
  
    async getTransactionsByType(type) {
      log(`Getting ${type} transactions`)
      const transactions = await firestoreService.getAll(DB_COLLECTIONS.EXPENSES)
      const filteredTransactions = transactions.filter(transaction => transaction.type === type)
      logSuccess(`Found ${filteredTransactions.length} ${type} transactions`)
      return filteredTransactions
    },
  
    async createTransaction(transactionData) {
      log('Creating new financial transaction', transactionData)
      return await firestoreService.create(DB_COLLECTIONS.EXPENSES, transactionData)
    },
  
    async createExpense(expenseData) {
      log('Creating new expense', expenseData)
      const expense = { ...expenseData, type: 'expense' }
      return await firestoreService.create(DB_COLLECTIONS.EXPENSES, expense)
    },
  
    async createIncome(incomeData) {
      log('Creating new income', incomeData)
      const income = { ...incomeData, type: 'income' }
      return await firestoreService.create(DB_COLLECTIONS.EXPENSES, income)
    },
  
    async updateTransaction(id, transactionData) {
      log(`Updating transaction ${id}`, transactionData)
      return await firestoreService.update(DB_COLLECTIONS.EXPENSES, id, transactionData)
    },
  
    async deleteTransaction(id) {
      log(`Deleting transaction ${id}`)
      return await firestoreService.delete(DB_COLLECTIONS.EXPENSES, id)
    },
  
    // Legacy methods for backward compatibility
    async getAllExpenses() {
      return await this.getAllTransactions()
    },
  
    async getExpensesByType(type) {
      return await this.getTransactionsByType(type)
    },
  
    async updateExpense(id, expenseData) {
      return await this.updateTransaction(id, expenseData)
    },
  
    async deleteExpense(id) {
      return await this.deleteTransaction(id)
    }
  }