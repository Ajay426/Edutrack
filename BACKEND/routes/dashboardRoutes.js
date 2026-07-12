const express = require("express");

const router = express.Router();

const {
    adminDashboard,
    facultyDashboard
} = require("../controllers/dashboardController");

router.get("/admin", adminDashboard);
router.get("/faculty/:facultyId", facultyDashboard);

module.exports = router;
