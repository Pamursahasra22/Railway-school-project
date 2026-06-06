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
        // TiDB Cloud requires SSL. 
        // This setting ensures the connection is encrypted.
        rejectUnauthorized: false 
      }
    },
    logging: false, // Set to console.log if you want to see SQL queries
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import your models here (User, Student, etc.)
db.User = require('./user')(sequelize, Sequelize);
// ... add your other models ...

module.exports = db;