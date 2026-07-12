const db = require("../config/db");

const login = async (req, res) => {

    const { email, password } = req.body;

    try {

        const result = await db.query(
            `SELECT
                user_id,
                full_name,
                email,
                password,
                role
            FROM users
            WHERE email = $1`,
            [email]
        );

        // User not found
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Invalid Email"
            });
        }

        const user = result.rows[0];

        // Password check
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            });
        }

        let faculty_id = null;
        if (user.role === "FACULTY") {
            const facultyResult = await db.query(
                `SELECT faculty_id FROM faculty WHERE user_id = $1`,
                [user.user_id]
            );
            if (facultyResult.rowCount > 0) {
                faculty_id = facultyResult.rows[0].faculty_id;
            }
        }

        // Login Success
        res.status(200).json({
            success: true,
            message: "Login Successful",
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                faculty_id: faculty_id
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

const register = async (req, res) => {

    const {
        full_name,
        email,
        password,
        role
    } = req.body;

    try {

        // Check if email already exists
        const existingUser = await db.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if (existingUser.rowCount > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already exists."
            });
        }

        // Insert new user
        const result = await db.query(
            `INSERT INTO users
            (full_name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, full_name, email, role`,
            [
                full_name,
                email,
                password,
                role
            ]
        );

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
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
    login,
    register
};