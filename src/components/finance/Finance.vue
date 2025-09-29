<template>
  <div class="finance-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container-fluid">
        <div class="header-content">
          <div class="header-left">
            <h1><i class="fas fa-chart-line"></i> Finance Management</h1>
            <p>Track income, expenses, and financial balance</p>
          </div>
          <div class="header-actions">
            <button @click="showAddIncomeModal = true" class="btn btn-success">
              <i class="fas fa-plus"></i>
              Add Income
            </button>
            <button @click="showAddExpenseModal = true" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Add Expense
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Financial Summary -->
    <div class="finance-summary">
      <div class="container-fluid">
        <div class="summary-cards">
          <div class="summary-card income">
            <div class="card-icon">
              <i class="fas fa-arrow-up"></i>
            </div>
            <div class="card-content">
              <h3>Rs. {{ totalIncome.toLocaleString() }}</h3>
              <p>Total Income</p>
              <small>{{ incomeTransactions.length }} transactions</small>
            </div>
          </div>
          
          <div class="summary-card expense">
            <div class="card-icon">
              <i class="fas fa-arrow-down"></i>
            </div>
            <div class="card-content">
              <h3>Rs. {{ totalExpenses.toLocaleString() }}</h3>
              <p>Total Expenses</p>
              <small>{{ expenseTransactions.length }} transactions</small>
            </div>
          </div>
          
          <div class="summary-card balance" :class="{ negative: currentBalance < 0 }">
            <div class="card-icon">
              <i class="fas fa-balance-scale"></i>
            </div>
            <div class="card-content">
              <h3>Rs. {{ currentBalance.toLocaleString() }}</h3>
              <p>Current Balance</p>
              <small>{{ currentBalance >= 0 ? 'Profit' : 'Loss' }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Finance Tabs -->
    <div class="finance-tabs">
      <div class="container-fluid">
        <div class="tabs-header">
          <button 
            @click="activeTab = 'income'" 
            class="tab-button"
            :class="{ active: activeTab === 'income' }"
          >
            <i class="fas fa-arrow-up"></i>
            Income ({{ incomeTransactions.length }})
          </button>
          <button 
            @click="activeTab = 'expenses'" 
            class="tab-button"
            :class="{ active: activeTab === 'expenses' }"
          >
            <i class="fas fa-arrow-down"></i>
            Expenses ({{ expenseTransactions.length }})
          </button>
        </div>
        
        <div class="tab-content">
          <!-- Income Tab -->
          <div v-if="activeTab === 'income'" class="transactions-list">
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading income transactions...</p>
            </div>
            
            <div v-else-if="incomeTransactions.length === 0" class="empty-state">
              <i class="fas fa-arrow-up"></i>
              <h3>No income recorded</h3>
              <p>Income will be automatically recorded when exams are completed</p>
            </div>
            
            <div v-else class="transactions-grid">
              <div v-for="transaction in incomeTransactions" :key="transaction.id" class="transaction-card income">
                <div class="transaction-header">
                  <div class="transaction-icon">
                    <i class="fas fa-arrow-up"></i>
                  </div>
                  <div class="transaction-info">
                    <h4>{{ transaction.reason }}</h4>
                    <p class="transaction-date">{{ formatDate(transaction.date) }}</p>
                  </div>
                  <div class="transaction-amount">
                    <span class="amount">+Rs. {{ transaction.amount.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Expenses Tab -->
          <div v-if="activeTab === 'expenses'" class="transactions-list">
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading expense transactions...</p>
            </div>
            
            <div v-else-if="expenseTransactions.length === 0" class="empty-state">
              <i class="fas fa-arrow-down"></i>
              <h3>No expenses recorded</h3>
              <p>Add your first expense to start tracking</p>
              <button @click="showAddExpenseModal = true" class="btn btn-primary">
                <i class="fas fa-plus"></i>
                Add First Expense
              </button>
            </div>
            
            <div v-else class="transactions-grid">
              <div v-for="transaction in expenseTransactions" :key="transaction.id" class="transaction-card expense">
                <div class="transaction-header">
                  <div class="transaction-icon">
                    <i class="fas fa-arrow-down"></i>
                  </div>
                  <div class="transaction-info">
                    <h4>{{ transaction.reason }}</h4>
                    <p class="transaction-date">{{ formatDate(transaction.date) }}</p>
                  </div>
                  <div class="transaction-amount">
                    <span class="amount">-Rs. {{ transaction.amount.toLocaleString() }}</span>
                  </div>
                </div>
                <div class="transaction-actions">
                  <button @click="editExpense(transaction)" class="btn btn-sm btn-secondary">
                    <i class="fas fa-edit"></i>
                    Edit
                  </button>
                  <button @click="deleteExpense(transaction)" class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Income Modal -->
    <div v-if="showAddIncomeModal || showEditIncomeModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ showAddIncomeModal ? 'Add New Income' : 'Edit Income' }}</h3>
          <button @click="closeModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveIncome" class="modal-body">
          <div class="form-group">
            <label class="form-label">Amount (Rs.) *</label>
            <input
              v-model.number="incomeForm.amount"
              type="number"
              class="form-control"
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Reason/Description *</label>
            <textarea
              v-model="incomeForm.reason"
              class="form-control"
              placeholder="Enter reason for income"
              rows="3"
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Date *</label>
            <input
              v-model="incomeForm.date"
              type="date"
              class="form-control"
              required
            />
          </div>
        </form>
        
        <div class="modal-footer">
          <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button type="submit" @click="saveIncome" class="btn btn-success" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            <span v-else>{{ showAddIncomeModal ? 'Add Income' : 'Update Income' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Expense Modal -->
    <div v-if="showAddExpenseModal || showEditExpenseModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ showAddExpenseModal ? 'Add New Expense' : 'Edit Expense' }}</h3>
          <button @click="closeModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveExpense" class="modal-body">
          <div class="form-group">
            <label class="form-label">Amount (Rs.) *</label>
            <input
              v-model.number="expenseForm.amount"
              type="number"
              class="form-control"
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Reason/Description *</label>
            <textarea
              v-model="expenseForm.reason"
              class="form-control"
              placeholder="Enter reason for expense"
              rows="3"
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Date *</label>
            <input
              v-model="expenseForm.date"
              type="date"
              class="form-control"
              required
            />
          </div>
        </form>
        
        <div class="modal-footer">
          <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button type="submit" @click="saveExpense" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            <span v-else>{{ showAddExpenseModal ? 'Add Expense' : 'Update Expense' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Financial Chart (Optional Enhancement) -->
    <div class="finance-chart">
      <div class="container-fluid">
        <div class="chart-card">
          <h3>Monthly Overview</h3>
          <div class="chart-placeholder">
            <div class="chart-bars">
              <div class="chart-bar income" :style="{ height: incomeBarHeight }">
                <span class="bar-label">Income</span>
                <span class="bar-value">Rs. {{ totalIncome.toLocaleString() }}</span>
              </div>
              <div class="chart-bar expense" :style="{ height: expenseBarHeight }">
                <span class="bar-label">Expenses</span>
                <span class="bar-value">Rs. {{ totalExpenses.toLocaleString() }}</span>
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
      <router-link to="/finance" class="nav-link active">
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
import { CONSTANTS, getTodayDate } from '../../config/database.js'
import { financeService } from '../../services/firestore.js'
import { log, logError, logSuccess, logWarning } from '../../config/database.js'

export default {
  name: 'Finance',
  data() {
    return {
      CONSTANTS,
      transactions: [],
      loading: true,
      activeTab: 'income',
      showAddIncomeModal: false,
      showEditIncomeModal: false,
      showAddExpenseModal: false,
      showEditExpenseModal: false,
      saving: false,
      incomeForm: {
        amount: '',
        reason: '',
        date: getTodayDate()
      },
      expenseForm: {
        amount: '',
        reason: '',
        date: getTodayDate()
      },
      editingExpense: null
    }
  },
  
  computed: {
    incomeTransactions() {
      return this.transactions
        .filter(t => t.type === CONSTANTS.EXPENSE_TYPES.INCOME)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    
    expenseTransactions() {
      return this.transactions
        .filter(t => t.type !== CONSTANTS.EXPENSE_TYPES.INCOME)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    
    totalIncome() {
      return this.incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    },
    
    totalExpenses() {
      return this.expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    },
    
    currentBalance() {
      return this.totalIncome - this.totalExpenses
    },
    
    incomeBarHeight() {
      const maxAmount = Math.max(this.totalIncome, this.totalExpenses)
      if (maxAmount === 0) return '20px'
      return `${Math.max((this.totalIncome / maxAmount) * 200, 20)}px`
    },
    
    expenseBarHeight() {
      const maxAmount = Math.max(this.totalIncome, this.totalExpenses)
      if (maxAmount === 0) return '20px'
      return `${Math.max((this.totalExpenses / maxAmount) * 200, 20)}px`
    }
  },
  
  async mounted() {
    await this.loadTransactions()
  },
  
  methods: {
    async loadTransactions() {
      try {
        log('Loading financial transactions')
        this.loading = true
        this.transactions = await financeService.getAllExpenses()
        logSuccess(`Loaded ${this.transactions.length} financial transactions`)
      } catch (error) {
        logError('Failed to load financial transactions', error)
        this.showToast('Failed to load financial data', 'error')
      } finally {
        this.loading = false
      }
    },
    
    editIncome(income) {
      this.editingIncome = income
      this.incomeForm = {
        amount: income.amount,
        reason: income.reason,
        date: income.date.toDate ? income.date.toDate().toISOString().split('T')[0] : income.date
      }
      this.showEditIncomeModal = true
    },
    
    editExpense(expense) {
      this.editingExpense = expense
      this.expenseForm = {
        amount: expense.amount,
        reason: expense.reason,
        date: expense.date.toDate ? expense.date.toDate().toISOString().split('T')[0] : expense.date
      }
      this.showEditExpenseModal = true
    },
    
    async saveIncome() {
      try {
        this.saving = true
        log('Saving income data', this.incomeForm)
        
        if (!this.incomeForm.amount || !this.incomeForm.reason || !this.incomeForm.date) {
          logWarning('Form validation failed - missing required fields')
          this.showToast('Please fill in all required fields', 'error')
          return
        }
        
        const incomeData = {
          amount: parseFloat(this.incomeForm.amount),
          reason: this.incomeForm.reason.trim(),
          date: new Date(this.incomeForm.date),
          type: CONSTANTS.EXPENSE_TYPES.INCOME
        }
        
        if (this.showAddIncomeModal) {
          await financeService.createIncome(incomeData)
          logSuccess(`Income created successfully: Rs. ${incomeData.amount}`)
          this.showToast('Income added successfully', 'success')
        } else {
          await financeService.updateTransaction(this.editingIncome.id, incomeData)
          logSuccess(`Income updated successfully: Rs. ${incomeData.amount}`)
          this.showToast('Income updated successfully', 'success')
        }
        
        this.closeModal()
        await this.loadTransactions()
        
      } catch (error) {
        logError('Error saving income', error)
        this.showToast('Failed to save income', 'error')
      } finally {
        this.saving = false
      }
    },
    
    async saveExpense() {
      try {
        this.saving = true
        log('Saving expense data', this.expenseForm)
        
        if (!this.expenseForm.amount || !this.expenseForm.reason || !this.expenseForm.date) {
          logWarning('Form validation failed - missing required fields')
          this.showToast('Please fill in all required fields', 'error')
          return
        }
        
        const expenseData = {
          amount: parseFloat(this.expenseForm.amount),
          reason: this.expenseForm.reason.trim(),
          date: new Date(this.expenseForm.date),
          type: CONSTANTS.EXPENSE_TYPES.EXPENSE
        }
        
        if (this.showAddExpenseModal) {
          await financeService.createExpense(expenseData)
          logSuccess(`Expense created successfully: Rs. ${expenseData.amount}`)
          this.showToast('Expense added successfully', 'success')
        } else {
          await financeService.updateTransaction(this.editingExpense.id, expenseData)
          logSuccess(`Expense updated successfully: Rs. ${expenseData.amount}`)
          this.showToast('Expense updated successfully', 'success')
        }
        
        this.closeModal()
        await this.loadTransactions()
        
      } catch (error) {
        logError('Error saving expense', error)
        this.showToast('Failed to save expense', 'error')
      } finally {
        this.saving = false
      }
    },
    
    async deleteExpense(expense) {
      if (!confirm(`Are you sure you want to delete this expense?\n\nAmount: Rs. ${expense.amount}\nReason: ${expense.reason}`)) {
        return
      }
      
      try {
        log(`Deleting expense: Rs. ${expense.amount} - ${expense.reason}`)
        await financeService.deleteExpense(expense.id)
        logSuccess(`Expense deleted successfully: Rs. ${expense.amount}`)
        this.showToast('Expense deleted successfully', 'success')
        await this.loadTransactions()
      } catch (error) {
        logError('Error deleting expense', error)
        this.showToast('Failed to delete expense', 'error')
      }
    },
    
    closeModal() {
      this.showAddIncomeModal = false
      this.showEditIncomeModal = false
      this.showAddExpenseModal = false
      this.showEditExpenseModal = false
      this.editingIncome = null
      this.editingExpense = null
      this.incomeForm = {
        amount: '',
        reason: '',
        date: getTodayDate()
      }
      this.expenseForm = {
        amount: '',
        reason: '',
        date: getTodayDate()
      }
    },
    
    formatDate(date) {
      const dateObj = date.toDate ? date.toDate() : new Date(date)
      return dateObj.toLocaleDateString('en-GB', {
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
.finance-page {
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

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.finance-summary {
  margin-bottom: 24px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-card.income .card-icon {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.summary-card.expense .card-icon {
  background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
}

.summary-card.balance .card-icon {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
}

.summary-card.balance.negative .card-icon {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.card-content h3 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.card-content p {
  color: #6c757d;
  font-weight: 600;
  margin-bottom: 4px;
}

.card-content small {
  color: #adb5bd;
  font-size: 12px;
}

.finance-tabs {
  margin-bottom: 24px;
}

.tabs-header {
  background: white;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  overflow: hidden;
}

.tab-button {
  flex: 1;
  padding: 16px 20px;
  border: none;
  background: transparent;
  color: #6c757d;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-button:hover {
  background: #f8f9fa;
}

.tab-button.active {
  background: #1e40af;
  color: white;
}

.tab-content {
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-height: 300px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
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

.transactions-grid {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-card {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.transaction-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.transaction-card.income {
  border-left-color: #28a745;
}

.transaction-card.expense {
  border-left-color: #dc3545;
}

.transaction-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.transaction-card.income .transaction-icon {
  background: #28a745;
}

.transaction-card.expense .transaction-icon {
  background: #dc3545;
}

.transaction-info {
  flex: 1;
}

.transaction-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #2c3e50;
}

.transaction-date {
  margin: 0;
  font-size: 12px;
  color: #6c757d;
}

.transaction-amount {
  text-align: right;
}

.amount {
  font-size: 18px;
  font-weight: 700;
}

.transaction-card.income .amount {
  color: #28a745;
}

.transaction-card.expense .amount {
  color: #dc3545;
}

.transaction-actions {
  padding: 12px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.finance-chart {
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.chart-placeholder {
  display: flex;
  justify-content: center;
  align-items: end;
  height: 250px;
  padding: 20px;
}

.chart-bars {
  display: flex;
  gap: 40px;
  align-items: end;
}

.chart-bar {
  width: 80px;
  border-radius: 4px 4px 0 0;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
  transition: all 0.3s ease;
}

.chart-bar.income {
  background: linear-gradient(to top, #28a745, #20c997);
}

.chart-bar.expense {
  background: linear-gradient(to top, #dc3545, #fd7e14);
}

.bar-label {
  position: absolute;
  bottom: -30px;
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
}

.bar-value {
  position: absolute;
  top: -25px;
  font-size: 10px;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
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
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .tabs-header {
    flex-direction: column;
  }
  
  .chart-bars {
    gap: 20px;
  }
  
  .chart-bar {
    width: 60px;
  }
  
  .bottom-nav {
    display: flex;
  }
}

@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
  
  .finance-page {
    padding-bottom: 0;
  }
}
</style>
