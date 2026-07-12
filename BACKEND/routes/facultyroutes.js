const express = require("express");

const router = express.Router();



const {
    getAllFaculty,
    addFaculty,
     updateFaculty,
     deleteFaculty
} = require("../controllers/facultyController");

router.get("/", getAllFaculty);

router.post("/", addFaculty);

router.put("/:id", updateFaculty);
router.delete("/:id", deleteFaculty);

module.exports = router;

