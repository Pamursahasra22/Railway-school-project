const path = require('path');
// Note: On Render, you should set Environment Variables in the Dashboard.
// This line won't hurt, but it won't find a .env file on Render (which is good for security).
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const db = require('./models');
const remarkRoutes = require('./routes/remarks');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const markRoutes = require('./routes/marks');
const feeRoutes = require('./routes/fees');
const attendanceRoutes = require('./routes/attendance');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/remarks', remarkRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/attendance', attendanceRoutes);

// --- FRONTEND INTEGRATION ---
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Fallback for SPA routing or direct HTML access
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

async function seedDefaultUsers() {
  const users = [
    { email: 'president@school.com', password: 'president123', role: 'President', name: 'School President' },
    { email: 'principal@school.com', password: 'principal123', role: 'Principal', name: 'School Principal' },
    { email: 'teacher@school.com', password: 'teacher123', role: 'Teacher', name: 'Class Teacher' },
    { email: 'accountant@school.com', password: 'accountant123', role: 'Accountant', name: 'School Accountant' }
  ];

  for (const user of users) {
    try {
      const existing = await db.User.findOne({ where: { email: user.email } });
      if (!existing) {
        await db.User.create({
          email: user.email,
          passwordHash: bcrypt.hashSync(user.password, 10),
          role: user.role,
          name: user.name
        });
        console.log(`Created default user: ${user.email}`);
      }
    } catch (e) {
      console.log(`Note: User ${user.email} initialization skipped (already exists or error).`);
    }
  }
}

async function startServer() {
  try {
    // 1. Connect to TiDB Cloud
    await db.sequelize.authenticate();
    console.log('✅ Database connection established.');

    // 2. SYNC TABLES
    // Use { alter: false } or just sync() to prevent TiDB constraint errors.
    // IF YOU STILL GET ERRORS: Change this to .sync({ force: true }) ONCE, 
    // deploy it, then change it back to .sync().
    await db.sequelize.sync(); 
    console.log('✅ Database tables verified.');

    // 3. Verify Default Users
    await seedDefaultUsers();
    console.log('✅ Default users verified.');

    // 4. Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();