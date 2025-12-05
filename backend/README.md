# Smart Farming Backend

Backend server for the Smart Farming application with MongoDB connection.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
# MongoDB Connection String
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/smart-farming

# For MongoDB Atlas (cloud):
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-farming

# Server Port
PORT=5000

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Market API Configuration (for real-time market prices)
MARKET_API_KEY=579b464db66ec23bdd0000017e0bf52cad4d402f5c50c5bd578f6f93
MARKET_API_BASE_URL=https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

- **Local MongoDB**: Start MongoDB service on your machine
- **MongoDB Atlas**: Use the connection string from your Atlas cluster

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Public Endpoints
- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint (shows server and database status)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Protected Endpoints (require authentication token)
- `GET /api/auth/me` - Get current logged in user
- `GET /api/user/me` - Get user profile
- `PUT /api/user/me` - Update user profile

## MongoDB Connection

The MongoDB connection is configured in `config/db.js` and automatically connects when the server starts. The connection uses Mongoose ODM for MongoDB.

## Project Structure

```
backend/
├── config/
│   └── db.js          # MongoDB connection configuration
├── models/
│   └── User.js        # User model/schema
├── middleware/
│   └── auth.js        # Authentication middleware
├── routes/
│   ├── auth.js        # Authentication routes (register, login)
│   └── user.js        # User routes (profile)
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
└── .env               # Environment variables (create this file)
```

