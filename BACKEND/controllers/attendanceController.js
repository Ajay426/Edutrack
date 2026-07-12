const db = require("../config/db");

const createAttendanceSession = async (req, res) => {

    const {
        faculty_subject_id,
        attendance_date,
        lecture_no
    } = req.body;

    try {

        const result = await db.query(
            `INSERT INTO attendance_sessions
            (faculty_subject_id, attendance_date, lecture_no)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [faculty_subject_id, attendance_date, lecture_no]
        );

        res.status(201).json({
            success: true,
            message: "Attendance Session Created",
            data: result.rows[0]
        });

    } catch (err) {

        if (err.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Attendance session already exists."
            });
        }

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};
const getStudentsByClass = async (req, res) => {

    const { classId } = req.params;

    try {

        const result = await db.query(
            `SELECT
                student_id,
                roll_no,
                full_name
             FROM students
             WHERE class_id = $1
             ORDER BY roll_no`,
            [classId]
        );

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

const markAttendance = async (req, res) => {

    const { session_id, attendance } = req.body;

    try {

        for (const student of attendance) {

            await db.query(
                `INSERT INTO attendance_records
                (session_id, student_id, status)
                VALUES ($1, $2, $3)`,
                [
                    session_id,
                    student.student_id,
                    student.status
                ]
            );

        }

        res.status(201).json({
            success: true,
            message: "Attendance Marked Successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};
const getAttendancePercentage = async (req, res) => {

    const { studentId } = req.params;

    try {

        const result = await db.query(
            `
            SELECT
                s.full_name,

                COUNT(ar.attendance_id) AS total_classes,

                COUNT(*) FILTER (WHERE ar.status = 'Present') AS present_classes,

                ROUND(
                    (
                        COUNT(*) FILTER (WHERE ar.status = 'Present')::numeric
                        /
                        NULLIF(COUNT(ar.attendance_id), 0)
                    ) * 100,
                    2
                ) AS attendance_percentage

            FROM students s

            LEFT JOIN attendance_records ar
            ON s.student_id = ar.student_id

            WHERE s.student_id = $1

            GROUP BY s.full_name;
            `,
            [studentId]
        );

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

const getAttendanceReport = async (req, res) => {

    const { classId } = req.params;
    const { subjectId } = req.query;

    try {

        let queryStr = `
            SELECT
                s.student_id,
                s.roll_no,
                s.full_name,
                COUNT(ar.attendance_id) AS total_classes,
                COUNT(ar.attendance_id) FILTER (WHERE ar.status = 'Present') AS present_classes,
                ROUND(
                    (COUNT(ar.attendance_id) FILTER (WHERE ar.status = 'Present')::numeric
                    /
                    NULLIF(COUNT(ar.attendance_id), 0)
                    ) * 100,
                    2
                ) AS attendance_percentage
            FROM students s
            LEFT JOIN attendance_records ar
                ON s.student_id = ar.student_id
            LEFT JOIN attendance_sessions asess
                ON ar.session_id = asess.session_id
            LEFT JOIN faculty_subjects fs
                ON asess.faculty_subject_id = fs.faculty_subject_id
            WHERE s.class_id = $1
        `;

        const params = [classId];

        if (subjectId) {
            queryStr += ` AND fs.subject_id = $2`;
            params.push(subjectId);
        }

        queryStr += `
            GROUP BY s.student_id, s.roll_no, s.full_name
            ORDER BY s.roll_no
        `;

        const result = await db.query(queryStr, params);

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
    createAttendanceSession,
    getStudentsByClass,
    markAttendance,
    getAttendancePercentage,
    getAttendanceReport
};