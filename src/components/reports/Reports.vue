<template>
  <div class="reports-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container-fluid">
        <div class="header-content">
          <div class="header-left">
            <h1><i class="fas fa-file-pdf"></i> Reports & Marks</h1>
            <p>Generate PDF reports and manage student marks</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Generation -->
    <div class="reports-content">
      <div class="container-fluid">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading exams...</p>
        </div>
        
        <div v-else-if="completedExams.length === 0" class="empty-state">
          <i class="fas fa-file-pdf"></i>
          <h3>No completed exams</h3>
          <p>Complete exams to generate reports</p>
          <router-link to="/exams" class="btn btn-primary">
            <i class="fas fa-clipboard-list"></i>
            Go to Exams
          </router-link>
        </div>
        
        <div v-else class="reports-sections">
          <!-- Exam Selection -->
          <div class="exam-selection">
            <h3>Select Exam for Report</h3>
            <div class="exams-grid">
              <div 
                v-for="exam in completedExams" 
                :key="exam.id" 
                class="exam-card"
                :class="{ selected: selectedExam?.id === exam.id }"
                @click="selectExam(exam)"
              >
                <div class="exam-header">
                  <h4>{{ exam.subject }}</h4>
                  <span class="exam-batch">{{ exam.batch }}</span>
                </div>
                <div class="exam-details">
                  <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>{{ formatDate(exam.date) }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="fas fa-users"></i>
                    <span>{{ getAttendedCount(exam) }} students</span>
                  </div>
                  <div class="detail-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span>Rs. {{ exam.totalIncome || 0 }}</span>
                  </div>
                </div>
                <div class="exam-status">
                  <i class="fas fa-check-circle"></i>
                  <span>{{ hasMarks(exam.id) ? 'Marks Added' : 'Marks Pending' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Marks Management -->
          <div v-if="selectedExam" class="marks-section">
            <div class="section-header">
              <h3>Manage Marks - {{ selectedExam.subject }} ({{ selectedExam.batch }})</h3>
              <div class="section-actions">
                <button @click="generateReport" class="btn btn-primary">
                  <i class="fas fa-file-pdf"></i>
                  Generate PDF Report
                </button>
              </div>
            </div>
            
            <div class="marks-table-container">
              <div v-if="attendedStudents.length === 0" class="no-students">
                <p>No students attended this exam</p>
              </div>
              
              <div v-else class="marks-table">
                <div class="table-header">
                  <div class="header-cell">Index No</div>
                  <div class="header-cell">Student Name</div>
                  <div class="header-cell">Marks</div>
                  <div class="header-cell">Grade</div>
                </div>
                
                <div class="table-body">
                  <div 
                    v-for="student in attendedStudents" 
                    :key="student.indexNo" 
                    class="table-row"
                  >
                    <div class="table-cell">{{ student.indexNo }}</div>
                    <div class="table-cell">{{ student.name }}</div>
                    <div class="table-cell">
                      <span class="mark-display">{{ student.mark || '-' }}</span>
                    </div>
                    <div class="table-cell">
                      <span class="grade-badge" :class="getGradeClass(student.grade)">
                        {{ student.grade || '-' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Marks Summary -->
            <div class="marks-summary">
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="label">Total Students:</span>
                  <span class="value">{{ attendedStudents.length }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Average Mark:</span>
                  <span class="value">{{ averageMark }}%</span>
                </div>
                <div class="stat-item">
                  <span class="label">Highest Mark:</span>
                  <span class="value">{{ highestMark }}%</span>
                </div>
                <div class="stat-item">
                  <span class="label">Pass Rate:</span>
                  <span class="value">{{ passRate }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
      <router-link to="/dashboard" class="nav-link">
        <i class="fas fa-home"></i>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/students" class="nav-link">
        <i class="fas fa-users"></i>
        <span>Students</span>
      </router-link>
      <router-link to="/attendance" class="nav-link">
        <i class="fas fa-calendar-check"></i>
        <span>Attendance</span>
      </router-link>
      <router-link to="/exams" class="nav-link">
        <i class="fas fa-clipboard-list"></i>
        <span>Exams</span>
      </router-link>
      <router-link to="/finance" class="nav-link">
        <i class="fas fa-chart-line"></i>
        <span>Finance</span>
      </router-link>
      <router-link to="/reports" class="nav-link active">
        <i class="fas fa-file-pdf"></i>
        <span>Reports</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
import { CONSTANTS } from '../../config/database.js'
import { examService, studentService } from '../../services/firestore.js'
import { log, logError, logSuccess, logWarning } from '../../config/database.js'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default {
  name: 'Reports',
  data() {
    return {
      CONSTANTS,
      exams: [],
      marks: [],
      students: [],
      selectedExam: null,
      attendedStudents: [],
      loading: true
    }
  },
  
  computed: {
    completedExams() {
      return this.exams.filter(exam => exam.status === CONSTANTS.EXAM_STATUS.COMPLETED)
    },
    
    averageMark() {
      const validMarks = this.attendedStudents.filter(s => s.mark != null && s.mark !== '')
      if (validMarks.length === 0) return 0
      const sum = validMarks.reduce((total, student) => total + (student.mark || 0), 0)
      return Math.round(sum / validMarks.length)
    },
    
    highestMark() {
      const validMarks = this.attendedStudents.filter(s => s.mark != null && s.mark !== '')
      if (validMarks.length === 0) return 0
      return Math.max(...validMarks.map(s => s.mark || 0))
    },
    
    passRate() {
      const validMarks = this.attendedStudents.filter(s => s.mark != null && s.mark !== '')
      if (validMarks.length === 0) return 0
      const passedStudents = validMarks.filter(s => (s.mark || 0) >= 40)
      return Math.round((passedStudents.length / validMarks.length) * 100)
    }
  },
  
  async mounted() {
    await this.loadData()
    
    // Check if exam ID is provided in query params
    const examId = this.$route.query.exam
    if (examId) {
      const exam = this.completedExams.find(e => e.id === examId)
      if (exam) {
        await this.selectExam(exam)
      }
    }
  },
  
  methods: {
    async loadData() {
      try {
        log('Loading reports data')
        this.loading = true
        
        // Load exams and students
        const [exams, students] = await Promise.all([
          examService.getAll(),
          studentService.getAll()
        ])
        
        this.exams = exams
        this.students = students
        logSuccess(`Loaded ${exams.length} exams and ${students.length} students`)
        
      } catch (error) {
        logError('Error loading reports data', error)
        this.showToast('Failed to load data', 'error')
      } finally {
        this.loading = false
      }
    },
    
    async selectExam(exam) {
      try {
        log(`Selecting exam ${exam.subject} for marks management`)
        this.selectedExam = exam
        
        // Get students who attended this exam from studentRecords
        const attendedStudentIds = Object.keys(exam.studentRecords || {})
        log(`Found ${attendedStudentIds.length} students who attended the exam`)
        
        // Get student details for attended students
        this.attendedStudents = attendedStudentIds.map(studentId => {
          const student = this.students.find(s => s.indexNo === studentId)
          if (!student) return null
          
          // Get existing marks from exam studentRecords
          const examRecord = exam.studentRecords[studentId]
          
          return {
            ...student,
            mark: examRecord?.mark || '',
            grade: examRecord?.mark ? this.calculateGradeFromMark(examRecord.mark) : '',
            examRecord: examRecord
          }
        }).filter(Boolean)
        
        // Sort by index number
        this.attendedStudents.sort((a, b) => a.indexNo.localeCompare(b.indexNo))
        logSuccess(`Loaded ${this.attendedStudents.length} students for marks management`)
        
      } catch (error) {
        logError('Error selecting exam', error)
        this.showToast('Failed to load exam data', 'error')
      }
    },
    
    calculateGrade(student) {
      if (student.mark == null || student.mark === '') {
        student.grade = ''
        return
      }
      
      student.grade = this.calculateGradeFromMark(student.mark)
    },
    
    calculateGradeFromMark(mark) {
      if (mark >= 75) return 'A'
      if (mark >= 65) return 'B'
      if (mark >= 55) return 'C'
      if (mark >= 40) return 'S'
      return 'F'
    },
    
    getGradeClass(grade) {
      switch (grade) {
        case 'A': return 'grade-a'
        case 'B': return 'grade-b'
        case 'C': return 'grade-c'
        case 'S': return 'grade-s'
        case 'F': return 'grade-f'
        default: return ''
      }
    },
    
    hasMarks(examId) {
      const exam = this.exams.find(e => e.id === examId)
      if (!exam || !exam.studentRecords) return false
      
      // Check if any student has marks
      return Object.values(exam.studentRecords).some(record => record.mark != null)
    },
    
    getAttendedCount(exam) {
      if (!exam.studentRecords) return 0
      return Object.keys(exam.studentRecords).length
    },
    
    async generateReport() {
      try {
        if (!this.selectedExam || !this.hasMarks(this.selectedExam.id)) {
          logWarning('Cannot generate report - no marks available')
          this.showToast('Please add marks before generating report', 'error')
          return
        }
        
        log(`Generating PDF report for exam ${this.selectedExam.subject}`)
        
        // Create PDF
        const doc = new jsPDF()
        
        // Header
        doc.setFontSize(20)
        doc.setFont(undefined, 'bold')
        doc.text(CONSTANTS.APP_NAME, 105, 20, { align: 'center' })
        
        doc.setFontSize(12)
        doc.setFont(undefined, 'italic')
        doc.text(CONSTANTS.APP_SLOGAN, 105, 30, { align: 'center' })
        
        // Exam details
        doc.setFontSize(16)
        doc.setFont(undefined, 'bold')
        doc.text(`${this.selectedExam.subject} - ${this.selectedExam.batch}`, 105, 45, { align: 'center' })
        
        doc.setFontSize(12)
        doc.setFont(undefined, 'normal')
        doc.text(`Exam Date: ${this.formatDate(this.selectedExam.date)}`, 105, 55, { align: 'center' })
        
        // Prepare table data from studentRecords
        const tableData = Object.keys(this.selectedExam.studentRecords)
          .map(studentId => {
            const student = this.students.find(s => s.indexNo === studentId)
            const record = this.selectedExam.studentRecords[studentId]
            if (!student || !record.mark) return null
            
            return [
              student.indexNo,
              student.name,
              record.mark,
              this.calculateGradeFromMark(record.mark)
            ]
          })
          .filter(Boolean)
        
        log(`Generating report with ${tableData.length} student records`)
        
        // Add table
        doc.autoTable({
          head: [['Index No', 'Student Name', 'Marks', 'Grade']],
          body: tableData,
          startY: 70,
          theme: 'striped',
          headStyles: {
            fillColor: [102, 126, 234],
            textColor: 255,
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 10,
            cellPadding: 5
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 80 },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 25, halign: 'center' }
          }
        })
        
        // Add summary
        const finalY = doc.lastAutoTable.finalY + 20
        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.text('Summary:', 20, finalY)
        
        doc.setFont(undefined, 'normal')
        doc.text(`Total Students: ${this.attendedStudents.length}`, 20, finalY + 10)
        doc.text(`Average Mark: ${this.averageMark}%`, 20, finalY + 20)
        doc.text(`Highest Mark: ${this.highestMark}%`, 20, finalY + 30)
        doc.text(`Pass Rate: ${this.passRate}%`, 20, finalY + 40)
        
        // Add footer
        doc.setFontSize(8)
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 20, 280)
        doc.text('Pesalai Undergraduates Admin System', 105, 280, { align: 'center' })
        
        // Save PDF
        const fileName = `${this.selectedExam.subject}_${this.selectedExam.batch}_${this.selectedExam.date}.pdf`
        doc.save(fileName)
        
        logSuccess(`PDF report generated successfully: ${fileName}`)
        this.showToast('Report generated successfully', 'success')
        
      } catch (error) {
        logError('Error generating report', error)
        this.showToast('Failed to generate report', 'error')
      }
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    
    showToast(message, type = 'success') {
      const toast = document.createElement('div')
      toast.className = `toast ${type}`
      toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
          <span>${message}</span>
        </div>
      `
      
      document.body.appendChild(toast)
      
      setTimeout(() => {
        toast.remove()
      }, 3000)
    }
  }
}
</script>

<style scoped>
.reports-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 80px;
}

.page-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left p {
  color: #6c757d;
  margin: 0;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-state i {
  font-size: 48px;
  color: #6c757d;
  margin-bottom: 16px;
  opacity: 0.5;
}

.exam-selection {
  margin-bottom: 32px;
}

.exam-selection h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.exams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.exam-card {
  background: white;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.exam-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.exam-card.selected {
  border-color: #1e40af;
  background: rgba(102, 126, 234, 0.05);
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.exam-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.exam-batch {
  background: #1e40af;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.exam-details {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #6c757d;
  font-size: 14px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item i {
  width: 16px;
  color: #1e40af;
}

.exam-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #28a745;
}

.marks-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.section-actions {
  display: flex;
  gap: 12px;
}

.marks-table-container {
  padding: 20px;
}

.no-students {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.marks-table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 1fr 100px 80px;
  background: #1e40af;
  color: white;
}

.header-cell {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 1fr 100px 80px;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: #f8f9fa;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.mark-display {
  display: inline-block;
  padding: 6px 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  min-width: 50px;
  text-align: center;
}

.grade-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  min-width: 30px;
}

.grade-a {
  background: #d4edda;
  color: #155724;
}

.grade-b {
  background: #d1ecf1;
  color: #0c5460;
}

.grade-c {
  background: #fff3cd;
  color: #856404;
}

.grade-s {
  background: #f8d7da;
  color: #721c24;
}

.grade-f {
  background: #f5c6cb;
  color: #721c24;
}

.marks-summary {
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item .label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
}

.stat-item .value {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  z-index: 100;
}

.nav-link {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  text-decoration: none;
  color: #6c757d;
  transition: all 0.3s ease;
  min-height: 60px;
  justify-content: center;
}

.nav-link.active {
  color: #1e40af;
  background: rgba(102, 126, 234, 0.1);
}

.nav-link i {
  font-size: 18px;
  margin-bottom: 4px;
}

.nav-link span {
  font-size: 10px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .exams-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .section-actions {
    justify-content: stretch;
  }
  
  .section-actions .btn {
    flex: 1;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 80px 1fr 70px 60px;
    font-size: 12px;
  }
  
  .header-cell,
  .table-cell {
    padding: 8px 12px;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .bottom-nav {
    display: flex;
  }
}

@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
  
  .reports-page {
    padding-bottom: 0;
  }
}
</style>
