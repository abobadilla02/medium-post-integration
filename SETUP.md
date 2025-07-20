# Setup Guide for Medium Scheduler

This guide will help you set up the Medium Scheduler application from scratch.

## Prerequisites Installation

### 1. Install Node.js

**Windows:**
1. Go to [Node.js official website](https://nodejs.org/)
2. Download the LTS version (recommended)
3. Run the installer and follow the setup wizard
4. Verify installation by opening a new terminal and running:
   ```bash
   node --version
   npm --version
   ```

**macOS:**
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install MongoDB

**Windows:**
1. Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Download MongoDB Community Server
3. Run the installer and follow the setup wizard
4. Start MongoDB service:
   ```bash
   # MongoDB should start automatically as a Windows service
   # Or manually start it:
   net start MongoDB
   ```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Reload package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. Get Medium API Token

1. Go to [Medium Settings](https://medium.com/me/settings)
2. Navigate to "Integration tokens" section
3. Click "Get integration token"
4. Enter a description (e.g., "Medium Scheduler App")
5. Copy the generated token (you'll need this later)

## Project Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to your project directory
cd buffertest

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Return to root
cd ..
```

### 2. Environment Configuration

```bash
# Copy environment template
cp backend/env.example backend/.env

# Edit the .env file with your settings
# Use your preferred text editor (VS Code, Notepad++, etc.)
```

Edit `backend/.env` with your configuration:
```env
# MongoDB Connection (use your MongoDB URI)
MONGODB_URI=mongodb://localhost:27017/medium-scheduler

# Server Configuration
PORT=4000
NODE_ENV=development

# Medium API Configuration (use your token from step 3)
MEDIUM_API_TOKEN=your_medium_api_token_here

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Start the Application

**Option 1: Start both frontend and backend together**
```bash
npm run dev
```

**Option 2: Start them separately**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### 4. Verify Installation

1. **Backend**: Visit `http://localhost:4000/graphql` - you should see the GraphQL Playground
2. **Frontend**: Visit `http://localhost:3000` - you should see the Medium Scheduler app
3. **Health Check**: Visit `http://localhost:4000/health` - should return `{"status":"OK"}`

## Troubleshooting

### Common Issues

**1. "npm is not recognized"**
- Node.js is not installed or not in PATH
- Restart your terminal after installing Node.js
- On Windows, you may need to restart your computer

**2. "MongoDB connection failed"**
- MongoDB is not running
- Check if MongoDB service is started
- Verify the connection string in `.env`

**3. "Port already in use"**
- Another application is using the port
- Change the port in `.env` file
- Or kill the process using the port

**4. "Medium API token invalid"**
- Verify your token is correct
- Check if the token has the necessary permissions
- Generate a new token if needed

### Development Tools

**VS Code Extensions (Recommended):**
- TypeScript and JavaScript Language Features
- GraphQL
- MongoDB for VS Code
- ES7+ React/Redux/React-Native snippets

**Useful Commands:**
```bash
# View logs
npm run dev:backend 2>&1 | tee backend.log

# Reset database (if needed)
# Connect to MongoDB and drop the database
mongo
use medium-scheduler
db.dropDatabase()
exit

# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :4000
```

## Next Steps

1. **Create your first post**: Use the form on the homepage
2. **Test scheduling**: Set a post for a few minutes in the future
3. **Monitor the process**: Check the backend logs for publishing activity
4. **Explore the API**: Use the GraphQL Playground at `http://localhost:4000/graphql`

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Check the console logs for error messages
4. Ensure MongoDB is running and accessible F