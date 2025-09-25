# Deployment Guide - Pesalai Undergraduates Admin Webapp

## íº€ Quick Deployment

### Prerequisites
- Node.js (v16 or higher)
- Firebase CLI installed globally
- Firebase project set up

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Firebase Setup
```bash
# Login to Firebase
npm run firebase:login

# Initialize Firebase (if not already done)
npm run firebase:init
```

### Step 3: Deploy Everything
```bash
# Deploy hosting and Firestore rules/indexes
npm run deploy:all
```

## í³Š New Database Structure

### Students Collection
- **Document ID**: Student Index Number (e.g., "6327")
- **Fields**:
  - `indexNo`: String (unique identifier)
  - `name`: String (student name)
  - `gender`: String ("M" or "F")
  - `parentPhone`: String (parent's phone)
  - `batch`: String ("26AL" or "27AL")
  - `attendanceList`: Array of dates when student was present
  - `examRecords`: Map of examId -> {fee, mark, examDate}

### Class Attendance Collection
- **Document ID**: Batch (e.g., "26AL", "27AL")
- **Fields**: 
  - `YYYY-MM-DD`: Array of student IDs who were present on that date

### Exams Collection
- **Document ID**: Exam ID (e.g., "26AL_mathematics_15092025")
- **Fields**:
  - `subject`: String (exam subject)
  - `batch`: String (target batch)
  - `date`: String (YYYY-MM-DD format)
  - `fee`: Number (exam fee)
  - `status`: String ("upcoming", "active", "completed")
  - `totalIncome`: Number (total income from exam)
  - `completedAt`: Timestamp (when exam was completed)
  - `studentRecords`: Map of studentId -> {fee, mark}

### Expenses Collection
- **Document ID**: Auto-generated
- **Fields**:
  - `amount`: Number (amount)
  - `reason`: String (description)
  - `date`: Timestamp (transaction date)
  - `type`: String ("income" or "expense")

## í´§ Console Logging

The system now includes comprehensive logging throughout:

- **log()**: General information logging
- **logSuccess()**: Success operations logging
- **logWarning()**: Warning messages logging
- **logError()**: Error logging with stack traces

All logs include timestamps and are prefixed with log levels for easy debugging.

## í³± Testing the System

### 1. Test Student Management
- Add a new student with index number
- Verify student document is created with correct ID
- Check console logs for operation confirmation

### 2. Test Class Attendance
- Select batch and date
- Mark attendance for students
- Verify attendance is saved in batch document
- Check individual student attendance lists are updated

### 3. Test Exam Management
- Create a new exam
- Take attendance during exam
- Close exam and verify income calculation
- Check student exam records are updated

### 4. Test Reports
- Add marks for completed exams
- Generate PDF reports
- Verify report contains correct data

## í°› Debugging

### Check Console Logs
All operations are logged with timestamps. Look for:
- `[SUCCESS]` - Operations completed successfully
- `[WARNING]` - Potential issues or validation failures
- `[ERROR]` - Errors that need attention

### Common Issues
1. **Firebase Connection**: Check Firebase config in `src/config/database.js`
2. **Date Format**: All dates use YYYY-MM-DD format consistently
3. **Student ID**: Student documents use index number as document ID
4. **Exam ID**: Exam documents use format `batch_subject_date`

## í´„ Data Migration

If migrating from old structure:
1. Export existing data
2. Transform data to new structure
3. Import using Firebase console or scripts
4. Test all functionality

## ï¿½ï¿½ Support

For issues or questions:
1. Check console logs first
2. Verify Firebase project configuration
3. Test with sample data
4. Contact development team

---

**Last Updated**: January 2025
**Version**: 2.0.0 (Updated Database Structure)
