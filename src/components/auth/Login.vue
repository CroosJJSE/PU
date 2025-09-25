<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="/logo.svg" alt="Pesalai Undergraduates" class="logo" />
        <h1>{{ CONSTANTS.APP_NAME }}</h1>
        <p class="slogan">{{ CONSTANTS.APP_SLOGAN }}</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="password" class="form-label">Admin Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-control"
            placeholder="Enter admin password"
            required
            :disabled="loading"
          />
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary w-100"
          :disabled="loading || !password.trim()"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>Login</span>
        </button>
      </form>
      
      <div v-if="error" class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { CONSTANTS } from '../../config/database.js'
import { log, logError, logSuccess, logWarning } from '../../config/database.js'

export default {
  name: 'Login',
  data() {
    return {
      password: '',
      loading: false,
      error: '',
      CONSTANTS
    }
  },
  methods: {
    async handleLogin() {
      log('Login attempt started')
      this.loading = true
      this.error = ''
      
      try {
        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (this.password === CONSTANTS.ADMIN_PASSWORD) {
          logSuccess('Login successful')
          // Store authentication
          localStorage.setItem('pesalai_auth', this.password)
          
          // Show success message
          this.showToast('Login successful!', 'success')
          
          // Redirect to dashboard
          setTimeout(() => {
            this.$router.push('/dashboard')
          }, 1000)
        } else {
          logWarning('Login failed - invalid password')
          this.error = 'Invalid password. Please try again.'
          this.password = ''
        }
      } catch (err) {
        logError('Login error occurred', err)
        this.error = 'Login failed. Please try again.'
        console.error('Login error:', err)
      } finally {
        this.loading = false
      }
    },
    
    showToast(message, type = 'success') {
      // Create toast element
      const toast = document.createElement('div')
      toast.className = `toast ${type}`
      toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
          <span>${message}</span>
        </div>
      `
      
      document.body.appendChild(toast)
      
      // Remove toast after 3 seconds
      setTimeout(() => {
        toast.remove()
      }, 3000)
    }
  },
  
  mounted() {
    log('Login component mounted')
    // Check if already authenticated
    if (localStorage.getItem('pesalai_auth') === CONSTANTS.ADMIN_PASSWORD) {
      log('User already authenticated, redirecting to dashboard')
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 32px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-header {
  margin-bottom: 32px;
}

.logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
  border: 4px solid #f8f9fa;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.slogan {
  color: #6c757d;
  font-style: italic;
  font-size: 14px;
}

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
  text-align: left;
}

.form-control {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: white;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-control:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.btn {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-1px);
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px;
    margin: 16px;
  }
  
  .login-header h1 {
    font-size: 20px;
  }
  
  .logo {
    width: 60px;
    height: 60px;
  }
}
</style>
