import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";
import "../../styles/students.css"; // Reuse students list styling

function AssignFaculty() {
    const [assignments, setAssignments] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        faculty_id: "",
        subject_id: "",
        class_id: ""
    });

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await api.get("/faculty-subjects");
            if (response.data.success) {
                setAssignments(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching assignments:", err);
            alert("Failed to load assignments.");
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [facResponse, subjResponse, classResponse] = await Promise.all([
                api.get("/faculty"),
                api.get("/subjects"),
                api.get("/classes")
            ]);

            if (facResponse.data.success) setFacultyList(facResponse.data.data);
            if (subjResponse.data.success) setSubjects(subjResponse.data.data);
            if (classResponse.data.success) setClasses(classResponse.data.data);
        } catch (err) {
            console.error("Error loading dropdown data:", err);
        }
    };

    useEffect(() => {
        fetchAssignments();
        fetchDropdownData();
    }, []);

    const handleOpenModal = () => {
        setFormData({
            faculty_id: facultyList[0]?.faculty_id || "",
            subject_id: subjects[0]?.subject_id || "",
            class_id: classes[0]?.class_id || ""
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.faculty_id || !formData.subject_id || !formData.class_id) {
            alert("Please select all options.");
            return;
        }

        try {
            const response = await api.post("/faculty-subjects", {
                faculty_id: parseInt(formData.faculty_id, 10),
                subject_id: parseInt(formData.subject_id, 10),
                class_id: parseInt(formData.class_id, 10)
            });

            if (response.data.success) {
                alert("Faculty mapped to subject successfully!");
                setShowModal(false);
                fetchAssignments();
            }
        } catch (err) {
            console.error("Error creating mapping:", err);
            alert(err.response?.data?.message || "Failed to assign faculty to subject.");
        }
    };

    return (
        <AdminLayout>
            <div className="student-container">
                <div className="student-header">
                    <h2>Faculty Subject Mapping</h2>
                    <button className="add-btn" onClick={handleOpenModal}>
                        + Assign Faculty
                    </button>
                </div>

                {loading ? (
                    <p>Loading assignments...</p>
                ) : (
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>SL NO</th>
                                <th>Faculty Name</th>
                                <th>Subject Assigned</th>
                                <th>Class Info</th>
                                <th>Department</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map((item, index) => (
                                <tr key={item.faculty_subject_id}>
                                    <td>{index + 1}</td>
                                    <td style={{ fontWeight: "bold" }}>{item.faculty_name}</td>
                                    <td>{item.subject_name}</td>
                                    <td>Semester {item.semester} - Section {item.section}</td>
                                    <td>{item.department_name}</td>
                                </tr>
                            ))}
                            {assignments.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                                        No active faculty subject assignments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Overlay */}
            {showModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "15px",
                        width: "500px",
                        maxWidth: "90%",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                    }}>
                        <h3 style={{ marginBottom: "20px", color: "#333" }}>
                            Assign Faculty to Subject
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Select Faculty *</label>
                                <select 
                                    name="faculty_id"
                                    value={formData.faculty_id}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                >
                                    <option value="" disabled>Choose Faculty</option>
                                    {facultyList.map(f => (
                                        <option key={f.faculty_id} value={f.faculty_id}>
                                            {f.full_name} ({f.designation} - {f.department_name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Select Subject *</label>
                                <select 
                                    name="subject_id"
                                    value={formData.subject_id}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                >
                                    <option value="" disabled>Choose Subject</option>
                                    {subjects.map(s => (
                                        <option key={s.subject_id} value={s.subject_id}>
                                            {s.subject_code} - {s.subject_name} ({s.department_name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: "25px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Select Class *</label>
                                <select 
                                    name="class_id"
                                    value={formData.class_id}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                >
                                    <option value="" disabled>Choose Class</option>
                                    {classes.map(c => (
                                        <option key={c.class_id} value={c.class_id}>
                                            Semester {c.semester} - Section {c.section} ({c.department_name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                <button 
                                    type="button" 
                                    onClick={handleCloseModal}
                                    style={{ padding: "10px 18px", border: "1px solid #ccc", background: "#f5f5f5", borderRadius: "8px", cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    style={{ padding: "10px 18px", border: "none", background: "#16a34a", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
                                >
                                    Assign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default AssignFaculty;