import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";
import "../../styles/students.css"; // Reuse table styles

function Reports() {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [reportData, setReportData] = useState([]);
    const [loadingReport, setLoadingReport] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [classResponse, subjectResponse] = await Promise.all([
                    api.get("/classes"),
                    api.get("/subjects")
                ]);
                if (classResponse.data.success) {
                    setClasses(classResponse.data.data);
                }
                if (subjectResponse.data.success) {
                    setSubjects(subjectResponse.data.data);
                }
            } catch (err) {
                console.error("Error loading criteria metadata:", err);
            }
        };
        loadInitialData();
    }, []);

    const handleSearch = async () => {
        if (!selectedClassId) {
            alert("Please select a class to generate the report.");
            return;
        }

        try {
            setLoadingReport(true);
            let url = `/attendance/report/class/${selectedClassId}`;
            if (selectedSubjectId) {
                url += `?subjectId=${selectedSubjectId}`;
            }

            const response = await api.get(url);
            if (response.data.success) {
                setReportData(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching report:", err);
            alert("Failed to compile attendance report.");
        } finally {
            setLoadingReport(false);
        }
    };

    return (
        <AdminLayout>
            <div className="student-container">
                <div className="student-header" style={{ marginBottom: "15px" }}>
                    <h2>Institutional Attendance Reports</h2>
                </div>

                {/* Filter section */}
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
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#475569" }}>Class *</label>
                        <select 
                            value={selectedClassId} 
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                        >
                            <option value="">-- Choose Class --</option>
                            {classes.map(c => (
                                <option key={c.class_id} value={c.class_id}>
                                    Semester {c.semester} - Section {c.section} ({c.department_name})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#475569" }}>Subject (Optional)</label>
                        <select 
                            value={selectedSubjectId} 
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                        >
                            <option value="">-- All Subjects --</option>
                            {subjects.map(s => (
                                <option key={s.subject_id} value={s.subject_id}>
                                    {s.subject_code} - {s.subject_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleSearch}
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
                                <th>Total Lectures</th>
                                <th>Lectures Attended</th>
                                <th>Attendance %</th>
                                <th>Status</th>
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
                                                {isShortage ? "Shortage" : "On Track"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {reportData.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                        Select filters above and click "Generate Report" to view results.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    );
}

export default Reports;