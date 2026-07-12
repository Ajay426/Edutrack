const db = require("../config/db");

const getAllSubjects = async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
                s.subject_id,
                s.subject_name,
                s.subject_code,
                d.department_name,
                s.semester

            FROM subjects s

            JOIN departments d
            ON s.department_id = d.department_id

            ORDER BY s.subject_code;
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
const getSubjectById = async (req, res) => {

    const { id } = req.params;

    try {

        const result = await db.query(`
            SELECT
                s.subject_id,
                s.subject_name,
                s.subject_code,
                d.department_name,
                s.semester

            FROM subjects s

            JOIN departments d
            ON s.department_id = d.department_id

            WHERE s.subject_id = $1;
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Subject Not Found"
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

const addSubject = async (req, res) => {

    const {
        subject_name,
        subject_code,
        department_id,
        semester
    } = req.body;

    try {

        const result = await db.query(
            `INSERT INTO subjects
            (subject_name, subject_code, department_id, semester)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                subject_name,
                subject_code,
                department_id,
                semester
            ]
        );

        res.status(201).json({
            success: true,
            message: "Subject Added Successfully",
            data: result.rows[0]
        });

    } catch (err) {

        if (err.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Subject Code already exists."
            });
        }

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const updateSubject = async (req, res) => {

    const { id } = req.params;

    const {
        subject_name,
        subject_code,
        department_id,
        semester
    } = req.body;

    try {

        const result = await db.query(
            `UPDATE subjects
             SET
                subject_name = $1,
                subject_code = $2,
                department_id = $3,
                semester = $4
             WHERE subject_id = $5
             RETURNING *`,
            [
                subject_name,
                subject_code,
                department_id,
                semester,
                id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Subject Not Found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Subject Updated Successfully",
            data: result.rows[0]
        });

    } catch (err) {

        if (err.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Subject Code already exists."
            });
        }

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const deleteSubject = async (req, res) => {

    const { id } = req.params;

    try {

        const result = await db.query(
            `DELETE FROM subjects
             WHERE subject_id = $1
             RETURNING *`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Subject Not Found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Subject Deleted Successfully"
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
    getAllSubjects,
    getSubjectById,
    addSubject,
    updateSubject,
    deleteSubject
};