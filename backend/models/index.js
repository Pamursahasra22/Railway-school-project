const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with Cloud-specific settings
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASS, 
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306, // Use 4000 for TiDB, 3306 for others
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        // This is the "Magic" part required for TiDB Cloud and Aiven
        rejectUnauthorized: true, 
        minVersion: 'TLSv1.2'
      }
    }
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load Models
db.User = require('./user')(sequelize);
db.Student = require('./student')(sequelize);
db.Mark = require('./mark')(sequelize);
db.Fee = require('./fee')(sequelize);
// Passing Sequelize.DataTypes for models that expect two arguments
db.Attendance = require('./Attendance')(sequelize, Sequelize.DataTypes);
db.Remark = require('./Remark')(sequelize, Sequelize.DataTypes);

// --- Associations ---

// Student and Marks
db.Student.hasMany(db.Mark, { 
    foreignKey: 'studentReg', 
    sourceKey: 'admissionNo',
    onDelete: 'CASCADE' // Good practice: if student is deleted, delete marks
});
db.Mark.belongsTo(db.Student, { 
    foreignKey: 'studentReg', 
    targetKey: 'admissionNo' 
});

// Student and Fees
db.Student.hasMany(db.Fee, { 
    foreignKey: 'studentReg', 
    sourceKey: 'admissionNo',
    onDelete: 'CASCADE' 
});
db.Fee.belongsTo(db.Student, { 
    foreignKey: 'studentReg', 
    targetKey: 'admissionNo' 
});

module.exports = db;