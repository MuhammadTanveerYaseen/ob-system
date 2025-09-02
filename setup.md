# Quick Setup Guide

## MongoDB Setup

### Windows
1. **Install MongoDB Community Server** from [mongodb.com](https://www.mongodb.com/try/download/community)
2. **Start MongoDB Service**:
   ```cmd
   net start MongoDB
   ```
3. **Verify Installation**:
   ```cmd
   mongosh
   ```

### macOS
1. **Install with Homebrew**:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```
2. **Start MongoDB**:
   ```bash
   brew services start mongodb-community
   ```
3. **Verify Installation**:
   ```bash
   mongosh
   ```

### Linux (Ubuntu/Debian)
1. **Install MongoDB**:
   ```bash
   sudo apt update
   sudo apt install mongodb
   ```
2. **Start MongoDB**:
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```
3. **Verify Installation**:
   ```bash
   mongosh
   ```

## Environment Setup

1. **Create `.env.local` file** in the project root:
   ```env
   MONGODB_URI=mongodb://localhost:27017/assessment-system
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Application**:
   ```bash
   npm run dev
   ```

## First Run

1. Open `http://localhost:3000` in your browser
2. Click "Create New Sheet" to create your first assessment
3. Add questions, CLOs, and students
4. Start entering marks!

## Troubleshooting

- **MongoDB Connection Error**: Ensure MongoDB is running and accessible on port 27017
- **Port Already in Use**: Change the port in `package.json` scripts or kill the process using the port
- **Build Errors**: Clear `node_modules` and reinstall dependencies

## Need Help?

Check the main README.md for detailed documentation and troubleshooting tips.

