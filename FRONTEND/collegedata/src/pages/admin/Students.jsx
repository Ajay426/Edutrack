import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";
import "../../styles/students.css";

function Students() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        roll_no: "",
        registration_no: "",
        full_name: "",
        class_id: "",
        phone: "",
        email: "",
        status: true
    });

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get("/students");
            if (response.data.success) {
                setStudents(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching students:", err);
            alert("Failed to load students.");
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await api.get("/classes");
            if (response.data.success) {
                setClasses(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching classes:", err);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, []);

    const handleOpenAddModal = () => {
        setEditMode(false);
        setSelectedStudentId(null);
        setFormData({
            roll_no: "",
            registration_no: "",
            full_name: "",
            class_id: classes[0]?.class_id || "",
            phone: "",
            email: "",
            status: true
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (student) => {
        setEditMode(true);
        setSelectedStudentId(student.student_id);
        
        // Find matching class
        const matchedClass = classes.find(c => 
            c.semester === student.semester && 
            c.section === student.section && 
            c.department_name === student.department_name
        );

        setFormData({
            roll_no: student.roll_no || "",
            registration_no: student.registration_no || "",
            full_name: student.full_name || "",
            class_id: matchedClass?.class_id || student.class_id || "",
            phone: student.phone || "",
            email: student.email || "",
            status: student.status === null ? true : student.status
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.roll_no || !formData.registration_no || !formData.full_name || !formData.class_id) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            if (editMode) {
                const response = await api.put(`/students/${selectedStudentId}`, {
                    ...formData,
                    class_id: parseInt(formData.class_id, 10)
                });
                if (response.data.success) {
                    alert("Student updated successfully!");
                    setShowModal(false);
                    fetchStudents();
                }
            } else {
                const response = await api.post("/students", {
                    ...formData,
                    class_id: parseInt(formData.class_id, 10)
                });
                if (response.data.success) {
                    alert("Student added successfully!");
                    setShowModal(false);
                    fetchStudents();
                }
            }
        } catch (err) {
            console.error("Error saving student:", err);
            alert(err.response?.data?.message || "Internal server error occurred.");
        }
    };

    const handleDelete = async (studentId) => {
        if (!window.confirm("Are you sure you want to delete this student?")) {
            return;
        }
        try {
            const response = await api.delete(`/students/${studentId}`);
            if (response.data.success) {
                alert("Student deleted successfully!");
                fetchStudents();
            }
        } catch (err) {
            console.error("Error deleting student:", err);
            alert(err.response?.data?.message || "Failed to delete student.");
        }
    };

    return (
        <AdminLayout>
            <div className="student-container">
                <div className="student-header">
                    <h2>Student Management</h2>
                    <button className="add-btn" onClick={handleOpenAddModal}>
                        + Add Student
                    </button>
                </div>

                {loading ? (
                    <p>Loading students list...</p>
                ) : (
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>SL NO</th>
                                <th>Roll No</th>
                                <th>Student Name</th>
                                <th>Class</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student.student_id}>
                                    <td>{index + 1}</td>
                                    <td>{student.roll_no}</td>
                                    <td>{student.full_name}</td>
                                    <td>
                                        {student.semester} Sem - Sec {student.section} ({student.department_name})
                                    </td>
                                    <td>{student.phone || "-"}</td>
                                    <td>{student.email || "-"}</td>
                                    <td>
                                        <span style={{
                                            color: student.status ? "#16a34a" : "#ef4444",
                                            fontWeight: "bold"
                                        }}>
                                            {student.status ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="edit-btn" 
                                            onClick={() => handleOpenEditModal(student)}
                                        >
                                            Update
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(student.student_id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                                        No students found.
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
                            {editMode ? "Update Student Details" : "Add New Student"}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Roll Number *</label>
                                <input 
                                    type="text" 
                                    name="roll_no"
                                    value={formData.roll_no}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 22CSE001"
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                />
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Registration Number *</label>
                                <input 
                                    type="text" 
                                    name="registration_no"
                                    value={formData.registration_no}
                                    onChange={handleInputChange}
                                    placeholder="e.g. REG123456"
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                />
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Full Name *</label>
                                <input 
                                    type="text" 
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter full name"
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                />
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Class *</label>
                                <select 
                                    name="class_id"
                                    value={formData.class_id}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                >
                                    <option value="" disabled>Select Class</option>
                                    {classes.map(c => (
                                        <option key={c.class_id} value={c.class_id}>
                                            Semester {c.semester} - Section {c.section} ({c.department_name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Phone</label>
                                <input 
                                    type="text" 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter phone number"
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                />
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email address"
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                />
                            </div>

                            <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <input 
                                    type="checkbox" 
                                    id="status"
                                    name="status"
                                    checked={formData.status}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="status" style={{ fontWeight: "bold", cursor: "pointer" }}>Active Status</label>
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
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default Students;