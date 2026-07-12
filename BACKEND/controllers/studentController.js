const db = require("../config/db");

const getAllStudents = async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
                s.student_id,
                s.roll_no,
                s.registration_no,
                s.full_name,
                d.department_name,
                c.semester,
                c.section,
                s.phone,
                s.email,
                s.status

            FROM students s

            JOIN classes c
            ON s.class_id = c.class_id

            JOIN departments d
            ON c.department_id = d.department_id

            ORDER BY s.roll_no;
        `);

        res.status(200).json({
            success: true,
            count: result.rowCount,
            data: result.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const getStudentById = async (req, res) => {

    const { id } = req.params;

    try {

        const result = await db.query(`
            SELECT
                s.student_id,
                s.roll_no,
                s.registration_no,
                s.full_name,
                d.department_name,
                c.semester,
                c.section,
                s.phone,
                s.email,
                s.status

            FROM students s

            JOIN classes c
                ON s.class_id = c.class_id

            JOIN departments d
                ON c.department_id = d.department_id

            WHERE s.student_id = $1;
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Student Not Found"
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const addStudent = async (req, res) => {

    const {
        roll_no,
        registration_no,
        full_name,
        class_id,
        phone,
        email,
        status
    } = req.body;

    try {

        const result = await db.query(
            `INSERT INTO students
            (roll_no, registration_no, full_name, class_id, phone, email, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                roll_no,
                registration_no,
                full_name,
                class_id,
                phone,
                email,
                status
            ]
        );

        res.status(201).json({
            success: true,
            message: "Student Added Successfully",
            data: result.rows[0]
        });

    } catch (err) {

        if (err.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Roll Number, Registration Number or Email already exists."
            });
        }

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const updateStudent = async (req, res) => {

    const { id } = req.params;

    const {
        roll_no,
        registration_no,
        full_name,
        class_id,
        phone,
        email,
        status
    } = req.body;

    try {

        const result = await db.query(
            `UPDATE students
            SET
                roll_no = $1,
                registration_no = $2,
                full_name = $3,
                class_id = $4,
                phone = $5,
                email = $6,
                status = $7
            WHERE student_id = $8
            RETURNING *`,
            [
                roll_no,
                registration_no,
                full_name,
                class_id,
                phone,
                email,
                status,
                id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Student Not Found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Student Updated Successfully",
            data: result.rows[0]
        });

    } catch (err) {

        if (err.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Roll Number, Registration Number or Email already exists."
            });
        }

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};
const deleteStudent = async (req, res) => {

    const { id } = req.params;

    try {

        const result = await db.query(
            `DELETE FROM students
             WHERE student_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Student Not Found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Student Deleted Successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

module.exports = {
    getAllStudents,
     getStudentById,
     addStudent,
     updateStudent,
     deleteStudent
};