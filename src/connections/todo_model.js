const mysql = require('mysql2');

const connection = mysql.createPool({
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || 'todo_model',
  connectionLimit: 10,
});

connection.getConnection((err, conn) => {
  if (err) {
    conn.release();
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + conn.threadId);
  conn.release();
});

module.exports = connection;
