<template>
  <div class="attendance-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container-fluid">
        <div class="header-content">
          <div class="header-left">
            <h1><i class="fas fa-calendar-check"></i> Class Attendance</h1>
            <p>Mark daily attendance for students</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Setup -->
    <div class="attendance-setup" v-if="!attendanceLoaded">
      <div class="container-fluid">
        <div class="setup-card">
          <h3>Setup Attendance</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Select Class *</label>
              <select v-model="selectedClass" class="form-control" required>
                <option value="">Choose Class</option>
                <option v-for="cls in classes" :key="cls.classId" :value="cls.classId">
                  {{ cls.subject }} - {{ cls.batch }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Select Date *</label>
              <div class="date-input-group">
                <input
                  v-model="selectedDate"
                  type="date"
                  class="form-control"
                  required
                />
                <button @click="setToday" class="btn btn-secondary btn-sm">Today</button>
              </div>
            </div>
          </div>
          
          <button 
            @click="loadAttendanceStudents" 
            class="btn btn-primary w-100"
            :disabled="!selectedClass || !selectedDate || loading"
          >
            <span v-if="loading" class="spinner"></span>
            <span v-else>Load Students</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Attendance Marking -->
    <div class="attendance-marking" v-if="attendanceLoaded">
      <div class="container-fluid">
        <!-- Attendance Summary -->
        <div class="attendance-summary">
          <div class="summary-card">
            <div class="summary-item">
              <span class="label">Batch:</span>
              <span class="value">{{ selectedBatch }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Date:</span>
              <span class="value">{{ formatDate(selectedDate) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Present:</span>
              <span class="value present">{{ presentCount }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Absent:</span>
              <span class="value absent">{{ absentCount }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Percentage:</span>
              <span class="value">{{ attendancePercentage }}%</span>
            </div>
          </div>
        </div>

        <!-- Swipe Instructions -->
        <div class="swipe-instructions">
          <div class="instruction-item">
            <i class="fas fa-arrow-right" style="color: #28a745;"></i>
            <span>Swipe Right = Present</span>
          </div>
          <div class="instruction-item">
            <i class="fas fa-arrow-left" style="color: #dc3545;"></i>
            <span>Swipe Left = Absent</span>
          </div>
        </div>

        <!-- Student Cards -->
        <div class="students-list">
          <div 
            v-for="student in attendanceStudents" 
            :key="student.id"
            class="student-attendance-card swipeable"
            :class="{ 
              'marked-present': student.attendance === CONSTANTS.ATTENDANCE_STATUS.PRESENT,
              'marked-absent': student.attendance === CONSTANTS.ATTENDANCE_STATUS.ABSENT
            }"
            @touchstart="handleTouchStart($event, student)"
            @touchmove="handleTouchMove($event, student)"
            @touchend="handleTouchEnd($event, student)"
          >
            <!-- Swipe Indicators -->
            <div class="swipe-indicator left">
              <i class="fas fa-times"></i>
            </div>
            <div class="swipe-indicator right">
              <i class="fas fa-check"></i>
            </div>
            
            <div class="student-card-content">
              <div class="student-avatar">
                <i :class="student.gender === CONSTANTS.GENDERS.MALE ? 'fas fa-male' : 'fas fa-female'"></i>
              </div>
              
              <div class="student-info">
                <h3>{{ student.name }}</h3>
                <p class="index-no">{{ student.indexNo }}</p>
                <span class="batch-badge">{{ student.batch }}</span>
              </div>
              
              <div class="attendance-status">
                <div v-if="student.attendance === CONSTANTS.ATTENDANCE_STATUS.PRESENT" class="status-badge present">
                  <i class="fas fa-check"></i>
                  Present
                </div>
                <div v-else-if="student.attendance === CONSTANTS.ATTENDANCE_STATUS.ABSENT" class="status-badge absent">
                  <i class="fas fa-times"></i>
                  Absent
                </div>
                <div v-else class="status-badge pending">
                  <i class="fas fa-clock"></i>
                  Pending
                </div>
              </div>
            </div>
            
            <!-- Manual Buttons -->
            <div class="manual-buttons">
              <button 
                @click="markAttendance(student, CONSTANTS.ATTENDANCE_STATUS.PRESENT)"
                class="btn btn-sm btn-success"
                :class="{ active: student.attendance === CONSTANTS.ATTENDANCE_STATUS.PRESENT }"
              >
                <i class="fas fa-check"></i>
                P
              </button>
              <button 
                @click="markAttendance(student, CONSTANTS.ATTENDANCE_STATUS.ABSENT)"
                class="btn btn-sm btn-danger"
                :class="{ active: student.attendance === CONSTANTS.ATTENDANCE_STATUS.ABSENT }"
              >
                <i class="fas fa-times"></i>
                A
              </button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="resetAttendance" class="btn btn-secondary">
            <i class="fas fa-undo"></i>
            Reset
          </button>
          <button @click="saveAttendance" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            <span v-else><i class="fas fa-save"></i> Save Attendance</span>
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
      <router-link to="/attendance" class="nav-link active">
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
import { CONSTANTS, getTodayDate, formatDateForSystem } from '../../config/database.js'
import { studentService, classAttendanceService, classService } from '../../services/firestore.js'
import { log, logError, logSuccess, logWarning } from '../../config/database.js'

export default {
  name: 'Attendance',
  data() {
    return {
      CONSTANTS,
      classes: [],
      selectedClass: '',
      selectedDate: getTodayDate(),
      attendanceLoaded: false,
      attendanceStudents: [],
      loading: false,
      saving: false,
      touchStartX: 0,
      touchStartY: 0,
      swipeThreshold: 100
    }
  },
  
  computed: {
    presentCount() {
      return this.attendanceStudents.filter(s => s.attendance === CONSTANTS.ATTENDANCE_STATUS.PRESENT).length
    },
    
    absentCount() {
      return this.attendanceStudents.filter(s => s.attendance === CONSTANTS.ATTENDANCE_STATUS.ABSENT).length
    },
    
    attendancePercentage() {
      if (this.attendanceStudents.length === 0) return 0
      return Math.round((this.presentCount / this.attendanceStudents.length) * 100)
    }
  },
  
  async mounted() {
    await this.loadClasses()
  },
  
  methods: {
    async loadClasses() {
      try {
        log('Loading classes for attendance')
        this.classes = await classService.getAll()
        logSuccess(`Loaded ${this.classes.length} classes`)
      } catch (error) {
        logError('Error loading classes', error)
        this.showToast('Failed to load classes', 'error')
      }
    },
    
    setToday() {
      this.selectedDate = getTodayDate()
    },
    
    async loadAttendanceStudents() {
      if (!this.selectedClass || !this.selectedDate) {
        logWarning('Missing class or date selection')
        this.showToast('Please select both class and date', 'error')
        return
      }
      
      try {
        log(`Loading attendance students for class ${this.selectedClass} on ${this.selectedDate}`)
        this.loading = true
        
        // Get class details
        const selectedClassData = this.classes.find(cls => cls.classId === this.selectedClass)
        if (!selectedClassData) {
          logError('Selected class not found')
          this.showToast('Selected class not found', 'error')
          return
        }
        
        // Load students for selected batch
        const students = await studentService.getByBatch(selectedClassData.batch)
        logSuccess(`Found ${students.length} students for batch ${selectedClassData.batch}`)
        
        if (students.length === 0) {
          logWarning(`No students found for batch ${selectedClassData.batch}`)
          this.showToast('No students found for selected class', 'error')
          return
        }
        
        // Load existing attendance for the date
        const existingAttendanceIds = await classAttendanceService.getByDateAndClass(this.selectedDate, this.selectedClass)
        log(`Found ${existingAttendanceIds.length} students already marked present`)
        
        // Merge student data with attendance data
        this.attendanceStudents = students.map(student => {
          const isPresent = existingAttendanceIds.includes(student.indexNo)
          return {
            ...student,
            attendance: isPresent ? CONSTANTS.ATTENDANCE_STATUS.PRESENT : null
          }
        })
        
        this.attendanceLoaded = true
        logSuccess(`Attendance interface loaded for ${this.attendanceStudents.length} students`)
        
      } catch (error) {
        logError('Error loading attendance students', error)
        this.showToast('Failed to load students', 'error')
      } finally {
        this.loading = false
      }
    },
    
    markAttendance(student, status) {
      const index = this.attendanceStudents.findIndex(s => s.id === student.id)
      if (index !== -1) {
        this.attendanceStudents[index].attendance = status
      }
    },
    
    // Touch/Swipe Handlers
    handleTouchStart(event, student) {
      this.touchStartX = event.touches[0].clientX
      this.touchStartY = event.touches[0].clientY
    },
    
    handleTouchMove(event, student) {
      if (!this.touchStartX || !this.touchStartY) return
      
      const touchX = event.touches[0].clientX
      const touchY = event.touches[0].clientY
      
      const diffX = touchX - this.touchStartX
      const diffY = touchY - this.touchStartY
      
      // Only handle horizontal swipes
      if (Math.abs(diffX) > Math.abs(diffY)) {
        event.preventDefault()
        
        // Add visual feedback
        const card = event.currentTarget
        const transform = Math.min(Math.abs(diffX), this.swipeThreshold)
        
        if (diffX > 0) {
          // Swiping right (present)
          card.style.transform = `translateX(${transform}px)`
          card.style.backgroundColor = 'rgba(40, 167, 69, 0.1)'
        } else {
          // Swiping left (absent)
          card.style.transform = `translateX(-${transform}px)`
          card.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'
        }
      }
    },
    
    handleTouchEnd(event, student) {
      const touchX = event.changedTouches[0].clientX
      const diffX = touchX - this.touchStartX
      
      // Reset card position
      const card = event.currentTarget
      card.style.transform = ''
      card.style.backgroundColor = ''
      
      // Check if swipe threshold was met
      if (Math.abs(diffX) > this.swipeThreshold) {
        if (diffX > 0) {
          // Swiped right - mark present
          this.markAttendance(student, CONSTANTS.ATTENDANCE_STATUS.PRESENT)
        } else {
          // Swiped left - mark absent
          this.markAttendance(student, CONSTANTS.ATTENDANCE_STATUS.ABSENT)
        }
      }
      
      // Reset touch coordinates
      this.touchStartX = 0
      this.touchStartY = 0
    },
    
    resetAttendance() {
      if (confirm('Are you sure you want to reset all attendance marks?')) {
        this.attendanceStudents.forEach(student => {
          student.attendance = null
        })
      }
    },
    
    async saveAttendance() {
      try {
        log(`Saving attendance for class ${this.selectedClass} on ${this.selectedDate}`)
        this.saving = true
        
        // Get list of present student IDs
        const presentStudentIds = this.attendanceStudents
          .filter(student => student.attendance === CONSTANTS.ATTENDANCE_STATUS.PRESENT)
          .map(student => student.indexNo)
        
        log(`Saving attendance: ${presentStudentIds.length} students present out of ${this.attendanceStudents.length}`)
        
        // Save attendance using new database structure
        await classAttendanceService.saveAttendance(
          this.selectedClass, 
          formatDateForSystem(this.selectedDate), 
          presentStudentIds
        )
        
        logSuccess(`Attendance saved successfully for class ${this.selectedClass}`)
        this.showToast('Attendance saved successfully', 'success')
        
        // Optionally redirect to dashboard
        setTimeout(() => {
          this.$router.push('/dashboard')
        }, 1500)
        
      } catch (error) {
        logError('Error saving attendance', error)
        this.showToast('Failed to save attendance', 'error')
      } finally {
        this.saving = false
      }
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-GB', {
        weekday: 'long',
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
.attendance-page {
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

.setup-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.setup-card h3 {
  text-align: center;
  margin-bottom: 24px;
  color: #2c3e50;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.date-input-group {
  display: flex;
  gap: 8px;
}

.date-input-group input {
  flex: 1;
}

.attendance-summary {
  margin-bottom: 20px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  text-align: center;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item .label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
}

.summary-item .value {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.summary-item .value.present {
  color: #28a745;
}

.summary-item .value.absent {
  color: #dc3545;
}

.swipe-instructions {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 32px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.students-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.student-attendance-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  touch-action: pan-y;
}

.student-attendance-card.marked-present {
  border-left: 4px solid #28a745;
}

.student-attendance-card.marked-absent {
  border-left: 4px solid #dc3545;
}

.swipe-indicator {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  color: rgba(255, 255, 255, 0.8);
  pointer-events: none;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.swipe-indicator.left {
  left: 20px;
  color: #dc3545;
}

.swipe-indicator.right {
  right: 20px;
  color: #28a745;
}

.student-card-content {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 16px;
}

.student-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.student-info {
  flex: 1;
}

.student-info h3 {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.index-no {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 4px;
}

.batch-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: #e9ecef;
  color: #495057;
}

.attendance-status {
  margin-right: 12px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.present {
  background: #d4edda;
  color: #155724;
}

.status-badge.absent {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.manual-buttons {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.manual-buttons .btn {
  min-width: 44px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.manual-buttons .btn.active {
  opacity: 1;
  transform: scale(1.05);
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.action-buttons .btn {
  min-width: 120px;
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
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .swipe-instructions {
    gap: 16px;
  }
  
  .summary-card {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .bottom-nav {
    display: flex;
  }
}

@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
  
  .attendance-page {
    padding-bottom: 0;
  }
}
</style>
