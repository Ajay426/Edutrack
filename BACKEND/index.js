const express = require("express");
const cors = require("cors");
const db =  require("./config/db");
require("dotenv").config();

const app = express();
const port = 7001;

 app.use(cors());
 app.use(express.json());

// ROUTES
app.get("/", (req, res)=>{
    res.send("Welcome to Dhokhebazz Database");
});

app.get("/users", async(req, res)=>{
       try{
        const result = await db.query(`select * from users`)
        res.json({data:result.rows});
       }catch (err){
        console.error("DATABASE ERROR ", err);
        res.status(500).send("server error")
       }
});

app.get("/classes", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT c.class_id, d.department_name, c.semester, c.section, c.academic_year
            FROM classes c
            JOIN departments d ON c.department_id = d.department_id
            ORDER BY c.semester, c.section
        `);
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error("DATABASE ERROR ", err);
        res.status(500).json({ success: false, message: "server error" });
    }
});

app.get("/departments", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM departments ORDER BY department_name");
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error("DATABASE ERROR ", err);
        res.status(500).json({ success: false, message: "server error" });
    }
});

// faculty routes 
const facultyRoutes = require("./routes/facultyRoutes");

app.use("/faculty", facultyRoutes);

const facultySubjectRoutes = require("./routes/facultySubjectRoutes");

app.use("/faculty-subjects", facultySubjectRoutes);

const attendanceRoutes = require("./routes/attendanceRoutes");

app.use("/attendance", attendanceRoutes);

const studentRoutes = require("./routes/studentRoutes");

app.use("/students", studentRoutes);


const subjectRoutes = require("./routes/subjectRoutes");

app.use("/subjects", subjectRoutes);

const authRoutes = require("./routes/authRoutes");
// login part 
app.use("/auth", authRoutes);
// dashboard 
const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/dashboard", dashboardRoutes);

app.listen(port, ()=> console.log(`SERVER STARTED AT PORT:${port}`))