import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FacultyLayout from "../../layouts/FacultyLayout";
import DashboardCard from "../../components/DashboardCard";
import api from "../../services/api";
import "../../styles/students.css"; // Reuse table styling

function Dashboard() {
    const navigate = useNavigate();
    const [facultyDetails, setFacultyDetails] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem("user"));
    const facultyId = user?.faculty_id;

    useEffect(() => {
        if (!facultyId) {
            setLoading(false);
            return;
        }

        const fetchFacultyDashboard = async () => {
            try {
                setLoading(true);
                const [statsResponse, assignmentsResponse] = await Promise.all([
                    api.get(`/dashboard/faculty/${facultyId}`),
                    api.get(`/faculty-subjects/faculty/${facultyId}`)
                ]);

                if (statsResponse.data.success) {
                    setFacultyDetails(statsResponse.data.data);
                }
                if (assignmentsResponse.data.success) {
                    setAssignments(assignmentsResponse.data.data);
                }
            } catch (err) {
                console.error("Error loading faculty dashboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFacultyDashboard();
    }, [facultyId]);

    const handleMarkAttendanceClick = (assignment) => {
        navigate("/faculty/attendance", {
            state: {
                faculty_subject_id: assignment.faculty_subject_id,
                class_id: assignment.class_id,
                subject_id: assignment.subject_id,
                subject_name: assignment.subject_name,
                semester: assignment.semester,
                section: assignment.section
            }
        });
    };

    if (!facultyId) {
        return (
            <FacultyLayout>
                <div className="student-container">
                    <h2>Error</h2>
                    <p style={{ color: "#ef4444", marginTop: "10px" }}>
                        Faculty ID not found. Please log out and log in again.
                    </p>
                </div>
            </FacultyLayout>
        );
    }

    return (
        <FacultyLayout>
            <div style={{ marginBottom: "25px" }}>
                <h1>Welcome, {facultyDetails?.faculty_name || user?.full_name}</h1>
                <p style={{ color: "#64748b", marginTop: "5px" }}>
                    {facultyDetails?.designation} • Department of {facultyDetails?.department_name}
                </p>
            </div>

            {loading ? (
                <p>Loading dashboard details...</p>
            ) : (
                <>
                    <div className="dashboard-grid" style={{ marginBottom: "35px" }}>
                        <DashboardCard
                            title="Assigned Subjects"
                            value={(facultyDetails?.assigned_subjects || 0).toString()}
                            color="#6366F1"
                        />
                        <DashboardCard
                            title="Assigned Classes"
                            value={(facultyDetails?.assigned_classes || 0).toString()}
                            color="#06B6D4"
                        />
                    </div>

                    <div className="student-container">
                        <div className="student-header">
                            <h3>My Subject & Class Allocations</h3>
                        </div>

                        <table className="student-table">
                            <thead>
                                <tr>
                                    <th>SL NO</th>
                                    <th>Subject Code</th>
                                    <th>Subject Name</th>
                                    <th>Class Section</th>
                                    <th>Department</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map((item, index) => (
                                    <tr key={item.faculty_subject_id}>
                                        <td>{index + 1}</td>
                                        <td style={{ fontWeight: "bold" }}>{item.subject_code}</td>
                                        <td>{item.subject_name}</td>
                                        <td>Semester {item.semester} - Section {item.section}</td>
                                        <td>{item.department_name}</td>
                                        <td>
                                            <button 
                                                className="add-btn" 
                                                style={{ fontSize: "14px", padding: "6px 12px" }}
                                                onClick={() => handleMarkAttendanceClick(item)}
                                            >
                                                Mark Attendance
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {assignments.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                            No subjects assigned to you.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </FacultyLayout>
    );
}

export default Dashboard;