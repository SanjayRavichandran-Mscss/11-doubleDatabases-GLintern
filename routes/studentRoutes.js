const express = require('express');
const { registerStudent, fetchAndStoreStudentDetails ,compareAndSyncStudent} = require('../controllers/studentController');

const router = express.Router();

// Endpoint for student registration
router.post('/register', registerStudent);

// Endpoint for fetching student details from DB1 and storing them in DB2
router.post('/fetch-store-student', fetchAndStoreStudentDetails);

// Endpoint to compare and synchronize records
router.post('/compare-sync-student', compareAndSyncStudent);

module.exports = router;
