const db = require("../config/db");

const getAllFacultySubjects = async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
                fs.faculty_subject_id,
                u.full_name AS faculty_name,
                s.subject_name,
                d.department_name,
                c.semester,
                c.section
            FROM faculty_subjects fs

            JOIN faculty f
                ON fs.faculty_id = f.faculty_id

            JOIN users u
                ON f.user_id = u.user_id

            JOIN subjects s
                ON fs.subject_id = s.subject_id

            JOIN classes c
                ON fs.class_id = c.class_id

            JOIN departments d
                ON c.department_id = d.department_id

            ORDER BY fs.faculty_subject_id;
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

const addFacultySubject = async (req, res) => {

    const {
        faculty_id,
        subject_id,
        class_id
    } = req.body;

    try {

        const result = await db.query(
            `INSERT INTO faculty_subjects
            (faculty_id, subject_id, class_id)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [faculty_id, subject_id, class_id]
        );

        res.status(201).json({
            success: true,
            message: "Faculty assigned successfully",
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

const getFacultySubjectsById = async (req, res) => {

    const { facultyId } = req.params;

    try {

        const result = await db.query(`
            SELECT
                fs.faculty_subject_id,
                fs.faculty_id,
                s.subject_id,
                s.subject_name,
                s.subject_code,
                c.class_id,
                c.semester,
                c.section,
                d.department_name
            FROM faculty_subjects fs

            JOIN subjects s
                ON fs.subject_id = s.subject_id

            JOIN classes c
                ON fs.class_id = c.class_id

            JOIN departments d
                ON c.department_id = d.department_id

            WHERE fs.faculty_id = $1
            ORDER BY fs.faculty_subject_id;
        `, [facultyId]);

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

module.exports = {
    getAllFacultySubjects,
    addFacultySubject,
    getFacultySubjectsById
};