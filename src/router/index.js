import { createRouter, createWebHistory } from 'vue-router'
import { CONSTANTS } from '../config/database.js'

// Import components
import Login from '../components/auth/Login.vue'
import Dashboard from '../components/dashboard/Dashboard.vue'
import Students from '../components/students/Students.vue'
import Classes from '../components/classes/Classes.vue'
import Attendance from '../components/attendance/Attendance.vue'
import Exams from '../components/exams/Exams.vue'
import Finance from '../components/finance/Finance.vue'
import Reports from '../components/reports/Reports.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/students',
    name: 'Students',
    component: Students,
    meta: { requiresAuth: true }
  },
  {
    path: '/classes',
    name: 'Classes',
    component: Classes,
    meta: { requiresAuth: true }
  },
  {
    path: '/attendance',
    name: 'Attendance',
    component: Attendance,
    meta: { requiresAuth: true }
  },
  {
    path: '/exams',
    name: 'Exams',
    component: Exams,
    meta: { requiresAuth: true }
  },
  {
    path: '/finance',
    name: 'Finance',
    component: Finance,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('pesalai_auth') === CONSTANTS.ADMIN_PASSWORD
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
  } else if (to.name === 'Login' && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
