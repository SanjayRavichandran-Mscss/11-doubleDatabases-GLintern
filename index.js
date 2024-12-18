const express = require('express');
const studentRoutes = require('./routes/studentRoutes');
const { db1, db2 } = require('./config/db'); // Import both db1 and db2 from db.js
require('dotenv').config(); // Load environment variables

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', studentRoutes);

// Check connections to both databases before starting the server
Promise.all([
    db1.query("SELECT 1"), // Test connection to Database1
    db2.query("SELECT 1")  // Test connection to Database2
])
    .then(() => {
        console.log("MYSQL database-1 (student_db1) connected!");
        console.log("MYSQL database-2 (student_db2) connected!");
        app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
    })
    .catch((err) => {
        console.error("Database connection failed:", err.message);
        process.exit(1); // Exit the application if database connections fail
    });
