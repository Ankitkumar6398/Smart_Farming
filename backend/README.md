# Smart Farming Backend - Component Documentation

यह document Smart Farming backend के सभी components के बारे में detailed explanation देता है।

---

## 📁 Project Structure

```
backend/
├── server.js              # Main entry point
├── config/
│   └── db.js             # MongoDB connection configuration
├── models/               # Database models (MongoDB schemas)
│   ├── User.js
│   ├── MarketPrice.js
│   └── Question.js
├── routes/              # API route handlers
│   ├── auth.js
│   ├── user.js
│   ├── market.js
│   ├── weather.js
│   ├── community.js
│   └── cropHealth.js
├── middleware/          # Custom middleware functions
│   └── auth.js
├── services/            # External API services
│   ├── marketApiService.js
│   └── weatherService.js
├── scripts/             # Utility scripts
│   ├── seedMarketData.js
│   ├── addStateDistrict.js
│   └── testApi.js
└── ai_service/          # Python AI service for crop health
    └── main.py
```

---

## 🚀 Main Server (`server.js`)

### Detailed Explanation:

**क्या करता है:**
- Express server को initialize करता है
- MongoDB database से connect करता है
- सभी routes को register करता है
- Middleware setup करता है (CORS, JSON parsing)

### Step-by-Step Execution Flow:

1. **Module Imports:**
   ```javascript
   const express = require("express");
   const cors = require("cors");
   const mongoose = require("mongoose");
   require("dotenv").config();
   const connectDB = require("./config/db");
   ```
   - Express: Web framework
   - CORS: Cross-origin requests allow करने के लिए
   - Mongoose: MongoDB ODM
   - dotenv: Environment variables load करने के लिए
   - connectDB: Database connection function

2. **Express App Initialization:**
   ```javascript
   const app = express();
   ```
   - नया Express application instance create होता है

3. **Database Connection:**
   ```javascript
   connectDB();
   ```
   - `connectDB()` function call होता है
   - MongoDB connection establish होता है
   - Connection error पर process exit होता है

4. **Middleware Setup:**
   ```javascript
   app.use(cors());                    // All origins allow
   app.use(express.json());            // JSON body parser
   app.use(express.urlencoded({ extended: true })); // URL-encoded parser
   ```
   - **CORS:** Frontend से requests allow करता है
   - **express.json():** Request body को JSON में parse करता है
   - **express.urlencoded():** Form data को parse करता है

5. **Root Route:**
   ```javascript
   app.get('/', (req, res) => {
     res.json({ message: 'Kishan Mitra API is running!' });
   });
   ```
   - Server status check के लिए

6. **Health Check Endpoint:**
   ```javascript
   app.get("/api/health", (req, res) => {
     res.json({
       status: "OK",
       message: "Server is running",
       database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
     });
   });
   ```
   - Server और database status return करता है
   - `readyState === 1` means connected

7. **Route Registration:**
   ```javascript
   app.use("/api/auth", require("./routes/auth"));
   app.use("/api/user", require("./routes/user"));
   app.use("/api/market", require("./routes/market"));
   app.use("/api/weather", require("./routes/weather"));
   app.use("/api/community", require("./routes/community"));
   app.use("/api/crop-health", require("./routes/cropHealth"));
   ```
   - हर route file को mount करता है
   - Prefix automatically add होता है

8. **Server Start:**
   ```javascript
   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
   });
   ```
   - PORT environment variable से या default 5000
   - Server listen करना start करता है

### Request Flow:
```
Client Request
    ↓
CORS Middleware (check origin)
    ↓
JSON Parser (parse body)
    ↓
Route Handler (process request)
    ↓
Response (JSON)
```

### Key Features:
- Port: 5000 (default)
- Health check endpoint: `/api/health`
- CORS enabled for frontend communication
- Automatic JSON parsing
- Error handling at route level

### Routes Registered:
- `/api/auth` - Authentication routes
- `/api/user` - User profile routes
- `/api/market` - Market price routes
- `/api/weather` - Weather data routes
- `/api/community` - Community Q&A routes
- `/api/crop-health` - Crop health AI routes

---

## 🗄️ Database Configuration (`config/db.js`)

### Detailed Explanation:

**क्या करता है:**
- MongoDB connection establish करता है
- Connection error handling करता है
- Environment variable से `MONGO_URI` read करता है

### Code Breakdown:

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Options for older Mongoose versions (not needed in v6+)
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Step-by-Step Execution:

1. **Function Definition:**
   - `connectDB` एक async function है
   - `await` use कर सकता है

2. **Connection Attempt:**
   ```javascript
   const conn = await mongoose.connect(process.env.MONGO_URI);
   ```
   - `process.env.MONGO_URI` से connection string read होता है
   - `mongoose.connect()` connection establish करता है
   - `await` connection complete होने तक wait करता है
   - Connection object return होता है

3. **Success Handling:**
   ```javascript
   console.log(`MongoDB Connected: ${conn.connection.host}`);
   ```
   - Connection successful होने पर host name log होता है

4. **Error Handling:**
   ```javascript
   catch (error) {
     console.error(`Error: ${error.message}`);
     process.exit(1);
   }
   ```
   - Error catch होता है
   - Error message log होता है
   - Process exit होता है (server start नहीं होगा)

### Connection States:
- `0` = disconnected
- `1` = connected
- `2` = connecting
- `3` = disconnecting

### Usage:
```javascript
const connectDB = require('./config/db');
connectDB(); // Connects to MongoDB
```

### Environment Variable:
```
MONGO_URI=mongodb://localhost:27017/smart-farming
```

### Connection Flow:
```
Server Start
    ↓
connectDB() called
    ↓
Read MONGO_URI from .env
    ↓
mongoose.connect() attempt
    ↓
Success? → Log connection → Continue
    ↓
Error? → Log error → Exit process
```

### Common Issues:
1. **MongoDB not running:** Connection refused error
2. **Wrong URI:** Authentication failed
3. **Network issues:** Timeout error
4. **Database doesn't exist:** Auto-created on first write

