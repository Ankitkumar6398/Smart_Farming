# MongoDB Troubleshooting Guide

If data is not showing up in MongoDB, follow these steps:

## 1. Check if MongoDB is Running

### Windows:
```bash
# Check if MongoDB service is running
net start MongoDB

# Or start MongoDB manually
mongod
```

### Mac/Linux:
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

## 2. Verify Backend Server is Running

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (if not done):
   ```bash
   npm install
   ```

3. Create `.env` file in backend directory:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/smart_farming
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

5. Check the console output. You should see:
   - ✅ MongoDB connected successfully
   - 🚀 Server is running on port 5000

## 3. Test Database Connection

Visit these URLs in your browser or use Postman:

- **Health Check**: `http://localhost:5000/api/health`
  - Should show database status as "connected"

- **Database Info**: `http://localhost:5000/api/test/db`
  - Shows database connection details

- **List Users**: `http://localhost:5000/api/test/users`
  - Shows all registered users (for debugging)

## 4. Check MongoDB Database

### Using MongoDB Shell:
```bash
# Connect to MongoDB
mongosh

# Or if using older version:
mongo

# Switch to your database
use smart_farming

# List collections
show collections

# View users
db.users.find().pretty()
```

### Using MongoDB Compass (GUI):
1. Download MongoDB Compass from https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Navigate to `smart_farming` database
4. Check the `users` collection

## 5. Common Issues

### Issue: "MongoDB connection error"
**Solution**: 
- Make sure MongoDB is installed and running
- Check if port 27017 is available
- Verify MONGO_URI in .env file

### Issue: "Cannot connect to MongoDB"
**Solution**:
- Try: `mongodb://127.0.0.1:27017/smart_farming` instead of `localhost`
- Check firewall settings
- Verify MongoDB service is running

### Issue: "Data saves but doesn't appear"
**Solution**:
- Check if you're looking at the correct database name
- Verify collection name is `users` (Mongoose pluralizes model names)
- Try refreshing MongoDB Compass or reconnecting

### Issue: "Validation errors"
**Solution**:
- Check console logs for specific error messages
- Ensure all required fields are provided
- Verify email format is correct
- Password must be at least 6 characters

## 6. Using MongoDB Atlas (Cloud)

If using MongoDB Atlas:

1. Get your connection string from Atlas dashboard
2. Update `.env` file:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_farming
   ```
3. Make sure your IP is whitelisted in Atlas Network Access
4. Check Atlas dashboard to see if data is being saved

## 7. Debug Steps

1. **Check server logs** when registering:
   - Look for "User saved successfully" message
   - Check for any error messages

2. **Test registration endpoint**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123","confirmPassword":"password123"}'
   ```

3. **Check browser console** (F12) for frontend errors

4. **Check Network tab** in browser DevTools:
   - Verify API calls are being made
   - Check response status codes
   - Look at response data

## 8. Verify Data is Saved

After registering a user:

1. Check server console for: "User saved successfully: [user_id]"
2. Visit: `http://localhost:5000/api/test/users`
3. Check MongoDB directly using mongosh or Compass

If you still have issues, check the server console logs for detailed error messages.

