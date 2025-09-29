<template>
  <div class="exams-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container-fluid">
        <div class="header-content">
          <div class="header-left">
            <h1><i class="fas fa-clipboard-list"></i> Exam Management</h1>
            <p>Create and manage exams, attendance, and marks</p>
          </div>
          <button @click="showCreateModal = true" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Create Exam
          </button>
        </div>
      </div>
    </div>

    <!-- Exams Content -->
    <div class="exams-content">
      <div class="container-fluid">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading exams...</p>
        </div>
        
        <div v-else-if="exams.length === 0" class="empty-state">
          <i class="fas fa-clipboard-list"></i>
          <h3>No exams found</h3>
          <p>Create your first exam to get started</p>
          <button @click="showCreateModal = true" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Create First Exam
          </button>
        </div>
        
        <div v-else class="exams-sections">
          <!-- Upcoming Exams -->
          <div class="exam-section">
            <div class="section-header" @click="toggleSection('upcoming')">
              <h3>
                <i class="fas fa-clock"></i>
                Upcoming Exams ({{ upcomingExams.length }})
              </h3>
              <i class="fas fa-chevron-down" :class="{ rotated: sectionsExpanded.upcoming }"></i>
            </div>
            <div v-show="sectionsExpanded.upcoming" class="section-content">
              <div v-if="upcomingExams.length === 0" class="no-exams">
                <p>No upcoming exams</p>
              </div>
              <div v-else class="exams-grid">
                <div v-for="exam in upcomingExams" :key="exam.id" class="exam-card upcoming">
                  <div class="exam-header">
                    <h4>{{ exam.subject }}</h4>
                    <span class="exam-status">{{ exam.status }}</span>
                  </div>
                  <div class="exam-details">
                    <div class="detail-item">
                      <i class="fas fa-users"></i>
                      <span>{{ exam.batch }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-calendar"></i>
                      <span>{{ formatDate(exam.date) }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-dollar-sign"></i>
                      <span>Rs. {{ exam.fee }}</span>
                    </div>
                  </div>
                  <div class="exam-actions">
                    <button @click="manageExamAttendance(exam)" class="btn btn-sm btn-primary">
                      <i class="fas fa-user-check"></i>
                      Take Attendance
                    </button>
                    <button @click="editExam(exam)" class="btn btn-sm btn-secondary">
                      <i class="fas fa-edit"></i>
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Exams -->
          <div class="exam-section">
            <div class="section-header" @click="toggleSection('active')">
              <h3>
                <i class="fas fa-play-circle"></i>
                Active Exams ({{ activeExams.length }})
              </h3>
              <i class="fas fa-chevron-down" :class="{ rotated: sectionsExpanded.active }"></i>
            </div>
            <div v-show="sectionsExpanded.active" class="section-content">
              <div v-if="activeExams.length === 0" class="no-exams">
                <p>No active exams</p>
              </div>
              <div v-else class="exams-grid">
                <div v-for="exam in activeExams" :key="exam.id" class="exam-card active">
                  <div class="exam-header">
                    <h4>{{ exam.subject }}</h4>
                    <span class="exam-status">{{ exam.status }}</span>
                  </div>
                  <div class="exam-details">
                    <div class="detail-item">
                      <i class="fas fa-users"></i>
                      <span>{{ exam.batch }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-calendar"></i>
                      <span>{{ formatDate(exam.date) }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-user-check"></i>
                      <span>{{ getAttendanceCount(exam) }} attended</span>
                    </div>
                  </div>
                  <div class="exam-actions">
                    <button @click="manageExamAttendance(exam)" class="btn btn-sm btn-primary">
                      <i class="fas fa-user-check"></i>
                      Manage Attendance
                    </button>
                    <button @click="closeExam(exam)" class="btn btn-sm btn-warning">
                      <i class="fas fa-stop-circle"></i>
                      Close Exam
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Completed Exams -->
          <div class="exam-section">
            <div class="section-header" @click="toggleSection('completed')">
              <h3>
                <i class="fas fa-check-circle"></i>
                Completed Exams ({{ completedExams.length }})
              </h3>
              <i class="fas fa-chevron-down" :class="{ rotated: sectionsExpanded.completed }"></i>
            </div>
            <div v-show="sectionsExpanded.completed" class="section-content">
              <div v-if="completedExams.length === 0" class="no-exams">
                <p>No completed exams</p>
              </div>
              <div v-else class="exams-grid">
                <div v-for="exam in completedExams" :key="exam.id" class="exam-card completed">
                  <div class="exam-header">
                    <h4>{{ exam.subject }}</h4>
                    <span class="exam-status">{{ exam.status }}</span>
                  </div>
                  <div class="exam-details">
                    <div class="detail-item">
                      <i class="fas fa-users"></i>
                      <span>{{ exam.batch }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-calendar"></i>
                      <span>{{ formatDate(exam.date) }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-dollar-sign"></i>
                      <span>Rs. {{ exam.totalIncome || 0 }}</span>
                    </div>
                  </div>
                  <div class="exam-actions">
                    <button @click="updateMarks(exam)" class="btn btn-sm btn-success">
                      <i class="fas fa-edit"></i>
                      Update Marks
                    </button>
                    <button @click="viewExamReport(exam)" class="btn btn-sm btn-info">
                      <i class="fas fa-file-pdf"></i>
                      View Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Exam Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ showCreateModal ? 'Create New Exam' : 'Edit Exam' }}</h3>
          <button @click="closeModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveExam" class="modal-body">
          <div class="form-group">
            <label class="form-label">Subject *</label>
            <select v-model="examForm.subject" class="form-control" required>
              <option value="">Select Subject</option>
              <option value="Mathematics">Mathematics (MATH stream only)</option>
              <option value="Biology">Biology (BIO stream only)</option>
              <option value="Physics">Physics (Both streams)</option>
              <option value="Chemistry">Chemistry (Both streams)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Batch *</label>
            <select v-model="examForm.batch" class="form-control" required>
              <option value="">Select Batch</option>
              <option :value="CONSTANTS.BATCHES.BATCH_26AL">26AL</option>
              <option :value="CONSTANTS.BATCHES.BATCH_27AL">27AL</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Exam Date *</label>
            <input
              v-model="examForm.date"
              type="date"
              class="form-control"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Exam Fee (Rs.) *</label>
            <input
              v-model.number="examForm.fee"
              type="number"
              class="form-control"
              placeholder="Enter exam fee"
              min="0"
              required
            />
          </div>
        </form>
        
        <div class="modal-footer">
          <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button type="submit" @click="saveExam" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            <span v-else>{{ showCreateModal ? 'Create Exam' : 'Update Exam' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Exam Attendance Modal -->
    <div v-if="showAttendanceModal" class="modal-overlay" @click="closeAttendanceModal">
      <div class="modal large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ selectedExam?.subject }} - {{ selectedExam?.batch }} Attendance
          </h3>
          <button @click="closeAttendanceModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="attendance-summary">
            <div class="summary-stats">
              <div class="stat-item">
                <span class="label">Total Students:</span>
                <span class="value">{{ examStudents.length }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Attended:</span>
                <span class="value">{{ attendedCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Total Income:</span>
                <span class="value">Rs. {{ totalExamIncome }}</span>
              </div>
            </div>
          </div>
          
          <div class="students-attendance-list">
            <div v-for="student in examStudents" :key="student.id" class="student-attendance-item">
              <div class="student-info">
                <div class="student-avatar">
                  <i :class="student.gender === CONSTANTS.GENDERS.MALE ? 'fas fa-male' : 'fas fa-female'"></i>
                </div>
                <div class="student-details">
                  <h4>{{ student.name }}</h4>
                  <p>{{ student.indexNo }}</p>
                </div>
              </div>
              
              <div class="attendance-controls">
                <div class="attendance-toggle">
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      :checked="student.attended"
                      @change="toggleStudentAttendance(student)"
                    />
                    <span class="slider"></span>
                  </label>
                  <span class="attendance-label">
                    {{ student.attended ? 'Present' : 'Absent' }}
                  </span>
                </div>
                
                <div v-if="student.attended" class="fee-input">
                  <label>Fee Paid:</label>
                  <div class="fee-input-group">
                    <input
                      v-model.number="student.feePaid"
                      type="number"
                      class="form-control form-control-sm"
                      :placeholder="selectedExam?.fee"
                      min="0"
                    />
                    <button 
                      @click="markForgotToBring(student)" 
                      class="btn btn-warning btn-sm"
                      title="Student forgot to bring money"
                    >
                      <i class="fas fa-exclamation-triangle"></i>
                      Forgot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" @click="closeAttendanceModal" class="btn btn-secondary">Cancel</button>
          <button @click="saveExamAttendance" class="btn btn-primary" :disabled="savingAttendance">
            <span v-if="savingAttendance" class="spinner"></span>
            <span v-else>Save Attendance</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Marks Entry Modal -->
    <div v-if="showMarksModal" class="modal-overlay" @click="closeMarksModal">
      <div class="modal marks-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fas fa-edit"></i>
            Enter Marks - {{ examToClose?.subject }} ({{ examToClose?.batch }})
          </h3>
          <button @click="closeMarksModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="marks-instructions">
            <p><i class="fas fa-info-circle"></i> Enter marks for students who attended the exam.</p>
          </div>
          
          <!-- MCQ Assist Section -->
          <div class="mcq-assist-section">
            <button @click="toggleMcqAssist" class="btn btn-info btn-sm">
              <i class="fas fa-calculator"></i>
              MCQ Assist
            </button>
            
            <div v-if="showMcqAssist" class="mcq-assist-form">
              <div class="form-group">
                <label>Total MCQ Questions:</label>
                <input
                  v-model.number="totalMcqQuestions"
                  type="number"
                  class="form-control"
                  min="1"
                  placeholder="Enter total MCQ count"
                />
              </div>
            </div>
          </div>
          
          <div class="marks-table-container">
            <div class="marks-table">
              <div class="marks-header">
                <div class="marks-cell">Index</div>
                <div class="marks-cell">Name</div>
                <div v-if="showMcqAssist" class="marks-cell">✅MCQ</div>
                <div class="marks-cell">Marks</div>
                <div class="marks-cell">Grade</div>
              </div>
              
              <div 
                v-for="student in examStudentsForMarks" 
                :key="student.indexNo"
                class="marks-row"
              >
                <div class="marks-cell">{{ student.indexNo }}</div>
                <div class="marks-cell">{{ student.name }}</div>
                <div v-if="showMcqAssist" class="marks-cell">
                  <input
                    v-model.number="student.mcqCorrect"
                    type="number"
                    class="mcq-input"
                    :class="{ 'error': student.mcqCorrect > totalMcqQuestions }"
                    min="0"
                    :max="totalMcqQuestions"
                    placeholder="0"
                    @input="validateAndCalculateMcq(student)"
                  />
                  <div v-if="student.mcqCorrect > totalMcqQuestions" class="error-message">
                    Max: {{ totalMcqQuestions }}
                  </div>
                </div>
                <div class="marks-cell">
                  <input
                    v-model.number="student.mark"
                    type="number"
                    class="mark-input"
                    :class="{ 'readonly': showMcqAssist && student.mcqCorrect !== null && student.mcqCorrect !== undefined }"
                    :readonly="showMcqAssist && student.mcqCorrect !== null && student.mcqCorrect !== undefined"
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                </div>
                <div class="marks-cell">
                  <div class="grade-circle" :style="{ backgroundColor: getMarkColor(student.mark) }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeMarksModal" class="btn btn-secondary">Cancel</button>
          <button @click="saveExamMarks" :disabled="savingMarks" class="btn btn-primary">
            <span v-if="savingMarks" class="spinner"></span>
            {{ savingMarks ? 'Saving...' : 'Close Exam with Marks' }}
          </button>
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
      <router-link to="/exams" class="nav-link active">
        <i class="fas fa-clipboard-list"></i>
        <span>Exams</span>
      </router-link>
      <router-link to="/finance" class="nav-link">
        <i class="fas fa-chart-line"></i>
        <span>Finance</span>
      </router-link>
      <router-link to="/reports" class="nav-link">
        <i class="fas fa-file-pdf"></i>
        <span>Reports</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
import { CONSTANTS, generateExamId, getTodayDate, formatDateForSystem } from '../../config/database.js'
import { examService, studentService, financeService } from '../../services/firestore.js'
import { log, logError, logSuccess, logWarning } from '../../config/database.js'

export default {
  name: 'Exams',
  data() {
    return {
      CONSTANTS,
      exams: [],
      loading: true,
      showCreateModal: false,
      showEditModal: false,
      showAttendanceModal: false,
      showMarksModal: false,
      saving: false,
      savingAttendance: false,
      savingMarks: false,
      examForm: {
        subject: '',
        batch: '',
        date: getTodayDate(),
        fee: 100
      },
      selectedExam: null,
      examStudents: [],
      examToClose: null,
      examStudentsForMarks: [],
      editingExam: null,
      showMcqAssist: false,
      totalMcqQuestions: 0,
      sectionsExpanded: {
        upcoming: true,
        active: true,
        completed: false
      }
    }
  },
  
  computed: {
    upcomingExams() {
      return this.exams.filter(exam => exam.status === CONSTANTS.EXAM_STATUS.UPCOMING)
    },
    
    activeExams() {
      return this.exams.filter(exam => exam.status === CONSTANTS.EXAM_STATUS.ACTIVE)
    },
    
    completedExams() {
      return this.exams.filter(exam => exam.status === CONSTANTS.EXAM_STATUS.COMPLETED)
    },
    
    attendedCount() {
      return this.examStudents.filter(s => s.attended).length
    },
    
    totalExamIncome() {
      return this.examStudents.reduce((total, student) => {
        return total + (student.attended ? (student.feePaid || 0) : 0)
      }, 0)
    }
  },
  
  async mounted() {
    await this.loadExams()
  },
  
  methods: {
    async loadExams() {
      try {
        this.loading = true
        this.exams = await examService.getAll()
        
        // Sort exams by date
        this.exams.sort((a, b) => new Date(a.date) - new Date(b.date))
      } catch (error) {
        console.error('Error loading exams:', error)
        this.showToast('Failed to load exams', 'error')
      } finally {
        this.loading = false
      }
    },
    
    toggleSection(section) {
      this.sectionsExpanded[section] = !this.sectionsExpanded[section]
    },
    
    editExam(exam) {
      this.editingExam = exam
      this.examForm = {
        subject: exam.subject,
        batch: exam.batch,
        date: exam.date,
        fee: exam.fee
      }
      this.showEditModal = true
    },
    
    async saveExam() {
      try {
        this.saving = true
        log('Saving exam data', this.examForm)
        
        if (!this.examForm.subject || !this.examForm.batch || !this.examForm.date || !this.examForm.fee) {
          logWarning('Form validation failed - missing required fields')
          this.showToast('Please fill in all required fields', 'error')
          return
        }
        
        const examData = {
          id: generateExamId(this.examForm.batch, this.examForm.subject, this.examForm.date),
          subject: this.examForm.subject,
          batch: this.examForm.batch,
          date: formatDateForSystem(this.examForm.date),
          fee: parseFloat(this.examForm.fee),
          status: CONSTANTS.EXAM_STATUS.UPCOMING,
          studentRecords: {} // Map of studentId -> {fee, mark}
        }
        
        if (this.showCreateModal) {
          // Check if exam already exists
          const existingExam = await examService.getById(examData.id)
          if (existingExam) {
            logWarning(`Exam already exists: ${examData.id}`)
            this.showToast('Exam already exists for this subject, batch, and date', 'error')
            return
          }
          
          await examService.create(examData)
          logSuccess(`Exam created successfully: ${examData.id}`)
          this.showToast('Exam created successfully', 'success')
        } else {
          await examService.update(this.editingExam.id, examData)
          logSuccess(`Exam updated successfully: ${examData.id}`)
          this.showToast('Exam updated successfully', 'success')
        }
        
        this.closeModal()
        await this.loadExams()
        
      } catch (error) {
        logError('Error saving exam', error)
        this.showToast('Failed to save exam', 'error')
      } finally {
        this.saving = false
      }
    },
    
    async manageExamAttendance(exam) {
      try {
        log(`Managing exam attendance for ${exam.subject} (${exam.batch})`)
        this.selectedExam = exam
        
        // Load students for the exam batch and filter by stream/subject
        const allStudents = await studentService.getByBatch(exam.batch)
        log(`Found ${allStudents.length} students for batch ${exam.batch}`)
        
        // Filter students based on subject and stream
        let students = []
        if (exam.subject === 'Mathematics') {
          students = allStudents.filter(student => student.stream === 'MATH')
        } else if (exam.subject === 'Biology') {
          students = allStudents.filter(student => student.stream === 'BIO')
        } else if (exam.subject === 'Physics' || exam.subject === 'Chemistry') {
          students = allStudents // Both streams
        } else {
          students = allStudents // Fallback
        }
        
        logSuccess(`Filtered to ${students.length} students for ${exam.subject} exam`)
        
        // Initialize attendance data using new structure
        this.examStudents = students.map(student => {
          const existingRecord = exam.studentRecords?.[student.indexNo]
          return {
            ...student,
            attended: existingRecord ? existingRecord.status === CONSTANTS.STUDENT_EXAM_STATUS.PRESENT : false,
            feePaid: existingRecord ? existingRecord.fee : exam.fee,
            examStatus: existingRecord ? existingRecord.status : CONSTANTS.STUDENT_EXAM_STATUS.ABSENT
          }
        })
        
        this.showAttendanceModal = true
        logSuccess(`Exam attendance interface loaded for ${this.examStudents.length} students`)
        
        // Update exam status to active if it's upcoming
        if (exam.status === CONSTANTS.EXAM_STATUS.UPCOMING) {
          await examService.update(exam.id, { status: CONSTANTS.EXAM_STATUS.ACTIVE })
          logSuccess(`Exam ${exam.id} status updated to active`)
          await this.loadExams()
        }
        
      } catch (error) {
        logError('Error loading exam attendance', error)
        this.showToast('Failed to load exam attendance', 'error')
      }
    },
    
    toggleStudentAttendance(student) {
      student.attended = !student.attended
      if (!student.attended) {
        student.feePaid = 0
        student.examStatus = CONSTANTS.STUDENT_EXAM_STATUS.ABSENT
      } else {
        student.feePaid = this.selectedExam.fee
        student.examStatus = CONSTANTS.STUDENT_EXAM_STATUS.PRESENT
      }
    },
    
    markForgotToBring(student) {
      student.feePaid = 0
      log(`Marked ${student.name} as forgot to bring money`)
      this.showToast(`${student.name} marked as forgot to bring money`, 'warning')
    },
    
    async saveExamAttendance() {
      try {
        log(`Saving exam attendance for ${this.selectedExam.subject}`)
        this.savingAttendance = true
        
        // Prepare student records using new structure
        const studentRecords = {}
        let totalIncome = 0
        
        this.examStudents.forEach(student => {
          const fee = student.feePaid || 0 // Use actual fee paid, default to 0 if not specified
          studentRecords[student.indexNo] = {
            fee: fee,
            mark: null, // Will be filled later when marks are added
            status: student.examStatus || CONSTANTS.STUDENT_EXAM_STATUS.ABSENT,
            mcqData: null // Will be filled if MCQ assist is used
          }
          
          if (student.attended) {
            totalIncome += fee
            
            // Add exam record to student document
            studentService.addExamRecord(student.indexNo, this.selectedExam.id, {
              fee: fee,
              mark: null,
              examDate: this.selectedExam.date,
              status: student.examStatus
            })
          }
        })
        
        log(`Saving ${Object.keys(studentRecords).length} student records, total income: Rs. ${totalIncome}`)
        
        // Update exam with student records and collected money
        await examService.update(this.selectedExam.id, {
          studentRecords: studentRecords,
          collectedMoney: totalIncome
        })
        
        // Update collected money in exam service
        await examService.updateCollectedMoney(this.selectedExam.id)
        
        logSuccess(`Exam attendance saved successfully for ${this.selectedExam.subject}`)
        this.showToast('Attendance saved successfully', 'success')
        this.closeAttendanceModal()
        await this.loadExams()
        
      } catch (error) {
        logError('Error saving exam attendance', error)
        this.showToast('Failed to save attendance', 'error')
      } finally {
        this.savingAttendance = false
      }
    },
    
    async closeExam(exam) {
      log(`Preparing to close exam ${exam.subject} for batch ${exam.batch}`)
      
      // Set the exam to be closed
      this.examToClose = exam
      
      // Load students who attended this exam
      await this.loadExamStudentsForMarks(exam)
      
      // Show marks entry modal
      this.showMarksModal = true
    },
    
    async loadExamStudentsForMarks(exam) {
      try {
        log(`Loading students for marks entry for exam ${exam.id}`)
        
        // Get all students for this batch
        const students = await studentService.getByBatch(exam.batch)
        
        // Filter students who attended the exam (present status)
        this.examStudentsForMarks = students.filter(student => {
          const examRecord = exam.studentRecords?.[student.indexNo]
          return examRecord && examRecord.status === CONSTANTS.STUDENT_EXAM_STATUS.PRESENT
        })
        
        // Initialize marks data
        this.examStudentsForMarks = this.examStudentsForMarks.map(student => {
          const examRecord = exam.studentRecords[student.indexNo]
          return {
            ...student,
            mark: examRecord.mark || null,
            fee: examRecord.fee,
            mcqCorrect: examRecord.mcqData?.correct || 0
          }
        })
        
        logSuccess(`Loaded ${this.examStudentsForMarks.length} students for marks entry`)
        
      } catch (error) {
        logError('Error loading students for marks entry', error)
        this.showToast('Failed to load students for marks entry', 'error')
      }
    },
    
    async saveExamMarks() {
      try {
        log(`Saving marks for exam ${this.examToClose.id}`)
        
        // Check if all marks are filled
        const studentsWithoutMarks = this.examStudentsForMarks.filter(student => 
          student.mark === null || student.mark === undefined || student.mark === ''
        )
        
        if (studentsWithoutMarks.length > 0) {
          this.showToast(`Please fill marks for all students. ${studentsWithoutMarks.length} students missing marks.`, 'error')
          return
        }
        
        this.savingMarks = true
        
        // Update exam with marks
        const updatedStudentRecords = { ...this.examToClose.studentRecords }
        
        this.examStudentsForMarks.forEach(student => {
          if (student.mark !== null && student.mark !== undefined) {
            updatedStudentRecords[student.indexNo] = {
              ...updatedStudentRecords[student.indexNo],
              mark: student.mark,
              mcqData: this.showMcqAssist ? {
                total: this.totalMcqQuestions,
                correct: student.mcqCorrect || 0
              } : null
            }
            
            // Update student's exam record
            studentService.addExamRecord(student.indexNo, this.examToClose.id, {
              fee: student.fee,
              mark: student.mark,
              examDate: this.examToClose.date,
              status: CONSTANTS.STUDENT_EXAM_STATUS.PRESENT
            })
          }
        })
        
        // Calculate total income
        const totalIncome = Object.values(updatedStudentRecords).reduce((total, record) => {
          return total + (record.fee || 0)
        }, 0)
        
        // Update exam status to completed
        await examService.update(this.examToClose.id, {
          studentRecords: updatedStudentRecords,
          status: CONSTANTS.EXAM_STATUS.COMPLETED,
          totalIncome,
          completedAt: new Date()
        })
        
        // Record income in finance
        if (totalIncome > 0) {
          await financeService.createExpense({
            amount: totalIncome,
            reason: `Exam Income - ${this.examToClose.subject} ${this.examToClose.batch}`,
            type: CONSTANTS.EXPENSE_TYPES.INCOME,
            date: new Date()
          })
          logSuccess(`Income recorded in finance: Rs. ${totalIncome}`)
        }
        
        logSuccess(`Exam ${this.examToClose.id} closed with marks successfully`)
        this.showToast('Exam closed with marks successfully', 'success')
        
        this.closeMarksModal()
        await this.loadExams()
        
      } catch (error) {
        logError('Error saving exam marks', error)
        this.showToast('Failed to save exam marks', 'error')
      } finally {
        this.savingMarks = false
      }
    },
    
    closeMarksModal() {
      this.showMarksModal = false
      this.examToClose = null
      this.examStudentsForMarks = []
      this.showMcqAssist = false
      this.totalMcqQuestions = 0
    },
    
    toggleMcqAssist() {
      this.showMcqAssist = !this.showMcqAssist
      if (!this.showMcqAssist) {
        this.totalMcqQuestions = 0
        this.examStudentsForMarks.forEach(student => {
          student.mcqCorrect = 0
          student.mark = null
        })
      }
    },
    
    validateAndCalculateMcq(student) {
      // Validate MCQ input
      if (student.mcqCorrect > this.totalMcqQuestions) {
        student.mcqCorrect = this.totalMcqQuestions
      }
      if (student.mcqCorrect < 0) {
        student.mcqCorrect = 0
      }
      
      // Calculate mark
      if (this.totalMcqQuestions > 0 && student.mcqCorrect !== null && student.mcqCorrect !== undefined) {
        student.mark = Math.round((student.mcqCorrect / this.totalMcqQuestions) * 100)
      }
    },
    
    getMarkColor(mark) {
      if (mark === null || mark === undefined) return '#6c757d'
      
      if (mark >= 0 && mark < 25) return CONSTANTS.MARK_RANGES.RED.color
      if (mark >= 25 && mark < 50) return CONSTANTS.MARK_RANGES.ORANGE.color
      if (mark >= 50 && mark < 75) return CONSTANTS.MARK_RANGES.YELLOW.color
      if (mark >= 75 && mark <= 100) return CONSTANTS.MARK_RANGES.GREEN.color
      
      return '#6c757d'
    },
    
    updateMarks(exam) {
      // Navigate to reports page with exam ID
      this.$router.push(`/reports?exam=${exam.id}`)
    },
    
    viewExamReport(exam) {
      // Navigate to reports page with exam ID
      this.$router.push(`/reports?exam=${exam.id}`)
    },
    
    getAttendanceCount(exam) {
      if (!exam.studentRecords) return 0
      return Object.keys(exam.studentRecords).length
    },
    
    closeModal() {
      this.showCreateModal = false
      this.showEditModal = false
      this.editingExam = null
      this.examForm = {
        subject: '',
        batch: '',
        date: getTodayDate(),
        fee: 100
      }
    },
    
    closeAttendanceModal() {
      this.showAttendanceModal = false
      this.selectedExam = null
      this.examStudents = []
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
.exams-page {
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
  flex-wrap: wrap;
  gap: 16px;
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

.exam-section {
  margin-bottom: 24px;
}

.section-header {
  background: white;
  padding: 16px 20px;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.section-header:hover {
  background: #f8f9fa;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-header i.fa-chevron-down {
  transition: transform 0.3s ease;
}

.section-header i.fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.section-content {
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.no-exams {
  text-align: center;
  color: #6c757d;
  padding: 20px;
}

.exams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.exam-card {
  background: white;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.exam-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.exam-card.upcoming {
  border-left-color: #ffc107;
}

.exam-card.active {
  border-left-color: #28a745;
}

.exam-card.completed {
  border-left-color: #6c757d;
}

.exam-header {
  padding: 16px;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exam-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
}

.exam-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: #e9ecef;
  color: #495057;
}

.exam-details {
  padding: 16px;
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

.exam-actions {
  padding: 12px 16px;
  background: #f8f9fa;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.modal.large {
  max-width: 800px;
  width: 95%;
}

.attendance-summary {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
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
}

.stat-item .value {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}

.students-attendance-list {
  max-height: 400px;
  overflow-y: auto;
}

.student-attendance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  gap: 16px;
}

.student-attendance-item:last-child {
  border-bottom: none;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.student-details h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #2c3e50;
}

.student-details p {
  margin: 0;
  font-size: 12px;
  color: #6c757d;
}

.attendance-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.attendance-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #28a745;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.attendance-label {
  font-size: 12px;
  font-weight: 600;
  min-width: 50px;
}

.fee-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fee-input label {
  font-size: 10px;
  color: #6c757d;
  font-weight: 600;
}

.fee-input input {
  width: 80px;
  padding: 4px 8px;
  font-size: 12px;
}

.fee-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-warning {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  color: #212529;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-warning:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
}

/* MCQ Assist Styles */
.mcq-assist-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.mcq-assist-form {
  margin-top: 12px;
}

.mcq-assist-form .form-group {
  margin-bottom: 0;
}

.mcq-assist-form label {
  font-size: 12px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 4px;
}

.mcq-input {
  width: 100%;
  max-width: 60px;
  padding: 6px 8px;
  border: 2px solid #e9ecef;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  transition: border-color 0.3s ease;
}

.mcq-input:focus {
  outline: none;
  border-color: #17a2b8;
  box-shadow: 0 0 0 2px rgba(23, 162, 184, 0.1);
}

.mcq-input.error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

.error-message {
  font-size: 10px;
  color: #dc3545;
  margin-top: 2px;
  text-align: center;
}

.grade-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin: 0 auto;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .attendance-controls {
    flex-direction: column;
    gap: 8px;
  }
  
  .student-attendance-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .bottom-nav {
    display: flex;
  }
}

/* Marks Entry Modal Styles */
.marks-modal {
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.marks-instructions {
  background: #e3f2fd;
  border: 1px solid #1e40af;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
}

.marks-instructions p {
  margin: 0;
  color: #1e40af;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.marks-table-container {
  border-radius: 8px;
  border: 1px solid #e9ecef;
  overflow: hidden;
}

.marks-table {
  width: 100%;
  background: white;
}

.marks-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
  font-weight: 600;
  color: #1e40af;
}

.marks-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
}

.marks-row:hover {
  background: #f8f9fa;
}

.marks-row:last-child {
  border-bottom: none;
}

.marks-cell {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.marks-header .marks-cell {
  padding: 16px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mark-input {
  width: 100%;
  max-width: 80px;
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  transition: border-color 0.3s ease;
}

.mark-input:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.mark-input.readonly {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  border-color: #dee2e6;
}

.mark-input.readonly:focus {
  border-color: #dee2e6;
  box-shadow: none;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .marks-modal {
    max-width: 95vw;
    margin: 8px;
  }
  
  .marks-cell {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .marks-header .marks-cell {
    padding: 12px;
    font-size: 10px;
  }
  
  .mark-input {
    max-width: 60px;
    padding: 6px 8px;
    font-size: 12px;
  }
}
</style>
