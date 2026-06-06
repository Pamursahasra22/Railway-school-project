const path = require('path');
// Check for .env file only in local development
require('dotenv').config(); 

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

// --- API ROUTES ---
app.use('/api/remarks', remarkRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/attendance', attendanceRoutes);

// --- STATIC FRONTEND SERVING ---
// This serves all your CSS, JS, and Images automatically
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Manually mapping common pages (Optional, but keeps URLs clean)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dashboard.html'));
});

app.get('/fees', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'fees.html'));
});

// THE WILDCARD: If the user refreshes any page, or goes to a link that 
// isn't an API, send them the index.html.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Default Admin Seeding Logic
async function seedDefaultUsers() {
  const users = [
    { email: 'president@school.com', password: 'president123', role: 'President', name: 'School President' },
    { email: 'principal@school.com', password: 'principal123', role: 'Principal', name: 'School Principal' },
    { email: 'teacher@school.com', password: 'teacher123', role: 'Teacher', name: 'Class Teacher' },
    { email: 'accountant@school.com', password: 'accountant123', role: 'Accountant', name: 'School Accountant' },
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
          console.log(`Seeded user: ${user.email}`);
        }
    } catch (err) {
        console.error("Error seeding users:", err);
    }
  }
}

async function startServer() {
  try {
    // Test Database Connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync Database (This creates tables automatically in the cloud!)
    await db.sequelize.sync({ alter: true });
    console.log('✅ Database synced.');

    // Seed Default Data
    await seedDefaultUsers();
    console.log('✅ Default users verified.');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();