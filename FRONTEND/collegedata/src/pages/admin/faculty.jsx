import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";
import "../../styles/faculty.css";

function Faculty() {
    const [facultyList, setFacultyList] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedFacultyId, setSelectedFacultyId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        department_id: "",
        designation: "",
        phone: ""
    });

    const fetchFaculty = async () => {
        try {
            setLoading(true);
            const response = await api.get("/faculty");
            if (response.data.success) {
                setFacultyList(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching faculty:", err);
            alert("Failed to load faculty.");
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
        fetchFaculty();
        fetchDepartments();
    }, []);

    const handleOpenAddModal = () => {
        setEditMode(false);
        setSelectedFacultyId(null);
        setFormData({
            full_name: "",
            email: "",
            password: "",
            department_id: departments[0]?.department_id || "",
            designation: "Assistant Professor",
            phone: ""
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (faculty) => {
        setEditMode(true);
        setSelectedFacultyId(faculty.faculty_id);
        
        // Find matching department
        const matchedDept = departments.find(d => d.department_name === faculty.department_name);

        setFormData({
            full_name: faculty.full_name || "",
            email: faculty.email || "",
            password: "", // Leave blank on update
            department_id: matchedDept?.department_id || faculty.department_id || "",
            designation: faculty.designation || "Assistant Professor",
            phone: faculty.phone || ""
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
        
        if (!formData.full_name || !formData.email || !formData.department_id || !formData.designation) {
            alert("Please fill in all required fields.");
            return;
        }

        if (!editMode && !formData.password) {
            alert("Password is required for registration.");
            return;
        }

        try {
            if (editMode) {
                // Update faculty
                const response = await api.put(`/faculty/${selectedFacultyId}`, {
                    ...formData,
                    department_id: parseInt(formData.department_id, 10)
                });
                if (response.data.success) {
                    alert("Faculty updated successfully!");
                    setShowModal(false);
                    fetchFaculty();
                }
            } else {
                // Create faculty
                const response = await api.post("/faculty", {
                    ...formData,
                    department_id: parseInt(formData.department_id, 10)
                });
                if (response.data.success) {
                    alert("Faculty registered successfully!");
                    setShowModal(false);
                    fetchFaculty();
                }
            }
        } catch (err) {
            console.error("Error saving faculty:", err);
            alert(err.response?.data?.message || "Internal server error occurred.");
        }
    };

    const handleDelete = async (facultyId) => {
        if (!window.confirm("Are you sure you want to delete this faculty member?")) {
            return;
        }
        try {
            const response = await api.delete(`/faculty/${facultyId}`);
            if (response.data.success) {
                alert("Faculty member deleted successfully!");
                fetchFaculty();
            }
        } catch (err) {
            console.error("Error deleting faculty:", err);
            alert(err.response?.data?.message || "Failed to delete faculty member.");
        }
    };

    return (
        <AdminLayout>
            <div className="faculty-container">
                <div className="faculty-header">
                    <h2>Faculty Management</h2>
                    <button className="add-btn" onClick={handleOpenAddModal}>
                        + Add Faculty
                    </button>
                </div>

                {loading ? (
                    <p>Loading faculty list...</p>
                ) : (
                    <table className="faculty-table">
                        <thead>
                            <tr>
                                <th>SL NO</th>
                                <th>Faculty Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Designation</th>
                                <th>Phone</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facultyList.map((item, index) => (
                                <tr key={item.faculty_id}>
                                    <td>{index + 1}</td>
                                    <td>{item.full_name}</td>
                                    <td>{item.email}</td>
                                    <td>{item.department_name}</td>
                                    <td>{item.designation}</td>
                                    <td>{item.phone || "-"}</td>
                                    <td>
                                        <button 
                                            className="edit-btn" 
                                            onClick={() => handleOpenEditModal(item)}
                                        >
                                            Update
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(item.faculty_id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {facultyList.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                                        No faculty members found.
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
                            {editMode ? "Update Faculty Details" : "Register New Faculty"}
                        </h3>

                        <form onSubmit={handleSubmit}>
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
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email *</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter institutional email"
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                />
                            </div>

                            {!editMode && (
                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Password *</label>
                                    <input 
                                        type="password" 
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Set temporary password"
                                        required
                                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                    />
                                </div>
                            )}

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

                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Designation *</label>
                                <select 
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                >
                                    <option value="Assistant Professor">Assistant Professor</option>
                                    <option value="Associate Professor">Associate Professor</option>
                                    <option value="Professor">Professor</option>
                                    <option value="HOD">Head of Department (HOD)</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Phone Number</label>
                                <input 
                                    type="text" 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter phone number"
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                />
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

export default Faculty;