import { useState, useEffect } from "react";
import FacultyLayout from "../../layouts/FacultyLayout";
import api from "../../services/api";
import "../../styles/students.css"; // Reuse styling classes

function Reports() {
    const user = JSON.parse(localStorage.getItem("user"));
    const facultyId = user?.faculty_id;

    const [assignments, setAssignments] = useState([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
    const [reportData, setReportData] = useState([]);
    const [loadingReport, setLoadingReport] = useState(false);

    useEffect(() => {
        if (!facultyId) return;

        const fetchAllocations = async () => {
            try {
                const response = await api.get(`/faculty-subjects/faculty/${facultyId}`);
                if (response.data.success) {
                    setAssignments(response.data.data);
                }
            } catch (err) {
                console.error("Error loading faculty allocations:", err);
            }
        };
        fetchAllocations();
    }, [facultyId]);

    const handleGenerateReport = async () => {
        if (!selectedAssignmentId) {
            alert("Please select a subject allocation.");
            return;
        }

        const assignment = assignments.find(
            a => a.faculty_subject_id === parseInt(selectedAssignmentId, 10)
        );

        if (!assignment) return;

        try {
            setLoadingReport(true);
            // Query report by class_id and filter by subject_id
            const response = await api.get(
                `/attendance/report/class/${assignment.class_id}?subjectId=${assignment.subject_id}`
            );

            if (response.data.success) {
                setReportData(response.data.data);
            }
        } catch (err) {
            console.error("Error loading report:", err);
            alert("Failed to load compiled attendance report.");
        } finally {
            setLoadingReport(false);
        }
    };

    if (!facultyId) {
        return (
            <FacultyLayout>
                <div className="student-container">
                    <h2>Access Denied</h2>
                    <p style={{ color: "#ef4444", marginTop: "10px" }}>Faculty credentials missing.</p>
                </div>
            </FacultyLayout>
        );
    }

    return (
        <FacultyLayout>
            <div className="student-container">
                <div className="student-header" style={{ marginBottom: "15px" }}>
                    <h2>Attendance Performance Reports</h2>
                </div>

                {/* Filter Controls */}
                <div style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-end",
                    marginBottom: "30px",
                    backgroundColor: "#f8fafc",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0"
                }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#475569" }}>
                            Select Subject Allocation *
                        </label>
                        <select 
                            value={selectedAssignmentId} 
                            onChange={(e) => setSelectedAssignmentId(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                        >
                            <option value="">-- Choose Allocation --</option>
                            {assignments.map(a => (
                                <option key={a.faculty_subject_id} value={a.faculty_subject_id}>
                                    {a.subject_code} - {a.subject_name} [Semester {a.semester} Sec {a.section}]
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleGenerateReport}
                        style={{
                            padding: "11px 24px",
                            backgroundColor: "#4f46e5",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#4338ca"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#4f46e5"}
                    >
                        Generate Report
                    </button>
                </div>

                {loadingReport ? (
                    <p>Compiling report data...</p>
                ) : (
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>SL NO</th>
                                <th>Roll No</th>
                                <th>Student Name</th>
                                <th>Total Lectures Conducted</th>
                                <th>Lectures Attended</th>
                                <th>Attendance %</th>
                                <th>Shortage Warning</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((row, index) => {
                                const percentage = row.attendance_percentage === null ? 0 : parseFloat(row.attendance_percentage);
                                const isShortage = percentage < 75;
                                return (
                                    <tr key={row.student_id}>
                                        <td>{index + 1}</td>
                                        <td style={{ fontWeight: "bold" }}>{row.roll_no}</td>
                                        <td>{row.full_name}</td>
                                        <td>{row.total_classes}</td>
                                        <td>{row.present_classes}</td>
                                        <td style={{
                                            fontWeight: "bold",
                                            color: isShortage ? "#ef4444" : "#16a34a"
                                        }}>
                                            {percentage}%
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                                backgroundColor: isShortage ? "#fee2e2" : "#dcfce7",
                                                color: isShortage ? "#991b1b" : "#166534"
                                            }}>
                                                {isShortage ? "Shortage (<75%)" : "On Track"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {reportData.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                        Select one of your allocations above and click "Generate Report".
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </FacultyLayout>
    );
}

export default Reports;