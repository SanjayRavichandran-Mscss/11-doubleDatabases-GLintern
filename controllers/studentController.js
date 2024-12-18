const db1 = require('../config/db').db1; // MySQL connection for DB1
const db2 = require('../config/db').db2; // MySQL connection for DB2

// Register student in DB1
const registerStudent = async (req, res) => {
    const { aadhar_number, student_name, mobile_number, college, course, city, state, country } = req.body;

    try {
        // Check if student already exists in DB1
        const checkQuery = `SELECT * FROM students_register WHERE aadhar_number = ?`;
        const [existingStudent] = await db1.query(checkQuery, [aadhar_number]);

        if (existingStudent.length > 0) {
            return res.status(400).json({ message: 'Student with this Aadhar number already exists.' });
        }

        // Insert new student into DB1
        const insertQuery = `
            INSERT INTO students_register (aadhar_number, student_name, mobile_number, college, course, city, state, country)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db1.query(insertQuery, [
            aadhar_number,
            student_name,
            mobile_number,
            college,
            course,
            city,
            state,
            country
        ]);

        res.status(201).json({ message: 'Student registered successfully in Database1' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to register student' });
    }
};

// Fetch student from DB1 and store in DB2
const fetchAndStoreStudentDetails = async (req, res) => {
    const { aadhar_number} = req.body;

    try {
        // Check if student exists in DB1
        const fetchQuery = `SELECT * FROM students_register WHERE aadhar_number = ?`;
        const [rows] = await db1.query(fetchQuery, [aadhar_number]);

        if (rows.length > 0) {
            // Student exists, insert into Database2 (exist_student_details)
            const student = rows[0]; // Get the student details

            const insertQuery = `
                INSERT INTO exist_student_details (aadhar_number, student_name, mobile_number, college, course, city, state, country)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await db2.query(insertQuery, [
                student.aadhar_number,
                student.student_name,
                student.mobile_number,
                student.college,
                student.course,
                student.city,
                student.state,
                student.country
            ]);

            res.status(200).json({ message: 'Student details stored in Database2' });
        } else {
            res.status(404).json({ message: 'The user does not exist in Database1' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch or store student details' });
    }
};


// Compare and sync student details between DB1 and DB2
const compareAndSyncStudent = async (req, res) => {
    const { aadhar_number } = req.body;

    try {
        // Fetch student details from DB1
        const fetchQueryDB1 = `SELECT * FROM students_register WHERE aadhar_number = ?`;
        const [db1StudentRows] = await db1.query(fetchQueryDB1, [aadhar_number]);

        if (db1StudentRows.length === 0) {
            return res.status(404).json({ message: 'Student not found in Database1' });
        }

        const db1Student = db1StudentRows[0];

        // Fetch student details from DB2
        const fetchQueryDB2 = `SELECT * FROM exist_student_details WHERE aadhar_number = ?`;
        const [db2StudentRows] = await db2.query(fetchQueryDB2, [aadhar_number]);

        if (db2StudentRows.length === 0) {
            // Student does not exist in DB2, insert the record
            const insertQueryDB2 = `
                INSERT INTO exist_student_details (aadhar_number, student_name, mobile_number, college, course, city, state, country)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await db2.query(insertQueryDB2, [
                db1Student.aadhar_number,
                db1Student.student_name,
                db1Student.mobile_number,
                db1Student.college,
                db1Student.course,
                db1Student.city,
                db1Student.state,
                db1Student.country
            ]);

            return res.status(201).json({ message: 'Student inserted into Database2 from Database1' });
        }

        const db2Student = db2StudentRows[0];

        // Compare fields between DB1 and DB2
        const fieldsToCompare = ['student_name', 'mobile_number', 'college', 'course', 'city', 'state', 'country'];
        const differences = fieldsToCompare.filter(field => db1Student[field] !== db2Student[field]);

        if (differences.length === 0) {
            return res.status(200).json({ message: 'Both databases have the same records' });
        }

        // Update DB2 with values from DB1
        const updateQueryDB2 = `
            UPDATE exist_student_details
            SET student_name = ?, mobile_number = ?, college = ?, course = ?, city = ?, state = ?, country = ?
            WHERE aadhar_number = ?
        `;
        await db2.query(updateQueryDB2, [
            db1Student.student_name,
            db1Student.mobile_number,
            db1Student.college,
            db1Student.course,
            db1Student.city,
            db1Student.state,
            db1Student.country,
            db1Student.aadhar_number
        ]);

        res.status(200).json({
            message: 'Database2 updated to match Database1',
            updatedFields: differences
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to compare and sync student details' });
    }
};


module.exports = {
    registerStudent,
    fetchAndStoreStudentDetails,
    compareAndSyncStudent,
};
