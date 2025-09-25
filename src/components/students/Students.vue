<template>
  <div class="students-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container-fluid">
        <div class="header-content">
          <div class="header-left">
            <h1><i class="fas fa-users"></i> Students Management</h1>
            <p>Manage student information and records</p>
          </div>
          <button @click="showAddModal = true" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Add Student
          </button>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="container-fluid">
        <div class="filters-row">
          <div class="filter-group">
            <label class="form-label">Batch Filter</label>
            <select v-model="selectedBatch" @change="filterStudents" class="form-control">
              <option value="">All Batches</option>
              <option :value="CONSTANTS.BATCHES.BATCH_26AL">26AL</option>
              <option :value="CONSTANTS.BATCHES.BATCH_27AL">27AL</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="form-label">Search</label>
            <div class="search-input">
              <input
                v-model="searchQuery"
                @input="filterStudents"
                type="text"
                class="form-control"
                placeholder="Search by name or index number..."
              />
              <i class="fas fa-search search-icon"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Students Grid -->
    <div class="students-content">
      <div class="container-fluid">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading students...</p>
        </div>
        
        <div v-else-if="filteredStudents.length === 0" class="empty-state">
          <i class="fas fa-users"></i>
          <h3>No students found</h3>
          <p>{{ searchQuery || selectedBatch ? 'Try adjusting your search criteria' : 'Add your first student to get started' }}</p>
          <button v-if="!searchQuery && !selectedBatch" @click="showAddModal = true" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Add First Student
          </button>
        </div>
        
        <div v-else class="students-grid">
          <div v-for="student in filteredStudents" :key="student.id" class="student-card">
            <div class="student-header">
              <div class="student-avatar">
                <i :class="student.gender === CONSTANTS.GENDERS.MALE ? 'fas fa-male' : 'fas fa-female'"></i>
              </div>
              <div class="student-info">
                <h3>{{ student.name }}</h3>
                <p class="index-no">Index: {{ student.indexNo }}</p>
                <div class="badges">
                  <span class="batch-badge" :class="`batch-${student.batch}`">{{ student.batch }}</span>
                  <span class="stream-badge" :class="`stream-${student.stream}`">{{ student.stream }}</span>
                </div>
              </div>
            </div>
            
            <div class="student-details">
              <div class="detail-item">
                <i class="fas fa-phone"></i>
                <span>{{ student.parentPhone }}</span>
              </div>
              <div class="detail-item">
                <i :class="student.gender === CONSTANTS.GENDERS.MALE ? 'fas fa-male' : 'fas fa-female'"></i>
                <span>{{ student.gender === CONSTANTS.GENDERS.MALE ? 'Male' : 'Female' }}</span>
              </div>
            </div>
            
            <div class="student-actions">
              <button @click="viewStudentDetails(student)" class="btn btn-sm btn-primary">
                <i class="fas fa-eye"></i>
                Details
              </button>
              <button @click="editStudent(student)" class="btn btn-sm btn-secondary">
                <i class="fas fa-edit"></i>
                Edit
              </button>
              <button @click="deleteStudent(student)" class="btn btn-sm btn-danger">
                <i class="fas fa-trash"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Student Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ showAddModal ? 'Add New Student' : 'Edit Student' }}</h3>
          <button @click="closeModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveStudent" class="modal-body">
          <div class="form-group">
            <label class="form-label">Index Number *</label>
            <input
              v-model="studentForm.indexNo"
              type="text"
              class="form-control"
              placeholder="e.g., 6327"
              required
              :disabled="showEditModal"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input
              v-model="studentForm.name"
              type="text"
              class="form-control"
              placeholder="Enter student's full name"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Gender *</label>
            <select v-model="studentForm.gender" class="form-control" required>
              <option value="">Select Gender</option>
              <option :value="CONSTANTS.GENDERS.MALE">Male</option>
              <option :value="CONSTANTS.GENDERS.FEMALE">Female</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Stream *</label>
            <select v-model="studentForm.stream" class="form-control" required>
              <option value="">Select Stream</option>
              <option :value="CONSTANTS.STREAMS.BIO">BIO</option>
              <option :value="CONSTANTS.STREAMS.MATH">MATH</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Parent's Phone *</label>
            <input
              v-model="studentForm.parentPhone"
              type="tel"
              class="form-control"
              placeholder="Enter parent's phone number"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Batch *</label>
            <select v-model="studentForm.batch" class="form-control" required>
              <option value="">Select Batch</option>
              <option :value="CONSTANTS.BATCHES.BATCH_26AL">26AL</option>
              <option :value="CONSTANTS.BATCHES.BATCH_27AL">27AL</option>
            </select>
          </div>
        </form>
        
        <div class="modal-footer">
          <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button type="submit" @click="saveStudent" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            <span v-else>{{ showAddModal ? 'Add Student' : 'Update Student' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Student Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal details-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fas fa-user"></i>
            Student Details
          </h3>
          <button @click="closeDetailsModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedStudent" class="student-details-content">
            <!-- Student Basic Info -->
            <div class="student-info-section">
              <div class="student-avatar-large">
                <i :class="selectedStudent.gender === CONSTANTS.GENDERS.MALE ? 'fas fa-male' : 'fas fa-female'"></i>
              </div>
              <div class="student-basic-info">
                <h2>{{ selectedStudent.name }}</h2>
                <p class="student-index">Index: {{ selectedStudent.indexNo }}</p>
                <div class="student-badges">
                  <span class="batch-badge" :class="`batch-${selectedStudent.batch}`">{{ selectedStudent.batch }}</span>
                  <span class="stream-badge" :class="`stream-${selectedStudent.stream}`">{{ selectedStudent.stream }}</span>
                </div>
                <div class="student-contact">
                  <i class="fas fa-phone"></i>
                  <span>{{ selectedStudent.parentPhone }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="details-actions">
              <button @click="toggleMarksGraph" class="btn btn-primary">
                <i class="fas fa-chart-line"></i>
                {{ showMarksGraph ? 'Hide' : 'Show' }} Exam Marks Graph
              </button>
              <button @click="togglePaymentHistory" class="btn btn-secondary">
                <i class="fas fa-money-bill-wave"></i>
                {{ showPaymentHistory ? 'Hide' : 'Show' }} Payment History
              </button>
            </div>

            <!-- Exam Marks Graph -->
            <div v-if="showMarksGraph" class="marks-graph-section">
              <h3><i class="fas fa-chart-line"></i> Exam Performance</h3>
              <div v-if="examMarksData.length === 0" class="no-data">
                <i class="fas fa-chart-line"></i>
                <p>No exam marks recorded yet</p>
              </div>
              <div v-else class="marks-chart">
                <div class="chart-container">
                  <div class="chart-bars">
                    <div 
                      v-for="(exam, index) in examMarksData" 
                      :key="index"
                      class="chart-bar"
                      :style="{ height: `${(exam.mark / 100) * 100}%` }"
                    >
                      <div class="bar-value">{{ exam.mark }}</div>
                      <div class="bar-label">{{ exam.subject }}</div>
                    </div>
                  </div>
                </div>
                <div class="chart-summary">
                  <div class="summary-item">
                    <span class="label">Average:</span>
                    <span class="value">{{ averageMark }}%</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">Total Exams:</span>
                    <span class="value">{{ examMarksData.length }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment History -->
            <div v-if="showPaymentHistory" class="payment-history-section">
              <h3><i class="fas fa-money-bill-wave"></i> Payment History</h3>
              <div v-if="paymentHistoryData.length === 0" class="no-data">
                <i class="fas fa-money-bill-wave"></i>
                <p>No exam payments recorded yet</p>
              </div>
              <div v-else class="payment-list">
                <div 
                  v-for="(payment, index) in paymentHistoryData" 
                  :key="index"
                  class="payment-item"
                  :class="{ 'unpaid': !payment.fee }"
                >
                  <div class="payment-info">
                    <div class="exam-name">{{ payment.subject }} - {{ payment.batch }}</div>
                    <div class="exam-date">{{ formatDate(payment.examDate) }}</div>
                  </div>
                  <div class="payment-status">
                    <span v-if="payment.fee" class="paid-badge">
                      <i class="fas fa-check-circle"></i>
                      Paid: Rs. {{ payment.fee }}
                    </span>
                    <span v-else class="unpaid-badge">
                      <i class="fas fa-times-circle"></i>
                      Unpaid
                    </span>
                  </div>
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
      <router-link to="/students" class="nav-link active">
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
      <router-link to="/reports" class="nav-link">
        <i class="fas fa-file-pdf"></i>
        <span>Reports</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
import { CONSTANTS, formatDateForSystem } from '../../config/database.js'
import { studentService } from '../../services/firestore.js'
import { log, logError, logSuccess } from '../../config/database.js'

export default {
  name: 'Students',
  data() {
    return {
      CONSTANTS,
      students: [],
      filteredStudents: [],
      loading: true,
      searchQuery: '',
      selectedBatch: '',
      showAddModal: false,
      showEditModal: false,
      showDetailsModal: false,
      saving: false,
      selectedStudent: null,
      showMarksGraph: false,
      showPaymentHistory: false,
      examMarksData: [],
      paymentHistoryData: [],
      studentForm: {
        indexNo: '',
        name: '',
        gender: '',
        stream: '',
        parentPhone: '',
        batch: ''
      },
      editingStudent: null
    }
  },
  
  computed: {
    averageMark() {
      if (this.examMarksData.length === 0) return 0
      const total = this.examMarksData.reduce((sum, exam) => sum + exam.mark, 0)
      return Math.round(total / this.examMarksData.length)
    }
  },
  
  async mounted() {
    await this.loadStudents()
  },
  
  methods: {
    async loadStudents() {
      try {
        log('Loading students from database')
        this.loading = true
        this.students = await studentService.getAll()
        logSuccess(`Loaded ${this.students.length} students`)
        this.filterStudents()
      } catch (error) {
        logError('Failed to load students', error)
        this.showToast('Failed to load students', 'error')
      } finally {
        this.loading = false
      }
    },
    
    filterStudents() {
      let filtered = [...this.students]
      
      // Filter by batch
      if (this.selectedBatch) {
        filtered = filtered.filter(student => student.batch === this.selectedBatch)
      }
      
      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(student => 
          student.name.toLowerCase().includes(query) ||
          student.indexNo.toLowerCase().includes(query)
        )
      }
      
      this.filteredStudents = filtered
    },
    
    editStudent(student) {
      this.editingStudent = student
      this.studentForm = {
        indexNo: student.indexNo,
        name: student.name,
        gender: student.gender,
        stream: student.stream,
        parentPhone: student.parentPhone,
        batch: student.batch
      }
      this.showEditModal = true
    },
    
    async saveStudent() {
      try {
        this.saving = true
        log('Saving student data', this.studentForm)
        
        // Validate form
        if (!this.studentForm.indexNo || !this.studentForm.name || !this.studentForm.gender || 
            !this.studentForm.stream || !this.studentForm.parentPhone || !this.studentForm.batch) {
          logWarning('Form validation failed - missing required fields')
          this.showToast('Please fill in all required fields', 'error')
          return
        }
        
        // Format data for new database structure
        const studentData = {
          indexNo: this.studentForm.indexNo,
          name: this.studentForm.name,
          gender: this.studentForm.gender,
          stream: this.studentForm.stream,
          parentPhone: this.studentForm.parentPhone,
          batch: this.studentForm.batch
        }
        
        if (this.showAddModal) {
          // Check if index number already exists
          const existingStudent = await studentService.getByIndexNo(this.studentForm.indexNo)
          if (existingStudent) {
            logWarning(`Student with index number ${this.studentForm.indexNo} already exists`)
            this.showToast('Student with this index number already exists', 'error')
            return
          }
          
          // Add new student
          await studentService.create(studentData)
          logSuccess(`Student ${studentData.name} (${studentData.indexNo}) created successfully`)
          this.showToast('Student added successfully', 'success')
        } else {
          // Update existing student
          await studentService.update(this.editingStudent.indexNo, studentData)
          logSuccess(`Student ${studentData.name} (${studentData.indexNo}) updated successfully`)
          this.showToast('Student updated successfully', 'success')
        }
        
        this.closeModal()
        await this.loadStudents()
        
      } catch (error) {
        logError('Error saving student', error)
        this.showToast('Failed to save student', 'error')
      } finally {
        this.saving = false
      }
    },
    
    async deleteStudent(student) {
      if (!confirm(`Are you sure you want to delete ${student.name} (${student.indexNo})?`)) {
        return
      }
      
      try {
        log(`Deleting student ${student.name} (${student.indexNo})`)
        await studentService.delete(student.indexNo)
        logSuccess(`Student ${student.name} (${student.indexNo}) deleted successfully`)
        this.showToast('Student deleted successfully', 'success')
        await this.loadStudents()
      } catch (error) {
        logError('Error deleting student', error)
        this.showToast('Failed to delete student', 'error')
      }
    },
    
    closeModal() {
      this.showAddModal = false
      this.showEditModal = false
      this.editingStudent = null
      this.studentForm = {
        indexNo: '',
        name: '',
        gender: '',
        stream: '',
        parentPhone: '',
        batch: ''
      }
    },
    
    async viewStudentDetails(student) {
      log(`Viewing details for student ${student.name}`)
      this.selectedStudent = student
      this.showDetailsModal = true
      
      // Load exam marks data
      await this.loadExamMarksData(student)
      
      // Load payment history data
      await this.loadPaymentHistoryData(student)
    },
    
    async loadExamMarksData(student) {
      try {
        log(`Loading exam marks for student ${student.indexNo}`)
        const examRecords = student.examRecords || {}
        
        this.examMarksData = Object.entries(examRecords)
          .filter(([examId, record]) => record.mark !== null && record.mark !== undefined)
          .map(([examId, record]) => {
            // Extract subject from examId (format: batch_subject_date)
            const parts = examId.split('_')
            const subject = parts[1] ? parts[1].toUpperCase() : 'Unknown'
            
            return {
              examId,
              subject,
              mark: record.mark,
              examDate: record.examDate
            }
          })
          .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
        
        logSuccess(`Loaded ${this.examMarksData.length} exam marks for student`)
      } catch (error) {
        logError('Error loading exam marks data', error)
        this.examMarksData = []
      }
    },
    
    async loadPaymentHistoryData(student) {
      try {
        log(`Loading payment history for student ${student.indexNo}`)
        const examRecords = student.examRecords || {}
        
        this.paymentHistoryData = Object.entries(examRecords)
          .map(([examId, record]) => {
            // Extract subject and batch from examId (format: batch_subject_date)
            const parts = examId.split('_')
            const batch = parts[0] ? parts[0] : 'Unknown'
            const subject = parts[1] ? parts[1].toUpperCase() : 'Unknown'
            
            return {
              examId,
              batch,
              subject,
              fee: record.fee,
              examDate: record.examDate
            }
          })
          .sort((a, b) => new Date(b.examDate) - new Date(a.examDate))
        
        logSuccess(`Loaded ${this.paymentHistoryData.length} payment records for student`)
      } catch (error) {
        logError('Error loading payment history data', error)
        this.paymentHistoryData = []
      }
    },
    
    toggleMarksGraph() {
      this.showMarksGraph = !this.showMarksGraph
      log(`Toggled marks graph: ${this.showMarksGraph}`)
    },
    
    togglePaymentHistory() {
      this.showPaymentHistory = !this.showPaymentHistory
      log(`Toggled payment history: ${this.showPaymentHistory}`)
    },
    
    closeDetailsModal() {
      this.showDetailsModal = false
      this.selectedStudent = null
      this.showMarksGraph = false
      this.showPaymentHistory = false
      this.examMarksData = []
      this.paymentHistoryData = []
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
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
.students-page {
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

.filters-section {
  background: white;
  padding: 20px 0;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filters-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.search-input {
  position: relative;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading-state .spinner {
  margin: 0 auto 16px;
}

.empty-state i {
  font-size: 48px;
  color: #6c757d;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 20px;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.student-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.student-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.student-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.student-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.student-info h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.index-no {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 8px;
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.batch-badge, .stream-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.batch-26AL {
  background: #dbeafe;
  color: #1e40af;
}

.batch-27AL {
  background: #fef3c7;
  color: #d97706;
}

.stream-BIO {
  background: #dcfce7;
  color: #16a34a;
}

.stream-MATH {
  background: #fce7f3;
  color: #be185d;
}

.student-details {
  padding: 16px 20px;
  border-top: 1px solid #f8f9fa;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
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

.student-actions {
  padding: 16px 20px;
  background: #f8f9fa;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-sm {
  padding: 8px 12px;
  font-size: 12px;
  min-height: 32px;
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
  .filters-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .students-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .bottom-nav {
    display: flex;
  }
}

/* Student Details Modal Styles */
.details-modal {
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.student-details-content {
  padding: 0;
}

.student-info-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  margin-bottom: 20px;
}

.student-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
}

.student-basic-info h2 {
  margin: 0 0 8px 0;
  color: #1e40af;
  font-size: 24px;
}

.student-index {
  margin: 0 0 12px 0;
  color: #6c757d;
  font-size: 16px;
}

.student-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.student-contact {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-size: 14px;
}

.details-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.details-actions .btn {
  flex: 1;
  min-width: 150px;
}

.marks-graph-section,
.payment-history-section {
  margin-bottom: 20px;
}

.marks-graph-section h3,
.payment-history-section h3 {
  color: #1e40af;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.marks-chart {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-container {
  margin-bottom: 20px;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 12px;
  height: 200px;
  padding: 20px 0;
  border-bottom: 2px solid #e9ecef;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 8px 4px;
}

.bar-value {
  color: white;
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 4px;
}

.bar-label {
  color: #6c757d;
  font-size: 10px;
  text-align: center;
  transform: rotate(-45deg);
  white-space: nowrap;
}

.chart-summary {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.summary-item {
  text-align: center;
}

.summary-item .label {
  display: block;
  color: #6c757d;
  font-size: 12px;
  margin-bottom: 4px;
}

.summary-item .value {
  display: block;
  color: #1e40af;
  font-size: 18px;
  font-weight: bold;
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #28a745;
}

.payment-item.unpaid {
  border-left-color: #dc3545;
}

.payment-info {
  flex: 1;
}

.exam-name {
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 4px;
}

.exam-date {
  color: #6c757d;
  font-size: 12px;
}

.payment-status {
  text-align: right;
}

.paid-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #d4edda;
  color: #155724;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.unpaid-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .student-info-section {
    flex-direction: column;
    text-align: center;
  }
  
  .details-actions {
    flex-direction: column;
  }
  
  .details-actions .btn {
    min-width: auto;
  }
  
  .chart-bars {
    height: 150px;
    gap: 8px;
  }
  
  .chart-summary {
    flex-direction: column;
    gap: 12px;
  }
  
  .payment-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .payment-status {
    text-align: center;
  }
}
</style>
