const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (use MongoDB Atlas for free cloud hosting)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tag-game')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// User model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isOnline: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// API Routes
// Register user
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ success: true, userId: user._id });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Login user
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    user.isOnline = true;
    user.lastActive = Date.now();
    await user.save();
    
    res.json({ success: true, userId: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get online users
app.get('/api/users/online', async (req, res) => {
  try {
    const onlineUsers = await User.find({ isOnline: true }, 'username _id');
    res.json(onlineUsers);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Set user status
app.post('/api/users/status', async (req, res) => {
  try {
    const { userId, status } = req.body;
    await User.findByIdAndUpdate(userId, { 
      isOnline: status === 'online',
      lastActive: Date.now()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});