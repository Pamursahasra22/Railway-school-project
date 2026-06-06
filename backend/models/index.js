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

db.User    = require('./user')(sequelize, Sequelize);
db.Student = require('./student')(sequelize, Sequelize);  // ← THIS was missing
db.Mark    = require('./mark')(sequelize, Sequelize);
db.Fee     = require('./fee')(sequelize, Sequelize);
db.Attendance = require('./attendance')(sequelize, Sequelize);
db.Remark  = require('./remark')(sequelize, Sequelize);

module.exports = db;