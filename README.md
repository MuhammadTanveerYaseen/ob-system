# Assessment Management System

A comprehensive Next.js application for teachers to manage assessments with Excel-style dashboards. Built with modern web technologies and a responsive design.

## Features

### 🔐 **Secure Authentication System**
- JWT-based authentication with secure login/registration
- Role-based access control (Admin, Faculty, HOD, Student)
- Secure password hashing with bcrypt
- Protected API endpoints with middleware

### 🎯 **Role-Based Dashboards**
- **Admin Dashboard**: User management, system administration
- **Faculty Dashboard**: Assessment creation, management, and grading
- **HOD Dashboard**: Report validation and approval workflow
- **Student Dashboard**: View individual results and progress

### 🎯 **Teacher Sheets Management**
- Create multiple assessment sheets (Quiz 1, Assignment 1, Project, etc.)
- Each sheet is saved in MongoDB for persistence
- Clean, organized interface for managing multiple assessments

### 📊 **Dynamic Assessment Tables**
- **Columns**: Student Roll Number, Student Name, Questions (dynamic), CLOs (dynamic), PLOS (dynamic), Total Marks
- **Rows**: Students (add/remove dynamically)
- **Auto-calculation**: Total marks automatically calculated for each student

### 🔧 **Dynamic Content Management**
- Add/remove questions dynamically
- Add/remove CLOs (Course Learning Outcomes) dynamically
- Add/remove PLOS (Program Learning Outcomes) dynamically
- Add/remove students dynamically
- Real-time updates and calculations
- Student access to individual assessment data

### 💾 **Data Persistence**
- MongoDB integration for reliable data storage
- Automatic saving of all changes
- Data persists across sessions

### 📤 **Export Functionality**
- Export assessment sheets to CSV format
- Compatible with Excel and other spreadsheet applications
- Includes all student data, marks, and totals

### 🎨 **Rich UI & Responsive Design**
- Modern, clean interface built with Tailwind CSS
- Fully responsive design for all devices
- Confirmation dialogs for important actions
- Smooth animations and transitions

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Export**: CSV generation for Excel compatibility

## Prerequisites

Before running this application, ensure you have:

1. **Node.js** (v18 or higher)
2. **MongoDB** running locally on your machine
3. **npm** or **yarn** package manager

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd ob-system
npm install
```

### 2. MongoDB Setup

Make sure MongoDB is running on your local machine:

```bash
# Start MongoDB (Windows)
net start MongoDB

# Start MongoDB (macOS/Linux)
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/assessment-system
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage Guide

### Creating Your First Assessment Sheet

1. **Launch the Application**: Open your browser and navigate to `http://localhost:3000`
2. **Create New Sheet**: Click the "Create New Sheet" button in the sidebar
3. **Name Your Sheet**: Enter a descriptive name (e.g., "Quiz 1 - Introduction to Programming")
4. **Start Building**: Your new sheet will be created and automatically selected

### Authentication & Access

1. **User Registration**: Create accounts with role-based access
   - Choose your role: Admin, Faculty, HOD, or Student
   - Students can optionally provide roll numbers
   - All users can specify departments

2. **Secure Login**: Access your role-specific dashboard
   - Use username/email and password
   - JWT tokens provide secure session management
   - Automatic logout on token expiration

### Adding Questions, CLOs, and PLOS

1. **Add Questions**: Use the "Add Questions" section to add assessment questions
   - Type your question text
   - Click "Add" to include it in the assessment
2. **Add CLOs**: Use the "Add CLOs" section to add Course Learning Outcomes
   - Type the CLO description
   - Click "Add" to include it
3. **Add PLOS**: Use the "Add PLOS" section to add Program Learning Outcomes
   - Type the PLO description
   - Click "Add" to include it

### Student Access Feature

1. **Access Student Data**: Use the "Student Access" section to view individual student assessment data
   - Enter either Roll Number or Student Name (both are optional)
   - Click "Access Student Data" to view the student's marks
   - View detailed breakdown of questions, CLOs, PLOS, and total marks
   - Perfect for students to check their own progress or teachers to review individual performance

### Managing Students

1. **Add Students**: Use the "Add Student" section
   - Enter Roll Number and Student Name
   - Click "Add Student" to include them
2. **Edit Student Info**: Click on any student field to edit directly
3. **Remove Students**: Use the "Remove" button in the Actions column

### Entering Marks

1. **Question Marks**: Click on any question cell to enter marks
2. **CLO Marks**: Click on any CLO cell to enter marks
3. **PLO Marks**: Click on any PLO cell to enter marks
4. **Auto-calculation**: Total marks are automatically calculated and displayed
5. **Real-time Updates**: All changes are saved automatically

### Exporting Data

1. **Export to CSV**: Click the "Export to CSV" button
2. **File Download**: A CSV file will be downloaded with your assessment data
3. **Excel Compatibility**: Open the CSV file in Excel or any spreadsheet application

### Managing Multiple Sheets

1. **Switch Between Sheets**: Use the sidebar to navigate between different assessment sheets
2. **Create Additional Sheets**: Use "Create New Sheet" for new assessments
3. **Delete Sheets**: Use the "Delete Sheet" button (with confirmation dialog)

## Project Structure

```
ob-system/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── sheets/        # Assessment sheet endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/             # React components
│   ├── AssessmentSheet.tsx    # Main assessment table
│   ├── ConfirmationDialog.tsx # Confirmation dialogs
│   ├── CreateSheetModal.tsx   # New sheet creation
│   ├── Dashboard.tsx          # Main dashboard
│   └── Sidebar.tsx            # Navigation sidebar
├── lib/                   # Utility libraries
│   └── mongodb.ts         # Database connection
├── models/                # MongoDB models
│   └── Sheet.ts           # Assessment sheet schema
└── package.json           # Dependencies and scripts
```

## API Endpoints

### Sheets Management
- `GET /api/sheets` - Fetch all assessment sheets
- `POST /api/sheets` - Create a new assessment sheet
- `GET /api/sheets/[id]` - Fetch a specific sheet
- `PUT /api/sheets/[id]` - Update a sheet
- `DELETE /api/sheets/[id]` - Delete a sheet

## Database Schema

### Sheet Model
```typescript
interface Sheet {
  _id: string;
  name: string;
  questions: string[];
  clos: string[];
  plos: string[];
  students: Student[];
  createdAt: Date;
  updatedAt: Date;
}

interface Student {
  rollNumber: string;
  name: string;
  marks: Map<string, number>;
  totalMarks: number;
}
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally
   - Check the connection string in `.env.local`
   - Verify MongoDB is accessible on port 27017

2. **Build Errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

3. **Runtime Errors**
   - Check browser console for error messages
   - Verify all environment variables are set correctly

### Performance Tips

1. **Large Datasets**: For assessments with many students, consider pagination
2. **Real-time Updates**: The application saves automatically, but you can add manual save buttons
3. **Export Optimization**: Large exports are processed client-side for better performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the API documentation

---

**Built with ❤️ using Next.js, React, and MongoDB**
# ob-system