---

## 📊 Database Models

### 1. User Model (`models/User.js`)

### Detailed Explanation:

**Schema Fields:**
- `name` (String, required) - User का नाम
- `email` (String, required, unique) - Email address
- `password` (String, required, min 6 chars) - Hashed password
- `createdAt`, `updatedAt` (Auto-generated timestamps)

### Code Breakdown:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,  // Remove whitespace
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,  // Unique index
    lowercase: true,  // Convert to lowercase
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,  // Don't return password by default
  },
}, {
  timestamps: true,  // Auto-add createdAt, updatedAt
});
```

### Schema Field Details:

1. **name Field:**
   - Type: String
   - Required: Yes (with custom error message)
   - `trim: true` - Leading/trailing spaces remove होते हैं

2. **email Field:**
   - Type: String
   - Required: Yes
   - Unique: Database level unique constraint
   - Lowercase: Automatically convert होता है
   - Match: Regex validation for email format
   - Trim: Spaces remove होते हैं

3. **password Field:**
   - Type: String
   - Required: Yes
   - Minlength: Minimum 6 characters
   - `select: false` - Query में by default include नहीं होता

### Pre-Save Hook (Password Hashing):

```javascript
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();  // Skip if password not changed
  }
  const salt = await bcrypt.genSalt(10);  // Generate salt (10 rounds)
  this.password = await bcrypt.hash(this.password, salt);  // Hash password
  next();  // Continue save operation
});
```

**Execution Flow:**
1. User save होने से पहले hook trigger होता है
2. Check करता है password modified है या नहीं
3. Salt generate करता है (10 rounds = security level)
4. Password को salt के साथ hash करता है
5. Hashed password को assign करता है
6. Save operation continue होता है

**Why `isModified` check?**
- Password update होने पर ही hash करना है
- Other field updates पर hash नहीं करना

### Password Comparison Method:

```javascript
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

**How it works:**
1. `enteredPassword` (plain text) receive होता है
2. `this.password` (hashed) database से आता है
3. `bcrypt.compare()` दोनों को compare करता है
4. Boolean return होता है (true/false)

**Security:**
- Plain password कभी store नहीं होता
- Hash comparison secure है
- Timing attacks से protect है

### Model Export:

```javascript
module.exports = mongoose.model('User', userSchema);
```

- Model name: 'User'
- Collection name: 'users' (auto-pluralized)
- Schema: userSchema

### Usage Examples:

**Create User:**
```javascript
const user = await User.create({ 
  name: "John Doe", 
  email: "john@example.com", 
  password: "password123" 
});
// Password automatically hashed before save
```

**Find User (password excluded):**
```javascript
const user = await User.findOne({ email: "john@example.com" });
// user.password will be undefined (select: false)
```

**Find User (with password):**
```javascript
const user = await User.findOne({ email: "john@example.com" }).select('+password');
// user.password will be available
```

**Password Verification:**
```javascript
const user = await User.findOne({ email: "john@example.com" }).select('+password');
const isMatch = await user.matchPassword("password123");
// isMatch = true if correct, false otherwise
```

### Data Flow:

```
User.create({ name, email, password })
    ↓
Pre-save hook triggered
    ↓
Password hashed with bcrypt
    ↓
Hashed password saved
    ↓
User document created
    ↓
Timestamps added (createdAt, updatedAt)
```

### Security Features:
1. **Password Hashing:** bcrypt with salt rounds
2. **Password Exclusion:** Default query में password नहीं आता
3. **Email Validation:** Regex pattern check
4. **Unique Email:** Database constraint
5. **Min Length:** Password minimum 6 characters

---

### 2. MarketPrice Model (`models/MarketPrice.js`)

### Detailed Explanation:

**Schema Fields:**
- `crop` (String, required) - Crop का नाम
- `state` (String, required) - State name
- `district` (String, required) - District name
- `market` (String, required) - Market/Mandi name
- `price` (Number, required, min 0) - Price per unit
- `unit` (String, default: 'Quintal') - Unit (Quintal/Kg/Ton)
- `date` (Date, required) - Price date
- `lastUpdated` (Date) - Last update timestamp
- `source` (String) - Data source (manual/external_api/seed)

### Code Breakdown:

```javascript
const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: [true, 'Crop name is required'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
  },
  market: {
    type: String,
    required: [true, 'Market name is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,  // Price cannot be negative
  },
  unit: {
    type: String,
    default: 'Quintal',
    enum: ['Quintal', 'Kg', 'Ton'],  // Only these values allowed
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,  // Current date if not provided
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    enum: ['manual', 'external_api', 'seed'],
    default: 'manual',
  },
}, {
  timestamps: true,  // Adds createdAt, updatedAt
});
```

### Schema Field Details:

1. **crop Field:**
   - Type: String
   - Required: Yes
   - Trim: Spaces remove होते हैं
   - Example: "Wheat", "Rice", "Cotton"

2. **state Field:**
   - Type: String
   - Required: Yes
   - Trim: Spaces remove होते हैं
   - Example: "Punjab", "Haryana"

3. **district Field:**
   - Type: String
   - Required: Yes
   - Trim: Spaces remove होते हैं
   - Example: "Ludhiana", "Amritsar"

4. **market Field:**
   - Type: String
   - Required: Yes
   - Trim: Spaces remove होते हैं
   - Example: "Ludhiana Mandi"

5. **price Field:**
   - Type: Number
   - Required: Yes
   - Min: 0 (negative prices not allowed)
   - Example: 2420, 2850

6. **unit Field:**
   - Type: String
   - Default: 'Quintal'
   - Enum: Only 'Quintal', 'Kg', 'Ton' allowed
   - Invalid values rejected

7. **date Field:**
   - Type: Date
   - Required: Yes
   - Default: Current date/time
   - Stores date when price was recorded

