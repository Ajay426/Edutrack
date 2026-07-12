import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";
import "../../styles/students.css"; // Reuse students stylesheet for uniform styles

function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        subject_name: "",
        subject_code: "",
        department_id: "",
        semester: "1"
    });

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const response = await api.get("/subjects");
            if (response.data.success) {
                setSubjects(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching subjects:", err);
            alert("Failed to load subjects.");
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get("/departments");
            if (response.data.success) {
                setDepartments(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching departments:", err);
        }
    };

    useEffect(() => {
        fetchSubjects();
        fetchDepartments();
    }, []);

    const handleOpenAddModal = () => {
        setEditMode(false);
        setSelectedSubjectId(null);
        setFormData({
            subject_name: "",
            subject_code: "",
            department_id: departments[0]?.department_id || "",
            semester: "1"
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (subject) => {
        setEditMode(true);
        setSelectedSubjectId(subject.subject_id);
        
        // Find matching department_id by code/name
        const matchedDept = departments.find(d => d.department_name === subject.department_name);

        setFormData({
            subject_name: subject.subject_name || "",
            subject_code: subject.subject_code || "",
            department_id: matchedDept?.department_id || subject.department_id || "",
            semester: subject.semester ? subject.semester.toString() : "1"
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
        
        if (!formData.subject_name || !formData.subject_code || !formData.department_id || !formData.semester) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            const payload = {
                ...formData,
                department_id: parseInt(formData.department_id, 10),
                semester: parseInt(formData.semester, 10)
            };

            if (editMode) {
                const response = await api.put(`/subjects/${selectedSubjectId}`, payload);
                if (response.data.success) {
                    alert("Subject updated successfully!");
                    setShowModal(false);
                    fetchSubjects();
                }
            } else {
                const response = await api.post("/subjects", payload);
                if (response.data.success) {
                    alert("Subject added successfully!");
                    setShowModal(false);
                    fetchSubjects();
                }
            }
        } catch (err) {
            console.error("Error saving subject:", err);
            alert(err.response?.data?.message || "Internal server error occurred.");
        }
    };

    const handleDelete = async (subjectId) => {
        if (!window.confirm("Are you sure you want to delete this subject?")) {
            return;
        }
        try {
            const response = await api.delete(`/subjects/${subjectId}`);
            if (response.data.success) {
                alert("Subject deleted successfully!");
                fetchSubjects();
            }
        } catch (err) {
            console.error("Error deleting subject:", err);
            alert(err.response?.data?.message || "Failed to delete subject.");
        }
    };

    return (
        <AdminLayout>
            <div className="student-container"> {/* Reuse styling class */}
                <div className="student-header">
                    <h2>Subject Management</h2>
                    <button className="add-btn" onClick={handleOpenAddModal}>
                        + Add Subject
                    </button>
                </div>

                {loading ? (
                    <p>Loading subjects...</p>
                ) : (
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>SL NO</th>
                                <th>Subject Code</th>
                                <th>Subject Name</th>
                                <th>Department</th>
                                <th>Semester</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject, index) => (
                                <tr key={subject.subject_id}>
                                    <td>{index + 1}</td>
                                    <td style={{ fontWeight: "bold" }}>{subject.subject_code}</td>
                                    <td>{subject.subject_name}</td>
                                    <td>{subject.department_name}</td>
                                    <td>{subject.semester}</td>
                                    <td>
                                        <button 
                                            className="edit-btn" 
                                            onClick={() => handleOpenEditModal(subject)}
                                        >
                                            Update
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(subject.subject_id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {subjects.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                        No subjects found.
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
                            {editMode ? "Update Subject Details" : "Add New Subject"}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Subject Code *</label>
                                <input 
                                    type="text" 
                                    name="subject_code"
                                    value={formData.subject_code}
                                    onChange={handleInputChange}
                                    placeholder="e.g. CS601"
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                />
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Subject Name *</label>
                                <input 
                                    type="text" 
                                    name="subject_name"
                                    value={formData.subject_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Advanced DBMS"
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                />
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Department *</label>
                                <select 
                                    name="department_id"
                                    value={formData.department_id}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                >
                                    <option value="" disabled>Select Department</option>
                                    {departments.map(d => (
                                        <option key={d.department_id} value={d.department_id}>
                                            {d.department_name} ({d.department_code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Semester *</label>
                                <select 
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                        <option key={sem} value={sem}>Semester {sem}</option>
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

export default Subjects;