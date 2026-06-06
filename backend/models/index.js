const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    },
    logging: false,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load all models
db.User       = require('./user')(sequelize, Sequelize);
db.Student    = require('./student')(sequelize, Sequelize);
db.Mark       = require('./mark')(sequelize, Sequelize);
db.Fee        = require('./fee')(sequelize, Sequelize);
db.Attendance = require('./Attendance')(sequelize, Sequelize);
db.Remark     = require('./Remark')(sequelize, Sequelize);

// Associations
db.Student.hasMany(db.Mark, { foreignKey: 'studentReg', sourceKey: 'admissionNo' });
db.Mark.belongsTo(db.Student, { foreignKey: 'studentReg', targetKey: 'admissionNo' });

db.Student.hasMany(db.Fee, { foreignKey: 'studentReg', sourceKey: 'admissionNo' });
db.Fee.belongsTo(db.Student, { foreignKey: 'studentReg', targetKey: 'admissionNo' });

db.Student.hasMany(db.Attendance, { foreignKey: 'admissionNo', sourceKey: 'admissionNo' });
db.Attendance.belongsTo(db.Student, { foreignKey: 'admissionNo', targetKey: 'admissionNo' });

db.Student.hasMany(db.Remark, { foreignKey: 'admissionNo', sourceKey: 'admissionNo' });
db.Remark.belongsTo(db.Student, { foreignKey: 'admissionNo', targetKey: 'admissionNo' });

module.exports = db;