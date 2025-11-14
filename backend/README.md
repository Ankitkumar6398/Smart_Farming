# Smart Farming Backend API

Backend API for the Smart Farming application with user authentication.

## Features

- User Registration
- User Login
- JWT-based Authentication
- Password Hashing with bcrypt
- MongoDB Database

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and update the following:
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: A random secret key for JWT tokens
- `PORT`: Server port (default: 5000)

### 3. MongoDB Setup

Make sure MongoDB is running on your system:

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Default connection: `mongodb://localhost:27017/smart_farming`

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and get your connection string
- Update `MONGO_URI` in `.env`

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

#### Login User
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

## Protected Routes

To protect a route, use the `authenticate` middleware:

```javascript
const authenticate = require('./middleware/auth');

router.get('/protected', authenticate, (req, res) => {
  res.json({ user: req.user });
});
```

Include the token in the request header:
```
Authorization: Bearer <your-jwt-token>
```

## Frontend Integration

Update your frontend Login and Register components to call these APIs:

**Example for Login:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();
// Store token in localStorage
localStorage.setItem('token', data.token);
```

**Example for Register:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name, email, password, confirmPassword }),
});

const data = await response.json();
// Store token in localStorage
localStorage.setItem('token', data.token);
```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **dotenv**: Environment variables
- **cors**: Cross-origin resource sharing
- **express-validator**: Input validation

