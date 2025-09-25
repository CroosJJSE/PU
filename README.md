# Pesalai Undergraduates Admin Webapp

A comprehensive Vue.js-based admin webapp for managing student data, class attendance, exam management, finance tracking, and report generation for Pesalai Undergraduates.

## 🚀 Features

- **Mobile-First Design**: Optimized for mobile devices with touch-friendly UI
- **Student Management**: Add, edit, delete, and search students by batch
- **Class Attendance**: Swipe-based attendance marking with visual feedback
- **Exam Management**: Create exams, manage attendance, and track marks
- **Finance Tracking**: Monitor income from exams and track expenses
- **PDF Reports**: Generate professional exam result reports
- **Real-time Dashboard**: Overview of key metrics and quick actions

## 🏗️ Tech Stack

- **Frontend**: Vue.js 3, Vue Router 4
- **Backend**: Firebase Firestore
- **Styling**: Custom CSS with mobile-first responsive design
- **Icons**: Font Awesome
- **PDF Generation**: jsPDF with autoTable
- **Build Tool**: Vite
- **Hosting**: Firebase Hosting

## 📱 Mobile Features

- **Swipe Gestures**: Swipe right for present, left for absent
- **Touch-Friendly**: Minimum 44px touch targets
- **Responsive Design**: Adapts to all screen sizes
- **Bottom Navigation**: Easy thumb navigation on mobile
- **PWA Ready**: Can be installed as a mobile app

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pesalai-undergraduates-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Firebase Hosting
   - Update `src/config/database.js` with your Firebase configuration

4. **Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

5. **Build for Production**
   ```bash
   npm run build
   ```

6. **Deploy to Firebase**
   ```bash
   npm run deploy
   ```

## 🔐 Authentication

The app uses simple password-based authentication:
- **Default Password**: `pesalai2025`
- Password can be changed in `src/config/database.js` (CONSTANTS.ADMIN_PASSWORD)

## 📊 Database Structure

### Collections

- **students**: Student information (indexNo, name, gender, parentPhone, batch)
- **classAttendance**: Daily class attendance records
- **exams**: Exam details and attendance data
- **marks**: Student marks for completed exams
- **expenses**: Financial transactions (income/expenses)

### Firestore Rules

For development, use these rules (update for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Development mode
    }
  }
}
```

## 🎯 Usage Guide

### 1. Student Management (`/students`)
- Add new students with index number, name, gender, phone, and batch
- Search and filter students by batch or name
- Edit or delete existing students

### 2. Class Attendance (`/attendance`)
- Select batch and date
- Use swipe gestures or buttons to mark attendance
- View attendance summary and save to database

### 3. Exam Management (`/exams`)
- Create exams with subject, batch, date, and fee
- Take attendance during exams
- Close exams to calculate income
- Update marks for completed exams

### 4. Finance Tracking (`/finance`)
- View income from completed exams
- Add and manage expenses
- Monitor current balance and financial overview

### 5. Reports & Marks (`/reports`)
- Select completed exams
- Enter marks for attended students
- Generate PDF reports with exam results
- View performance statistics

## 🎨 Customization

### Colors and Branding
Update the color scheme in `src/style.css`:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  /* Add more custom properties */
}
```

### App Configuration
Modify constants in `src/config/database.js`:
```javascript
export const CONSTANTS = {
  ADMIN_PASSWORD: 'your-password',
  APP_NAME: 'Your App Name',
  APP_SLOGAN: 'Your Slogan'
  // ... other constants
}
```

## 📱 PWA Features

The app includes Progressive Web App features:
- Installable on mobile devices
- Offline-ready structure
- App-like experience
- Custom splash screen

## 🔄 URL Structure

- `/` - Login page
- `/dashboard` - Main dashboard
- `/students` - Student management
- `/attendance` - Class attendance
- `/exams` - Exam management
- `/finance` - Finance tracking
- `/reports` - Reports and marks

## 🚀 Deployment

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

## 🔧 Development

### Project Structure
```
src/
├── components/          # Vue components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── students/       # Student management
│   ├── attendance/     # Attendance components
│   ├── exams/          # Exam management
│   ├── finance/        # Finance components
│   └── reports/        # Reports components
├── config/             # Configuration files
├── services/           # Firebase services
├── router/             # Vue Router setup
├── style.css          # Global styles
└── main.js            # App entry point
```

### Key Files
- `src/config/database.js` - Firebase config and constants
- `src/services/firestore.js` - Database service functions
- `src/router/index.js` - Route definitions
- `src/style.css` - Global styles and mobile-first CSS

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile devices
5. Submit a pull request

## 📞 Support

For technical support or feature requests, contact the development team.

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready

