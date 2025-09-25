<template>
  <div class="dashboard">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="container-fluid">
        <router-link to="/dashboard" class="navbar-brand">
          <img src="/logo.svg" alt="Logo" class="navbar-logo" />
          {{ CONSTANTS.APP_NAME }}
        </router-link>
        <button @click="logout" class="btn btn-sm btn-secondary">
          <i class="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container-fluid">
      <!-- Dashboard Overview -->
      <div class="dashboard-overview">
        <h2>Dashboard Overview</h2>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <h3>{{ totalStudents }}</h3>
              <p>Total Students</p>
              <small>{{ studentsByBatch[CONSTANTS.BATCHES.BATCH_26AL] || 0 }} (26AL) • {{ studentsByBatch[CONSTANTS.BATCHES.BATCH_27AL] || 0 }} (27AL)</small>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-content">
              <h3>{{ todayAttendance }}%</h3>
              <p>Today's Attendance</p>
              <small>{{ todayPresent }}/{{ todayTotal }} students</small>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="stat-content">
              <h3>{{ upcomingExams }}</h3>
              <p>Upcoming Exams</p>
              <small>Next: {{ nextExamDate || 'None' }}</small>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-content">
              <h3>Rs. {{ currentBalance.toLocaleString() }}</h3>
              <p>Current Balance</p>
              <small>Income: Rs. {{ totalIncome.toLocaleString() }} • Expenses: Rs. {{ totalExpenses.toLocaleString() }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="action-buttons">
          <router-link to="/students" class="action-btn">
            <i class="fas fa-user-plus"></i>
            <span>Add Student</span>
          </router-link>
          <router-link to="/classes" class="action-btn">
            <i class="fas fa-chalkboard-teacher"></i>
            <span>Manage Classes</span>
          </router-link>
          <router-link to="/attendance" class="action-btn">
            <i class="fas fa-calendar-plus"></i>
            <span>Mark Attendance</span>
          </router-link>
          <router-link to="/exams" class="action-btn">
            <i class="fas fa-plus-circle"></i>
            <span>Create Exam</span>
          </router-link>
          <router-link to="/finance" class="action-btn">
            <i class="fas fa-receipt"></i>
            <span>Add Expense</span>
          </router-link>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h3>Recent Activity</h3>
        <div class="activity-list">
          <div v-if="recentActivities.length === 0" class="no-activity">
            <i class="fas fa-info-circle"></i>
            <p>No recent activity</p>
          </div>
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon">
              <i :class="activity.icon"></i>
            </div>
            <div class="activity-content">
              <p>{{ activity.message }}</p>
              <small>{{ formatTime(activity.timestamp) }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
      <router-link to="/dashboard" class="nav-link" :class="{ active: $route.name === 'Dashboard' }">
        <i class="fas fa-home"></i>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/students" class="nav-link" :class="{ active: $route.name === 'Students' }">
        <i class="fas fa-users"></i>
        <span>Students</span>
      </router-link>
      <router-link to="/classes" class="nav-link" :class="{ active: $route.name === 'Classes' }">
        <i class="fas fa-chalkboard-teacher"></i>
        <span>Classes</span>
      </router-link>
      <router-link to="/attendance" class="nav-link" :class="{ active: $route.name === 'Attendance' }">
        <i class="fas fa-calendar-check"></i>
        <span>Attendance</span>
      </router-link>
      <router-link to="/exams" class="nav-link" :class="{ active: $route.name === 'Exams' }">
        <i class="fas fa-clipboard-list"></i>
        <span>Exams</span>
      </router-link>
      <router-link to="/finance" class="nav-link" :class="{ active: $route.name === 'Finance' }">
        <i class="fas fa-chart-line"></i>
        <span>Finance</span>
      </router-link>
      <router-link to="/reports" class="nav-link" :class="{ active: $route.name === 'Reports' }">
        <i class="fas fa-file-pdf"></i>
        <span>Reports</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
import { CONSTANTS } from '../../config/database.js'
import { studentService, classAttendanceService, classService, examService, financeService } from '../../services/firestore.js'
import { log, logError, logSuccess, logWarning } from '../../config/database.js'

export default {
  name: 'Dashboard',
  data() {
    return {
      CONSTANTS,
      totalStudents: 0,
      studentsByBatch: {},
      todayAttendance: 0,
      todayPresent: 0,
      todayTotal: 0,
      upcomingExams: 0,
      nextExamDate: null,
      totalIncome: 0,
      totalExpenses: 0,
      currentBalance: 0,
      recentActivities: [],
      loading: true
    }
  },
  
  async mounted() {
    await this.loadDashboardData()
  },
  
  methods: {
    async loadDashboardData() {
      try {
        log('Loading dashboard data')
        this.loading = true
        
        // Load all data in parallel
        const [students, todayAttendanceData, exams, expenses] = await Promise.all([
          studentService.getAll(),
          this.getTodayAttendance(),
          examService.getAll(),
          financeService.getAllExpenses()
        ])
        
        logSuccess(`Loaded dashboard data: ${students.length} students, ${exams.length} exams, ${expenses.length} transactions`)
        
        // Process students data
        this.totalStudents = students.length
        this.studentsByBatch = students.reduce((acc, student) => {
          acc[student.batch] = (acc[student.batch] || 0) + 1
          return acc
        }, {})
        
        // Process attendance data
        if (todayAttendanceData.length > 0) {
          this.todayPresent = todayAttendanceData.length
          this.todayTotal = students.filter(s => s.batch === CONSTANTS.BATCHES.BATCH_26AL || s.batch === CONSTANTS.BATCHES.BATCH_27AL).length
          this.todayAttendance = Math.round((this.todayPresent / this.todayTotal) * 100)
        }
        
        // Process exams data
        const upcomingExamsList = exams.filter(exam => exam.status === CONSTANTS.EXAM_STATUS.UPCOMING)
        this.upcomingExams = upcomingExamsList.length
        
        if (upcomingExamsList.length > 0) {
          const nextExam = upcomingExamsList.sort((a, b) => new Date(a.date) - new Date(b.date))[0]
          this.nextExamDate = this.formatDate(nextExam.date)
        }
        
        // Process finance data
        const incomeExpenses = expenses.filter(e => e.type === CONSTANTS.EXPENSE_TYPES.INCOME)
        const expenseExpenses = expenses.filter(e => e.type === CONSTANTS.EXPENSE_TYPES.EXPENSE)
        
        this.totalIncome = incomeExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
        this.totalExpenses = expenseExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
        this.currentBalance = this.totalIncome - this.totalExpenses
        
        logSuccess(`Dashboard calculations completed: Income Rs.${this.totalIncome}, Expenses Rs.${this.totalExpenses}, Balance Rs.${this.currentBalance}`)
        
        // Generate recent activities
        this.generateRecentActivities(students, exams, expenses)
        
      } catch (error) {
        logError('Error loading dashboard data', error)
        this.showToast('Failed to load dashboard data', 'error')
      } finally {
        this.loading = false
      }
    },
    
    async getTodayAttendance() {
      const today = new Date().toISOString().split('T')[0]
      log(`Getting today's attendance for ${today}`)
      
      try {
        // Get all classes first
        const classes = await classService.getAll()
        log(`Found ${classes.length} classes`)
        
        let totalAttendance = []
        
        // Get attendance for each class
        for (const cls of classes) {
          const classAttendance = await classAttendanceService.getByDateAndClass(today, cls.classId)
          totalAttendance = [...totalAttendance, ...classAttendance]
          log(`Class ${cls.classId}: ${classAttendance.length} students present`)
        }
        
        log(`Today's total attendance: ${totalAttendance.length} students across all classes`)
        return totalAttendance
      } catch (error) {
        logError('Error getting today\'s attendance', error)
        return []
      }
    },
    
    generateRecentActivities(students, exams, expenses) {
      const activities = []
      
      // Recent students
      const recentStudents = students.slice(-3)
      recentStudents.forEach(student => {
        activities.push({
          id: `student-${student.id}`,
          icon: 'fas fa-user-plus',
          message: `New student added: ${student.name} (${student.indexNo})`,
          timestamp: student.createdAt || new Date()
        })
      })
      
      // Recent exams
      const recentExams = exams.slice(-2)
      recentExams.forEach(exam => {
        activities.push({
          id: `exam-${exam.id}`,
          icon: 'fas fa-clipboard-list',
          message: `Exam created: ${exam.subject} for ${exam.batch}`,
          timestamp: exam.createdAt || new Date()
        })
      })
      
      // Recent expenses
      const recentExpenses = expenses.slice(-2)
      recentExpenses.forEach(expense => {
        activities.push({
          id: `expense-${expense.id}`,
          icon: expense.type === CONSTANTS.EXPENSE_TYPES.INCOME ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
          message: `${expense.type === CONSTANTS.EXPENSE_TYPES.INCOME ? 'Income' : 'Expense'}: Rs. ${expense.amount} - ${expense.reason}`,
          timestamp: expense.createdAt || new Date()
        })
      })
      
      // Sort by timestamp and take latest 5
      this.recentActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    
    formatTime(timestamp) {
      const now = new Date()
      const time = new Date(timestamp)
      const diffInHours = (now - time) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        return 'Just now'
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`
      } else {
        return `${Math.floor(diffInHours / 24)} days ago`
      }
    },
    
    logout() {
      log('User logging out')
      localStorage.removeItem('pesalai_auth')
      logSuccess('User logged out successfully')
      this.$router.push('/')
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
.dashboard {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 80px; /* Space for bottom nav */
}

.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #1e40af;
  text-decoration: none;
}

.navbar-logo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.container-fluid {
  padding: 16px;
}

.dashboard-overview h2 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-content h3 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-content p {
  color: #6c757d;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-content small {
  color: #adb5bd;
  font-size: 12px;
}

.quick-actions {
  margin-bottom: 32px;
}

.quick-actions h3 {
  margin-bottom: 16px;
  color: #2c3e50;
  font-size: 20px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.action-btn {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-decoration: none;
  color: #495057;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.action-btn:hover {
  transform: translateY(-2px);
  border-color: #1e40af;
  color: #1e40af;
}

.action-btn i {
  font-size: 24px;
}

.action-btn span {
  font-weight: 600;
  font-size: 14px;
}

.recent-activity {
  margin-bottom: 32px;
}

.recent-activity h3 {
  margin-bottom: 16px;
  color: #2c3e50;
  font-size: 20px;
}

.activity-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.no-activity {
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
}

.no-activity i {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f8f9fa;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e40af;
  font-size: 16px;
}

.activity-content p {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-weight: 500;
}

.activity-content small {
  color: #6c757d;
  font-size: 12px;
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

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .action-buttons {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .bottom-nav {
    display: none;
  }
  
  .dashboard {
    padding-bottom: 0;
  }
}
</style>
