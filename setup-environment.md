# Environment Setup Guide

## Step 1: Create Environment File

Create a `.env.local` file in your project root with the following content:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/assessment-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=development
```

## Step 2: Start MongoDB

### Windows:
```cmd
net start MongoDB
```

### macOS:
```bash
brew services start mongodb-community
```

### Linux:
```bash
sudo systemctl start mongod
```

## Step 3: Test Database Connection

1. Start your Next.js application:
```bash
npm run dev
```

2. Visit these URLs to test:
- Database connection: `http://localhost:3000/api/debug/test-connection`
- Check existing users: `http://localhost:3000/api/debug/users`
- Setup database indexes: `http://localhost:3000/api/debug/setup-db`

## Step 4: Create a Test User

If no users exist, you can:

1. **Use the Register form** on the website to create a new account
2. **Or create a test user via API** (see below)

## Step 5: Test Login

Try logging in with your created user credentials.

## Troubleshooting

### If you get 401 errors:

1. **Check MongoDB is running**: Visit `/api/debug/test-connection`
2. **Check if users exist**: Visit `/api/debug/users`
3. **Check console logs**: Look at your terminal for detailed error messages
4. **Verify environment variables**: Make sure `.env.local` exists and has correct values

### Common Issues:

- **MongoDB not running**: Start MongoDB service
- **No users in database**: Register a new user first
- **Wrong credentials**: Double-check username/password
- **Environment variables missing**: Create `.env.local` file
