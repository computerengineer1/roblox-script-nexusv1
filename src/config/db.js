const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER || 'nexus_user',
  password: process.env.DB_PASS || 'strongpassword',
  database: process.env.DB_NAME || 'roblox_scripts',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

module.exports = pool;
