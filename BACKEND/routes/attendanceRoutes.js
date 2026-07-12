const express = require("express");

const router = express.Router();

const {
    createAttendanceSession,
    getStudentsByClass,
    markAttendance,
    getAttendancePercentage,
    getAttendanceReport
} = require("../controllers/attendanceController");

router.post("/session", createAttendanceSession);

router.get("/class/:classId", getStudentsByClass);

router.post("/mark", markAttendance);
router.get("/student/:studentId", getAttendancePercentage);
router.get("/report/class/:classId", getAttendanceReport);

module.exports = router;