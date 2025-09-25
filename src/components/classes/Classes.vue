<template>
  <div class="classes-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container-fluid">
        <div class="header-content">
          <div class="header-left">
            <h1><i class="fas fa-chalkboard-teacher"></i> Class Management</h1>
            <p>Create and manage classes for attendance tracking</p>
          </div>
          <button @click="showAddModal = true" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Create Class
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="container-fluid">
        <div class="filters-row">
          <div class="filter-group">
            <label class="form-label">Batch Filter</label>
            <select v-model="selectedBatch" @change="filterClasses" class="form-control">
              <option value="">All Batches</option>
              <option :value="CONSTANTS.BATCHES.BATCH_26AL">26AL</option>
              <option :value="CONSTANTS.BATCHES.BATCH_27AL">27AL</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="form-label">Subject Filter</label>
            <select v-model="selectedSubject" @change="filterClasses" class="form-control">
              <option value="">All Subjects</option>
              <option :value="CONSTANTS.SUBJECTS.BIO">BIO</option>
              <option :value="CONSTANTS.SUBJECTS.MATH">MATH</option>
              <option :value="CONSTANTS.SUBJECTS.PHY">PHY</option>
              <option :value="CONSTANTS.SUBJECTS.CHE">CHE</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Classes Grid -->
    <div class="classes-content">
      <div class="container-fluid">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <h3>Loading classes...</h3>
          <p>Please wait while we fetch the class data</p>
        </div>
        
        <div v-else-if="filteredClasses.length === 0" class="empty-state">
          <i class="fas fa-chalkboard-teacher"></i>
          <h3>No Classes Found</h3>
          <p>Create your first class to start tracking attendance</p>
          <button @click="showAddModal = true" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Create Class
          </button>
        </div>
        
        <div v-else class="classes-grid">
          <div v-for="cls in filteredClasses" :key="cls.id" class="class-card">
            <div class="class-header">
              <div class="class-icon">
                <i :class="getSubjectIcon(cls.subject)"></i>
              </div>
              <div class="class-info">
                <h3>{{ cls.subject }}</h3>
                <p class="class-id">Class ID: {{ cls.classId }}</p>
                <span class="batch-badge" :class="`batch-${cls.batch}`">{{ cls.batch }}</span>
              </div>
            </div>
            
            <div class="class-details">
              <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <span>Created: {{ formatDate(cls.createdAt) }}</span>
              </div>
            </div>
            
            <div class="class-actions">
              <button @click="editClass(cls)" class="btn btn-sm btn-secondary">
                <i class="fas fa-edit"></i>
                Edit
              </button>
              <button @click="deleteClass(cls)" class="btn btn-sm btn-danger">
                <i class="fas fa-trash"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Class Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ showAddModal ? 'Create New Class' : 'Edit Class' }}
          </h3>
          <button @click="closeModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Batch *</label>
            <select v-model="classForm.batch" class="form-control" required>
              <option value="">Select Batch</option>
              <option :value="CONSTANTS.BATCHES.BATCH_26AL">26AL</option>
              <option :value="CONSTANTS.BATCHES.BATCH_27AL">27AL</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Subject *</label>
            <select v-model="classForm.subject" class="form-control" required>
              <option value="">Select Subject</option>
              <option :value="CONSTANTS.SUBJECTS.BIO">BIO</option>
              <option :value="CONSTANTS.SUBJECTS.MATH">MATH</option>
              <option :value="CONSTANTS.SUBJECTS.PHY">PHY</option>
              <option :value="CONSTANTS.SUBJECTS.CHE">CHE</option>
            </select>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button @click="saveClass" :disabled="saving" class="btn btn-primary">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Saving...' : (showAddModal ? 'Create Class' : 'Update Class') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="bottom-nav">
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
        <i class="fas fa-file-alt"></i>
        <span>Exams</span>
      </router-link>
      <router-link to="/finance" class="nav-link">
        <i class="fas fa-chart-line"></i>
        <span>Finance</span>
      </router-link>
      <router-link to="/reports" class="nav-link">
        <i class="fas fa-chart-bar"></i>
        <span>Reports</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { classService } from '../../services/firestore.js'
import { CONSTANTS, formatDate, generateClassId, log, logError, logSuccess, logWarning } from '../../config/database.js'

