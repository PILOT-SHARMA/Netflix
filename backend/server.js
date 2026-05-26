require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/content', require('./routes/content'));
app.use('/api/media', require('./routes/media'));
const { MongoMemoryServer } = require('mongodb-memory-server');

// Connect to MongoDB
const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    if (uri.includes('admin:admin@cluster0')) {
      console.log('Using in-memory MongoDB for local demonstration...');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }
    
    await mongoose.connect(uri);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