8. **lastUpdated Field:**
   - Type: Date
   - Default: Current date/time
   - Tracks when record was last modified

9. **source Field:**
   - Type: String
   - Enum: 'manual', 'external_api', 'seed'
   - Default: 'manual'
   - Tracks data origin

### Database Indexes:

```javascript
marketPriceSchema.index({ state: 1, district: 1, date: -1 });
marketPriceSchema.index({ crop: 1, date: -1 });
```

**Index 1: `{ state: 1, district: 1, date: -1 }`**
- Purpose: Fast queries by location and date
- `1` = ascending order
- `-1` = descending order
- Use case: "Get prices for Punjab, Ludhiana, sorted by date (newest first)"
- Performance: Without index, full collection scan; with index, fast lookup

**Index 2: `{ crop: 1, date: -1 }`**
- Purpose: Fast queries by crop type
- Use case: "Get all Wheat prices, sorted by date"
- Performance: Efficient crop-based queries

**Why Indexes Matter:**
- Without indexes: O(n) - scan entire collection
- With indexes: O(log n) - binary search in index
- Large collections में huge performance difference

### Model Export:

```javascript
module.exports = mongoose.model('MarketPrice', marketPriceSchema);
```

- Model name: 'MarketPrice'
- Collection name: 'marketprices' (auto-pluralized)

### Usage Examples:

**Create Market Price:**
```javascript
const price = await MarketPrice.create({
  crop: "Wheat",
  state: "Punjab",
  district: "Ludhiana",
  market: "Ludhiana Mandi",
  price: 2420,
  unit: "Quintal",
  date: new Date('2024-01-15'),
  source: 'external_api'
});
```

**Query with Index (Fast):**
```javascript
// Uses index { state: 1, district: 1, date: -1 }
const prices = await MarketPrice.find({
  state: "Punjab",
  district: "Ludhiana"
}).sort({ date: -1 });
```

**Query by Crop (Fast):**
```javascript
// Uses index { crop: 1, date: -1 }
const wheatPrices = await MarketPrice.find({
  crop: "Wheat"
}).sort({ date: -1 });
```

**Get Distinct Values:**
```javascript
// Get all unique states
const states = await MarketPrice.distinct('state');

// Get districts for a state
const districts = await MarketPrice.distinct('district', {
  state: 'Punjab'
});
```

**Update Price:**
```javascript
const price = await MarketPrice.findOne({
  crop: "Wheat",
  state: "Punjab",
  district: "Ludhiana",
  market: "Ludhiana Mandi"
});
price.price = 2500;
price.lastUpdated = new Date();
await price.save();
```

### Data Flow:

```
MarketPrice.create({ crop, state, district, market, price })
    ↓
Validation (required fields, min values, enum)
    ↓
Default values applied (unit, date, lastUpdated, source)
    ↓
Indexes updated
    ↓
Document saved to 'marketprices' collection
    ↓
Timestamps added (createdAt, updatedAt)
```

### Query Optimization:

**Without Index:**
```
Query: Find prices for Punjab, Ludhiana
    ↓
Scan entire collection (1000+ documents)
    ↓
Filter matching documents
    ↓
Sort by date
    ↓
Return results (Slow: ~100ms+)
```

**With Index:**
```
Query: Find prices for Punjab, Ludhiana
    ↓
Use index { state: 1, district: 1, date: -1 }
    ↓
Direct lookup in index
    ↓
Return results (Fast: ~5ms)
```

### Common Queries:

1. **Get prices by location:**
   ```javascript
   MarketPrice.find({ state: "Punjab", district: "Ludhiana" })
   ```

2. **Get prices by crop:**
   ```javascript
   MarketPrice.find({ crop: "Wheat" })
   ```

3. **Get prices for specific date:**
   ```javascript
   const startOfDay = new Date('2024-01-15');
   startOfDay.setHours(0, 0, 0, 0);
   const endOfDay = new Date('2024-01-15');
   endOfDay.setHours(23, 59, 59, 999);
   MarketPrice.find({ date: { $gte: startOfDay, $lte: endOfDay } })
   ```

4. **Get distinct values:**
   ```javascript
   MarketPrice.distinct('state')
   MarketPrice.distinct('crop')
   MarketPrice.distinct('district', { state: 'Punjab' })
   ```

---

### 3. Question Model (`models/Question.js`)

### Detailed Explanation:

**Schema Structure:**
```
Question
├── user (ObjectId, ref: User) - Optional user reference
├── userName (String, required) - Display name
├── question (String, required) - Question text
├── answers[] - Array of answers
│   ├── user (ObjectId, ref: User)
│   ├── userName (String)
│   ├── answer (String)
│   └── replies[] - Array of replies
│       ├── user (ObjectId, ref: User)
│       ├── userName (String)
│       └── reply (String)
└── timestamps
```

### Code Breakdown:

**Reply Schema (Nested):**
```javascript
const replySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,  // Anonymous replies allowed
  },
  userName: {
    type: String,
    required: true,
  },
  reply: {
    type: String,
    required: [true, 'Please provide a reply'],
    trim: true,
  },
}, {
  timestamps: true,  // createdAt, updatedAt for each reply
});
```

**Answer Schema (Nested):**
```javascript
const answerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  userName: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: [true, 'Please provide an answer'],
    trim: true,
  },
  replies: [replySchema],  // Array of replies
}, {
  timestamps: true,  // createdAt, updatedAt for each answer
});
```

**Question Schema (Main):**
```javascript
const questionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,  // Anonymous questions allowed
  },
  userName: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
  },
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true,
  },
  answers: [answerSchema],  // Array of answers
}, {
  timestamps: true,
});

// Index for better query performance
questionSchema.index({ createdAt: -1 });  // Newest first
```

### Schema Details:

1. **Question Level:**
   - `user`: Optional reference to User model
   - `userName`: Display name (always required)
   - `question`: Question text
   - `answers`: Array of answer documents

