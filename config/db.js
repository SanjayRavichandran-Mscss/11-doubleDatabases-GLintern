const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables from .env file

// Create a pool for Database1
const db1 = mysql.createPool({
    host: process.env.DB1_HOST,
    user: process.env.DB1_USER,
    password: process.env.DB1_PASSWORD,
    database: process.env.DB1_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Maximum number of connections in the pool
    queueLimit: 0 // Unlimited queueing
});

// Create a pool for Database2
const db2 = mysql.createPool({
    host: process.env.DB2_HOST,
    user: process.env.DB2_USER,
    password: process.env.DB2_PASSWORD,
    database: process.env.DB2_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export pooled connections
module.exports = {
    db1: db1.promise(), // Use promise-based API for easier async/await
    db2: db2.promise()
};
