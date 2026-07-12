const db = require("../config/db");

const getAllFaculty = async (req, res) => {
    try {

        const result = await db.query(`
            SELECT
                f.faculty_id,
                u.full_name,
                u.email,
                d.department_name,
                f.designation,
                f.phone
            FROM faculty f
            JOIN users u
                ON f.user_id = u.user_id
            JOIN departments d
                ON f.department_id = d.department_id
            ORDER BY f.faculty_id;
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



const addFaculty = async (req, res) => {

    const {
        full_name,
        email,
        password,
        department_id,
        designation,
        phone
    } = req.body;

    try {

        // Insert into users table
        const userResult = await db.query(
            `INSERT INTO users (full_name, email, password, role)
             VALUES ($1, $2, $3, 'FACULTY')
             RETURNING user_id`,
            [full_name, email, password]
        );

        const user_id = userResult.rows[0].user_id;

        // Insert into faculty table
        await db.query(
            `INSERT INTO faculty
            (user_id, department_id, designation, phone)
            VALUES ($1, $2, $3, $4)`,
            [user_id, department_id, designation, phone]
        );

        res.status(201).json({
            success: true,
            message: "Faculty Added Successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const updateFaculty = async (req, res) => {

    const { id } = req.params;

    const {
        full_name,
        email,
        department_id,
        designation,
        phone
    } = req.body;

    try {

        // Find user_id from faculty table
        const facultyResult = await db.query(
            `SELECT user_id
             FROM faculty
             WHERE faculty_id = $1`,
            [id]
        );

        if (facultyResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Faculty Not Found"
            });
        }

        const user_id = facultyResult.rows[0].user_id;

        // Update users table
        await db.query(
            `UPDATE users
             SET full_name = $1,
                 email = $2
             WHERE user_id = $3`,
            [full_name, email, user_id]
        );

        // Update faculty table
        await db.query(
            `UPDATE faculty
             SET department_id = $1,
                 designation = $2,
                 phone = $3
             WHERE faculty_id = $4`,
            [department_id, designation, phone, id]
        );

        res.status(200).json({
            success: true,
            message: "Faculty Updated Successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

const deleteFaculty = async (req, res) => {

    const { id } = req.params;

    try {

        // Find user_id
        const facultyResult = await db.query(
            `SELECT user_id
             FROM faculty
             WHERE faculty_id = $1`,
            [id]
        );

        if (facultyResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Faculty Not Found"
            });
        }

        const user_id = facultyResult.rows[0].user_id;

        // Delete from users
        await db.query(
            `DELETE FROM users
             WHERE user_id = $1`,
            [user_id]
        );

        res.status(200).json({
            success: true,
            message: "Faculty Deleted Successfully"
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
    getAllFaculty,
    addFaculty,
    updateFaculty,
     deleteFaculty
};