2. **Answer Level:**
   - `user`: Optional reference to User model
   - `userName`: Display name
   - `answer`: Answer text
   - `replies`: Array of reply documents
   - Each answer has its own timestamps

3. **Reply Level:**
   - `user`: Optional reference to User model
   - `userName`: Display name
   - `reply`: Reply text
   - Each reply has its own timestamps

### Nested Structure Benefits:

1. **Data Organization:**
   - All related data in one document
   - No need for separate collections
   - Easy to fetch complete thread

2. **Performance:**
   - Single query gets everything
   - No joins needed
   - Faster than separate collections

3. **Atomicity:**
   - All operations on single document
   - Consistent data

### Usage Examples:

**Create Question:**
```javascript
const question = await Question.create({
  userName: "Farmer",
  question: "How to grow wheat?"
});
// user field is null (anonymous)
```

**Create Question (Logged In):**
```javascript
const question = await Question.create({
  user: req.user._id,  // From authenticated user
  userName: req.user.name,
  question: "How to grow wheat?"
});
```

**Add Answer:**
```javascript
const question = await Question.findById(questionId);
question.answers.push({
  userName: "Expert",
  answer: "Wheat requires well-drained soil..."
});
await question.save();
```

**Add Reply to Answer:**
```javascript
const question = await Question.findById(questionId);
const answer = question.answers.id(answerId);  // Get specific answer
answer.replies.push({
  userName: "User",
  reply: "Thank you for the answer!"
});
await question.save();
```

**Get All Questions (Populated):**
```javascript
const questions = await Question.find()
  .populate('user', 'name email')  // Populate question author
  .populate('answers.user', 'name email')  // Populate answer authors
  .populate('answers.replies.user', 'name email')  // Populate reply authors
  .sort({ createdAt: -1 });
```

### Data Flow:

**Question Creation:**
```
Question.create({ userName, question })
    ↓
Validation (userName, question required)
    ↓
user field set (null if anonymous, ObjectId if logged in)
    ↓
answers array initialized (empty)
    ↓
Document saved
    ↓
Timestamps added
```

**Adding Answer:**
```
Question.findById(questionId)
    ↓
question.answers.push({ userName, answer })
    ↓
Answer document created in array
    ↓
replies array initialized (empty)
    ↓
question.save()
    ↓
Answer timestamps added
```

**Adding Reply:**
```
Question.findById(questionId)
    ↓
answer = question.answers.id(answerId)
    ↓
answer.replies.push({ userName, reply })
    ↓
Reply document created in array
    ↓
question.save()
    ↓
Reply timestamps added
```

### Population (Joining User Data):

**Without Population:**
```javascript
{
  user: ObjectId("507f1f77bcf86cd799439011"),
  userName: "John",
  answers: [{
    user: ObjectId("507f1f77bcf86cd799439012"),
    userName: "Expert"
  }]
}
```

**With Population:**
```javascript
{
  user: {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    name: "John Doe",
    email: "john@example.com"
  },
  userName: "John",
  answers: [{
    user: {
      _id: ObjectId("507f1f77bcf86cd799439012"),
      name: "Expert User",
      email: "expert@example.com"
    },
    userName: "Expert"
  }]
}
```

### Index Usage:

```javascript
questionSchema.index({ createdAt: -1 });
```

- Purpose: Fast sorting by creation date
- Use case: Get newest questions first
- Performance: Without index, MongoDB sorts in memory (slow); with index, uses index (fast)

### Common Operations:

1. **Get Single Question:**
   ```javascript
   const question = await Question.findById(id)
     .populate('user', 'name email')
     .populate('answers.user', 'name email')
     .populate('answers.replies.user', 'name email');
   ```

2. **Get All Questions (Newest First):**
   ```javascript
   const questions = await Question.find()
     .sort({ createdAt: -1 })
     .limit(20);
   ```

3. **Count Answers:**
   ```javascript
   const question = await Question.findById(id);
   const answerCount = question.answers.length;
   ```

4. **Count Replies:**
   ```javascript
   const question = await Question.findById(id);
   const answer = question.answers.id(answerId);
   const replyCount = answer.replies.length;
   ```

---

## 🔐 Authentication Middleware (`middleware/auth.js`)

### Detailed Explanation:

Authentication middleware JWT tokens को verify करके user authentication handle करता है।

---

### 1. `protect` Middleware

**क्या करता है:**
- JWT token verify करता है
- Token से user ID extract करता है
- User को database से fetch करता है
- `req.user` में user object set करता है

### Code Breakdown:

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Step 1: Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Step 2: Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Step 3: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: Get user from database
    req.user = await User.findById(decoded.id).select('-password');

    // Step 5: Check if user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Step 6: Continue to route handler
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};
```

### Step-by-Step Execution Flow:

1. **Token Extraction:**
   ```javascript
   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
     token = req.headers.authorization.split(' ')[1];
   }
   ```
   - Check करता है Authorization header present है
   - Format check: `Bearer <token>`
   - Token extract करता है (space के बाद का part)

2. **Token Validation:**
   ```javascript
   if (!token) {
     return res.status(401).json({ ... });
   }
   ```
   - Token missing होने पर 401 error return करता है
   - Request stop हो जाता है

3. **JWT Verification:**
   ```javascript
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   ```
   - Token को JWT_SECRET से verify करता है
   - Invalid/expired token पर error throw होता है
   - Valid token पर decoded payload return होता है
   - Payload में `id` field होता है (user ID)

4. **User Fetch:**
   ```javascript
   req.user = await User.findById(decoded.id).select('-password');
   ```
   - User ID से database में user find करता है
   - Password exclude करता है (security)
   - User object `req.user` में set होता है

5. **User Existence Check:**
   ```javascript
   if (!req.user) {
     return res.status(401).json({ ... });
   }
   ```
   - User exist नहीं करता तो 401 error
   - (User delete हो गया हो सकता है)

6. **Continue:**
   ```javascript
   next();
   ```
   - सब कुछ OK है तो next middleware/route handler को call करता है

### Request Flow:

```
Client Request with Authorization header
    ↓
