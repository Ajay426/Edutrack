const db = require("../config/db");

const adminDashboard = async (req, res) => {

    try {

        const totalStudents = await db.query(
            `SELECT COUNT(*) FROM students`
        );

        const totalFaculty = await db.query(
            `SELECT COUNT(*) FROM faculty`
        );

        const totalSubjects = await db.query(
            `SELECT COUNT(*) FROM subjects`
        );

        const totalClasses = await db.query(
            `SELECT COUNT(*) FROM classes`
        );

        res.status(200).json({
            success: true,
            data: {
                total_students: Number(totalStudents.rows[0].count),
                total_faculty: Number(totalFaculty.rows[0].count),
                total_subjects: Number(totalSubjects.rows[0].count),
                total_classes: Number(totalClasses.rows[0].count)
            }
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const facultyDashboard = async (req, res) => {

    const { facultyId } = req.params;

    try {

        const result = await db.query(
            `
            SELECT
                u.full_name AS faculty_name,
                d.department_name,
                f.designation,

                COUNT(DISTINCT fs.subject_id) AS assigned_subjects,

                COUNT(DISTINCT fs.class_id) AS assigned_classes

            FROM faculty f

            JOIN users u
                ON f.user_id = u.user_id

            JOIN departments d
                ON f.department_id = d.department_id

            LEFT JOIN faculty_subjects fs
                ON f.faculty_id = fs.faculty_id

            WHERE f.faculty_id = $1

            GROUP BY
                u.full_name,
                d.department_name,
                f.designation;
            `,
            [facultyId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Faculty Not Found"
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

module.exports = {
    adminDashboard,
    facultyDashboard
};