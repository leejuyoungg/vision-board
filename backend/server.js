const express = require('express');
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://vision-board-zqtl-9801yixnf-leejuyounggs-projects.vercel.app'  // 추가!
  ],
  credentials: true
}));
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for canvas data

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/boards', require('./routes/boards'));
app.use('/api/images', require('./routes/images'));

// Test route
app.get('/', (req, res) => {
  res.send('Vision Board API is running 🎨');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});