protect middleware called
    ↓
Extract token from "Bearer <token>"
    ↓
Token exists? → No → 401 Error
    ↓ Yes
Verify JWT token with JWT_SECRET
    ↓
Token valid? → No → 401 Error
    ↓ Yes
Extract user ID from decoded token
    ↓
Find user in database (password excluded)
    ↓
User exists? → No → 401 Error
    ↓ Yes
Set req.user = user object
    ↓
Call next() → Continue to route handler
    ↓
Route handler has access to req.user
```

### Usage:

```javascript
const { protect } = require('../middleware/auth');

router.get('/protected-route', protect, async (req, res) => {
  // req.user is available here
  // req.user.id, req.user.name, req.user.email
  res.json({ user: req.user });
});
```

### Error Scenarios:

1. **No Authorization Header:**
   ```javascript
   // Request without header
   // Response: 401 { success: false, message: 'Not authorized...' }
   ```

2. **Invalid Token Format:**
   ```javascript
   // Header: "Authorization: InvalidFormat token123"
   // Response: 401 (token extraction fails)
   ```

3. **Expired Token:**
   ```javascript
   // Token expired
   // jwt.verify() throws error
   // Response: 401 { success: false, message: 'Not authorized...' }
   ```

4. **Invalid Token:**
   ```javascript
   // Wrong JWT_SECRET or tampered token
   // jwt.verify() throws error
   // Response: 401
   ```

5. **User Not Found:**
   ```javascript
   // Valid token but user deleted from database
   // Response: 401 { success: false, message: 'User not found' }
   ```

---

### 2. `optionalAuth` Middleware

**क्या करता है:**
- Token verify करता है अगर present है
- Token नहीं है तो continue करता है (no error)
- `req.user` set करता है अगर valid token है

### Code Breakdown:

```javascript
exports.optionalAuth = async (req, res, next) => {
  let token;

  // Step 1: Extract token (same as protect)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Step 2: If no token, continue without user
  if (!token) {
    return next();  // Continue without req.user
  }

  try {
    // Step 3: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Step 4: Get user
    req.user = await User.findById(decoded.id).select('-password');
    
    // Note: If user not found, req.user remains undefined
    // But we still continue (no error)
  } catch (error) {
    // Invalid token - continue without user
    req.user = null;
  }

  // Step 5: Always continue
  next();
};
```

### Key Differences from `protect`:

1. **No Token = OK:**
   - `protect`: Returns 401 error
   - `optionalAuth`: Continues with `req.user = undefined`

2. **Invalid Token = OK:**
   - `protect`: Returns 401 error
   - `optionalAuth`: Continues with `req.user = null`

3. **User Not Found = OK:**
   - `protect`: Returns 401 error
   - `optionalAuth`: Continues with `req.user = undefined`

### Request Flow:

```
Client Request (with or without token)
    ↓
optionalAuth middleware called
    ↓
Token present? → No → next() → Continue (req.user = undefined)
    ↓ Yes
Verify JWT token
    ↓
Token valid? → No → next() → Continue (req.user = null)
    ↓ Yes
Find user in database
    ↓
User found? → No → next() → Continue (req.user = undefined)
    ↓ Yes
Set req.user = user object
    ↓
next() → Continue to route handler
    ↓
Route handler checks: if (req.user) { ... }
```

### Usage:

```javascript
const { optionalAuth } = require('../middleware/auth');

router.post('/public-route', optionalAuth, async (req, res) => {
  if (req.user) {
    // User is logged in
    // Can access req.user.id, req.user.name, etc.
  } else {
    // User is anonymous
    // Still can use the route
  }
});
```

### Use Cases:

1. **Anonymous Questions:**
   ```javascript
   // Users can post questions without login
   // But if logged in, link question to user account
   router.post('/questions', optionalAuth, async (req, res) => {
     const question = await Question.create({
       user: req.user ? req.user._id : null,  // Link if logged in
       userName: req.body.userName,
       question: req.body.question
     });
   });
   ```

2. **Public Content with User Context:**
   ```javascript
   // Show all content, but highlight user's own content
   router.get('/content', optionalAuth, async (req, res) => {
     const content = await Content.find();
     // If req.user exists, mark user's content
   });
   ```

### Comparison Table:

| Feature | `protect` | `optionalAuth` |
|---------|-----------|----------------|
| No token | 401 Error | Continue (no user) |
| Invalid token | 401 Error | Continue (no user) |
| Expired token | 401 Error | Continue (no user) |
| User not found | 401 Error | Continue (no user) |
| Valid token | Set req.user | Set req.user |
| Use case | Protected routes | Public routes with optional auth |

---

## 🛣️ API Routes

### 1. Auth Routes (`routes/auth.js`)

### Detailed Explanation:

Auth routes user registration, login, और current user information handle करते हैं।

### JWT Token Generation:

```javascript
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',  // Token valid for 30 days
  });
};
```

**How it works:**
1. User ID को payload में include करता है
2. JWT_SECRET से sign करता है
3. 30 days expiration set करता है
4. Token string return करता है

**Token Structure:**
```
header.payload.signature
```

---

#### POST `/api/auth/register`

### Detailed Explanation:

**क्या करता है:**
- नया user create करता है
- Password hash करता है (User model pre-save hook)
- JWT token generate करता है
- User data return करता है

### Step-by-Step Execution Flow:

1. **Extract Request Data:**
   ```javascript
   const { name, email, password } = req.body;
   ```
   - Request body से fields extract करता है

2. **Field Validation:**
   ```javascript
   if (!name || !email || !password) {
     return res.status(400).json({
       success: false,
       message: 'Please provide all required fields',
     });
   }
   ```
   - सभी fields required हैं
   - Missing field पर 400 error

3. **Password Length Validation:**
   ```javascript
   if (password.length < 6) {
     return res.status(400).json({
       success: false,
       message: 'Password must be at least 6 characters',
     });
   }
   ```
   - Minimum 6 characters required
   - Short password पर 400 error

4. **Email Uniqueness Check:**
   ```javascript
   const userExists = await User.findOne({ email });
   if (userExists) {
     return res.status(400).json({
       success: false,
       message: 'User already exists with this email',
     });
   }
   ```
   - Database में email check करता है
   - Duplicate email पर 400 error

5. **User Creation:**
   ```javascript
   const user = await User.create({
     name,
     email,
     password,
   });
   ```
   - User model create करता है
   - Pre-save hook automatically password hash करता है
   - User document database में save होता है

6. **Token Generation:**
   ```javascript
   const token = generateToken(user._id);
   ```
   - User ID से JWT token generate करता है
   - Token 30 days valid होता है

7. **Response:**
   ```javascript
   res.status(201).json({
     success: true,
     message: 'User registered successfully',
     token,
     user: {
       id: user._id,
       name: user.name,
       email: user.email,
       createdAt: user.createdAt,
     },
   });
   ```
   - 201 status (Created)
   - Token और user data return करता है
   - Password exclude होता है (security)

### Request Flow:

```
POST /api/auth/register
    ↓
