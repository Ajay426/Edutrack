const express = require("express");

const router = express.Router();

const {
    getAllSubjects,
    getSubjectById,
    addSubject,
    updateSubject,
    deleteSubject
} = require("../controllers/subjectController");

router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);
router.post("/", addSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

module.exports = router;