const express = require("express");

const router = express.Router();



const {
    getAllFacultySubjects,
    addFacultySubject,
    getFacultySubjectsById
} = require("../controllers/facultySubjectController");

router.get("/", getAllFacultySubjects);

router.post("/", addFacultySubject);

router.get("/faculty/:facultyId", getFacultySubjectsById);

module.exports = router;