Extract { name, email, password }
    ↓
Validate all fields present
    ↓
Validate password length >= 6
    ↓
Check email uniqueness in database
    ↓
Email exists? → Yes → 400 Error
    ↓ No
User.create({ name, email, password })
    ↓
Pre-save hook: Hash password
    ↓
Save user to database
    ↓
Generate JWT token (30 days)
    ↓
Return 201 { success, token, user }
```

### Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Success Response (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses:

**400 - Missing Fields:**
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

**400 - Short Password:**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

**400 - Email Exists:**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Server error during registration"
}
```

---

#### POST `/api/auth/login`

### Detailed Explanation:

**क्या करता है:**
- Email और password verify करता है
- Valid credentials पर JWT token return करता है

### Step-by-Step Execution Flow:

1. **Extract Request Data:**
   ```javascript
   const { email, password } = req.body;
   ```

2. **Field Validation:**
   ```javascript
   if (!email || !password) {
     return res.status(400).json({
       success: false,
       message: 'Please provide email and password',
     });
   }
   ```

3. **Find User with Password:**
   ```javascript
   const user = await User.findOne({ email }).select('+password');
   ```
   - Email से user find करता है
   - `.select('+password')` password field include करता है (normally excluded)
   - Password compare करने के लिए needed है

4. **User Existence Check:**
   ```javascript
   if (!user) {
     return res.status(401).json({
       success: false,
       message: 'Invalid credentials',
     });
   }
   ```
   - User नहीं मिला तो 401 error
   - Generic message (security: don't reveal if email exists)

5. **Password Verification:**
   ```javascript
   const isMatch = await user.matchPassword(password);
   if (!isMatch) {
     return res.status(401).json({
       success: false,
       message: 'Invalid credentials',
     });
   }
   ```
   - `matchPassword()` method bcrypt compare करता है
   - Password match नहीं होने पर 401 error
   - Generic message (security)

6. **Token Generation:**
   ```javascript
   const token = generateToken(user._id);
   ```

7. **Response:**
   ```javascript
   res.status(200).json({
     success: true,
     message: 'Login successful',
     token,
     user: {
       id: user._id,
       name: user.name,
       email: user.email,
       createdAt: user.createdAt,
     },
   });
   ```

### Request Flow:

```
POST /api/auth/login
    ↓
Extract { email, password }
    ↓
Validate fields present
    ↓
Find user by email (include password)
    ↓
User found? → No → 401 Error ("Invalid credentials")
    ↓ Yes
Compare password with bcrypt
    ↓
Password match? → No → 401 Error ("Invalid credentials")
    ↓ Yes
Generate JWT token (30 days)
    ↓
Return 200 { success, token, user }
```

### Request Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Success Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses:

**400 - Missing Fields:**
```json
{
  "success": false,
  "message": "Please provide email and password"
}
```

**401 - Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```
(Note: Same message for both wrong email and wrong password - security best practice)

---

#### GET `/api/auth/me`

### Detailed Explanation:

**क्या करता है:**
- Current logged-in user का data return करता है
- Protected route (requires authentication)

### Step-by-Step Execution Flow:

1. **Middleware Execution:**
   ```javascript
   router.get('/me', protect, async (req, res) => {
   ```
   - `protect` middleware पहले execute होता है
   - Token verify करता है
   - `req.user` set करता है
   - Invalid token पर 401 error (middleware से)

2. **Fetch User:**
   ```javascript
   const user = await User.findById(req.user.id);
   ```
   - `req.user.id` से user fetch करता है
   - Password automatically excluded है

3. **Response:**
   ```javascript
   res.status(200).json({
     success: true,
     user: {
       id: user._id,
       name: user.name,
       email: user.email,
       createdAt: user.createdAt,
     },
   });
   ```

### Request Flow:

```
GET /api/auth/me
    ↓
protect middleware
    ↓
Extract token from Authorization header
    ↓
Verify JWT token
    ↓
Find user in database
    ↓
Set req.user
    ↓
Route handler: Fetch user by req.user.id
    ↓
Return 200 { success, user }
```

### Headers Required:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200):
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses:

**401 - No Token:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**401 - Invalid Token:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**401 - User Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 2. User Routes (`routes/user.js`)

#### GET `/api/user/me`
**क्या करता है:**
- Current user का profile return करता है
- Protected route

---

#### PUT `/api/user/me`
**क्या करता है:**
- User profile update करता है (name, email)
- Protected route

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

---

### 3. Market Routes (`routes/market.js`)

#### GET `/api/market`
**क्या करता है:**
- Market prices fetch करता है
- Optional filters: state, district, crop, market, date
- Real-time API try करता है अगर `useRealtime=true`
- Database fallback अगर API fail हो

**Query Parameters:**
- `state` - Filter by state
- `district` - Filter by district
- `crop` - Filter by crop
- `market` - Filter by market
- `date` - Filter by date (YYYY-MM-DD)
- `useRealtime` - Try external API first

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [...],
  "source": "database" | "external_api"
}
```

---

#### GET `/api/market/states`
**क्या करता है:**
- Database से सभी unique states return करता है

**Response:**
```json
{
  "success": true,
  "data": ["Punjab", "Haryana", "Uttar Pradesh", ...]
}
```

---

#### GET `/api/market/districts`
**क्या करता है:**
- Specific state के सभी districts return करता है

**Query Parameters:**
- `state` (required) - State name

**Response:**
```json
{
  "success": true,
  "data": ["Ludhiana", "Amritsar", "Bathinda", ...]
}
```

---

#### GET `/api/market/crops`
**क्या करता है:**
- सभी unique crops return करता है

---

#### GET `/api/market/markets`
**क्या करता है:**
- Markets return करता है (optionally filtered by state/district)

**Query Parameters:**
- `state` (optional)
- `district` (optional)

---

#### POST `/api/market`
**क्या करता है:**
- Single market price create/update करता है

**Request Body:**
```json
{
  "crop": "Wheat",
  "state": "Punjab",
  "district": "Ludhiana",
  "market": "Ludhiana Mandi",
  "price": 2420,
  "unit": "Quintal",
  "date": "2024-01-01"
}
```

---

#### POST `/api/market/sync-realtime`
**क्या करता है:**
- External API से data fetch करके database में sync करता है
- Optional filters: state, district, crop

**Request Body:**
```json
{
  "state": "Punjab",
  "district": "Ludhiana",
  "crop": "Wheat"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sync complete",
  "data": {
    "created": 10,
    "updated": 5,
    "total": 15
  }
}
```

---

#### GET `/api/market/realtime`
**क्या करता है:**
- Direct external API से real-time data fetch करता है (database save नहीं करता)

**Query Parameters:**
- `state`, `district`, `crop`, `market` (all optional)
- `limit` (default: 200)

---

### 4. Weather Routes (`routes/weather.js`)

#### GET `/api/weather`
**क्या करता है:**
- City name से current weather fetch करता है

**Query Parameters:**
- `city` (required) - City name
- `country` (optional, default: 'in') - Country code

**Response:**
```json
{
  "success": true,
  "data": {
    "temperature": 25,
    "feelsLike": 27,
    "humidity": 65,
    "description": "clear sky",
    "windSpeed": 3.5,
    ...
  }
}
```

---

#### GET `/api/weather/coordinates`
**क्या करता है:**
- Latitude/longitude से weather fetch करता है

**Query Parameters:**
- `lat` (required) - Latitude
- `lon` (required) - Longitude

---

#### GET `/api/weather/forecast`
**क्या करता है:**
- 5-day weather forecast return करता है

**Query Parameters:**
- `city` (required)
- `country` (optional)

---

### 5. Community Routes (`routes/community.js`)

#### POST `/api/community/questions`
**क्या करता है:**
- नया question post करता है
- Optional authentication (anonymous questions allowed)

**Request Body:**
```json
{
  "userName": "Farmer",
  "question": "How to grow wheat?"
}
```

---

#### GET `/api/community/questions`
**क्या करता है:**
- सभी questions with answers return करता है
- Newest first sorted

---

#### POST `/api/community/questions/:id/answers`
**क्या करता है:**
- Question पर answer add करता है

**Request Body:**
```json
{
  "userName": "Expert",
  "answer": "Wheat requires..."
}
```

---

#### POST `/api/community/questions/:questionId/answers/:answerId/replies`
**क्या करता है:**
- Answer पर reply add करता है

**Request Body:**
```json
{
  "userName": "User",
  "reply": "Thank you for the answer!"
}
```

---

#### GET `/api/community/questions/:id`
**क्या करता है:**
- Single question with all answers/replies return करता है

---

### 6. Crop Health Routes (`routes/cropHealth.js`)

#### POST `/api/crop-health/analyze`
**क्या करता है:**
- Crop image upload करके AI service से analysis करवाता है
- Disease detection और treatment suggestions return करता है

**Request:**
- Multipart form data
- Field name: `image`
- Max file size: 10MB

**Response:**
```json
{
  "success": true,
  "data": {
    "crop_type": "Wheat",
    "disease": "Rust",
    "confidence": 0.95,
    "description": "...",
    "treatment": "...",
    "prevention": "...",
    "recommendations": "..."
  }
}
```

**AI Service Integration:**
- Python service at `AI_SERVICE_URL` (default: `http://localhost:8001/predict`)
- Image forwarded as multipart form data

---

## 🔌 External Services

### 1. Market API Service (`services/marketApiService.js`)

**क्या करता है:**
- External government API (data.gov.in) से market prices fetch करता है
- Data normalize करता है consistent format में
- Database sync functionality provide करता है

**Key Functions:**

#### `fetchRealTimeMarketData(params)`
- External API से data fetch करता है
- Filters: state, district, crop, market
- Returns normalized data array

#### `normalizeApiData(records)`
- API response को standard format में convert करता है
- Handles different field names from API
- Filters invalid records

#### `syncRealTimeData(filters)`
- API data fetch करके database में save करता है
- Duplicate check करता है (same day, same location)
- Update existing या create new records

**API Configuration:**
- API Key: `MARKET_API_KEY` (from .env)
- Base URL: `https://api.data.gov.in/resource/...`

---

### 2. Weather Service (`services/weatherService.js`)

**क्या करता है:**
- OpenWeatherMap API integrate करता है
- Weather data normalize करता है

**Key Functions:**

#### `getCurrentWeather(city, countryCode)`
- City name से current weather fetch करता है
- City name mapping handle करता है (e.g., "Bangalore" → "Bengaluru")

#### `getWeatherByCoordinates(lat, lon)`
- Coordinates से weather fetch करता है

#### `getWeatherForecast(city, countryCode)`
- 5-day forecast return करता है

#### `normalizeWeatherData(data)`
- API response को consistent format में convert करता है

**API Configuration:**
- API Key: `WEATHER_API_KEY` (from .env)
- Base URL: `https://api.openweathermap.org/data/2.5`

**City Mappings:**
- Handles alternative city names
- Examples: "Allahabad" → "Prayagraj", "Bangalore" → "Bengaluru"

---

## 🛠️ Utility Scripts

### 1. `scripts/seedMarketData.js`
**क्या करता है:**
- Sample market price data database में seed करता है
- Multiple states और crops के data add करता है

**Usage:**
```bash
npm run seed:market
```

---

### 2. `scripts/addStateDistrict.js`
**क्या करता है:**
- States और districts manually add करने के लिए example script

**Usage:**
```bash
npm run example:state-district
```

---

### 3. `scripts/testApi.js`
**क्या करता है:**
- API endpoints test करने के लिए utility

**Usage:**
```bash
npm run test:api
```

---

## 🔧 Environment Variables

`.env` file में required variables:

```env
# Database
MONGO_URI=mongodb://localhost:27017/smart-farming

# Server
PORT=5000

# Authentication
JWT_SECRET=your_secret_key_here

# External APIs
MARKET_API_KEY=your_market_api_key
WEATHER_API_KEY=your_weather_api_key

# AI Service
AI_SERVICE_URL=http://localhost:8001/predict
```

---

## 📦 Dependencies

**Main Dependencies:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `axios` - HTTP client for external APIs
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `multer` - File upload handling
- `form-data` - Form data handling

---

## 🚦 API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 🔒 Security Features

1. **Password Hashing:** bcryptjs से passwords hash होते हैं
2. **JWT Authentication:** Token-based authentication
3. **Password Exclusion:** User model में password by default return नहीं होता
4. **Input Validation:** Routes में validation checks
5. **Error Handling:** Proper error messages (no sensitive data leak)

---

## 📝 Notes

1. **Database:** MongoDB required, connection string `.env` में
2. **External APIs:** Market और Weather APIs के लिए API keys required
3. **AI Service:** Crop health के लिए separate Python service चलना चाहिए
4. **CORS:** Frontend communication के लिए enabled है
5. **Error Logging:** Console में errors log होते हैं

---

## 🎯 Key Workflows

### User Registration Flow:
1. User sends registration request with name, email, password
2. Server validates input
3. Checks if email already exists
4. Hashes password
5. Creates user in database
6. Generates JWT token
7. Returns token and user data

### Market Price Fetch Flow:
1. Frontend sends request with filters
2. Server checks if `useRealtime=true`
3. If yes, tries external API first
4. If API fails or no data, queries database
5. Returns data with source indicator

### Question-Answer Flow:
1. User posts question (anonymous or logged in)
2. Other users can answer
3. Users can reply to answers
4. All data stored in nested structure

---

## 🐛 Troubleshooting

**Database Connection Issues:**
- Check `MONGO_URI` in `.env`
- Ensure MongoDB is running
- Check network connectivity

**API Key Issues:**
- Verify API keys in `.env`
- Check API key validity
- Ensure API quotas not exceeded

**Authentication Issues:**
- Verify JWT_SECRET is set
- Check token expiration
- Ensure token format: `Bearer <token>`

---

## 📞 Support

Issues या questions के लिए project repository check करें।

---

---

## 📚 Module Summary

इस document में निम्नलिखित modules की detailed explanations हैं:

### ✅ Covered in Detail:

1. **Server Setup (`server.js`)**
   - Express initialization
   - Middleware configuration
   - Route registration
   - Request flow

2. **Database Configuration (`config/db.js`)**
   - MongoDB connection
   - Error handling
   - Connection states

3. **Database Models:**
   - **User Model:** Schema, password hashing, methods
   - **MarketPrice Model:** Schema, indexes, queries
   - **Question Model:** Nested structure, population

4. **Authentication Middleware (`middleware/auth.js`)**
   - `protect` middleware: Step-by-step execution
   - `optionalAuth` middleware: Differences and use cases

5. **Auth Routes (`routes/auth.js`)**
   - Registration: Complete flow with validation
   - Login: Password verification process
   - Get Current User: Protected route handling

### 📝 Additional Modules (Briefly Covered):

6. **Market Routes (`routes/market.js`)** - API endpoints for market prices
7. **Weather Routes (`routes/weather.js`)** - Weather data endpoints
8. **Community Routes (`routes/community.js`)** - Q&A system
9. **Crop Health Routes (`routes/cropHealth.js`)** - AI image analysis
10. **User Routes (`routes/user.js`)** - Profile management
11. **Market API Service (`services/marketApiService.js`)** - External API integration
12. **Weather Service (`services/weatherService.js`)** - Weather API integration

### 🔍 Key Concepts Explained:

- **JWT Authentication:** Token generation, verification, middleware
- **Password Security:** Bcrypt hashing, salt rounds, comparison
- **Database Indexes:** Performance optimization, query speed
- **Nested Schemas:** MongoDB subdocuments, arrays
- **Population:** Joining related documents
- **Error Handling:** Status codes, error messages
- **Request Flow:** Step-by-step execution paths
- **Data Flow:** How data moves through the system

### 💡 Best Practices Documented:

1. **Security:**
   - Password hashing before save
   - Password exclusion from queries
   - Generic error messages (don't reveal if email exists)
   - JWT token expiration

2. **Performance:**
   - Database indexes for fast queries
   - Efficient query patterns
   - Population for related data

3. **Error Handling:**
   - Proper HTTP status codes
   - Meaningful error messages
   - Try-catch blocks
   - Validation checks

4. **Code Organization:**
   - Separation of concerns
   - Middleware for reusable logic
   - Services for external APIs
   - Models for data structure

---

**Last Updated:** 2026-02-06
**Version:** 2.0.0 (Detailed Module Explanations)