export default {
  name: 'Classes',
  data() {
    return {
      classes: [],
      filteredClasses: [],
      loading: true,
      selectedBatch: '',
      selectedSubject: '',
      showAddModal: false,
      showEditModal: false,
      saving: false,
      classForm: {
        batch: '',
        subject: ''
      },
      editingClass: null,
      CONSTANTS
    }
  },
  
  async mounted() {
    await this.loadClasses()
  },
  
  methods: {
    async loadClasses() {
      try {
        log('Loading classes from database')
        this.loading = true
        this.classes = await classService.getAll()
        this.filteredClasses = [...this.classes]
        logSuccess(`Loaded ${this.classes.length} classes`)
      } catch (error) {
        logError('Error loading classes', error)
        this.showToast('Failed to load classes', 'error')
      } finally {
        this.loading = false
      }
    },
    
    filterClasses() {
      log('Filtering classes', { selectedBatch: this.selectedBatch, selectedSubject: this.selectedSubject })
      let filtered = [...this.classes]
      
      if (this.selectedBatch) {
        filtered = filtered.filter(cls => cls.batch === this.selectedBatch)
      }
      
      if (this.selectedSubject) {
        filtered = filtered.filter(cls => cls.subject === this.selectedSubject)
      }
      
      this.filteredClasses = filtered
      logSuccess(`Filtered to ${filtered.length} classes`)
    },
    
    editClass(cls) {
      this.editingClass = cls
      this.classForm = {
        batch: cls.batch,
        subject: cls.subject
      }
      this.showEditModal = true
    },
    
    async saveClass() {
      try {
        this.saving = true
        log('Saving class data', this.classForm)
        
        // Validate form
        if (!this.classForm.batch || !this.classForm.subject) {
          logWarning('Form validation failed - missing required fields')
          this.showToast('Please fill in all required fields', 'error')
          return
        }
        
        // Check if class already exists
        const classId = generateClassId(this.classForm.batch, this.classForm.subject)
        const existingClass = await classService.getByClassId(classId)
        
        if (this.showAddModal && existingClass) {
          logWarning(`Class ${classId} already exists`)
          this.showToast('Class with this batch and subject already exists', 'error')
          return
        }
        
        // Format data for database
        const classData = {
          classId: classId,
          batch: this.classForm.batch,
          subject: this.classForm.subject
        }
        
        if (this.showAddModal) {
          // Create new class
          await classService.create(classData)
          logSuccess(`Class ${classId} created successfully`)
          this.showToast('Class created successfully', 'success')
        } else {
          // Update existing class
          await classService.update(this.editingClass.classId, classData)
          logSuccess(`Class ${classId} updated successfully`)
          this.showToast('Class updated successfully', 'success')
        }
        
        await this.loadClasses()
        this.closeModal()
        
      } catch (error) {
        logError('Error saving class', error)
        this.showToast('Failed to save class', 'error')
      } finally {
        this.saving = false
      }
    },
    
    async deleteClass(cls) {
      if (!confirm(`Are you sure you want to delete the class ${cls.subject} (${cls.batch})?`)) {
        return
      }
      
      try {
        log(`Deleting class ${cls.classId}`)
        await classService.delete(cls.classId)
        logSuccess(`Class ${cls.classId} deleted successfully`)
        this.showToast('Class deleted successfully', 'success')
        await this.loadClasses()
      } catch (error) {
        logError('Error deleting class', error)
        this.showToast('Failed to delete class', 'error')
      }
    },
    
    closeModal() {
      this.showAddModal = false
      this.showEditModal = false
      this.editingClass = null
      this.classForm = {
        batch: '',
        subject: ''
      }
    },
    
    getSubjectIcon(subject) {
      const icons = {
        'BIO': 'fas fa-dna',
        'MATH': 'fas fa-calculator',
        'PHY': 'fas fa-atom',
        'CHE': 'fas fa-flask'
      }
      return icons[subject] || 'fas fa-book'
    },
    
    formatDate,
    
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
.classes-page {
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
  color: #1e40af;
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
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
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
  color: #1e40af;
  margin-bottom: 8px;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 20px;
}

.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.class-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.class-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.class-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.class-icon {
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

.class-info h3 {
  font-size: 18px;
  color: #1e40af;
  margin-bottom: 4px;
}

.class-id {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 8px;
}

.batch-badge {
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

.class-details {
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

.class-actions {
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
  background: rgba(30, 64, 175, 0.1);
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
  
  .classes-grid {
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

@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
  
  .classes-page {
    padding-bottom: 0;
  }
}
</style>

