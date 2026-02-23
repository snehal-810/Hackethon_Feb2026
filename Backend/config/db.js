const mysql = require('mysql2')

// create connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'manager',
  database: 'hackethon_feb2026',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// IMPORTANT: export promise-based pool
module.exports = pool.promise()