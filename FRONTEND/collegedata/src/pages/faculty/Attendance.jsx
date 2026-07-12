import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FacultyLayout from "../../layouts/FacultyLayout";
import api from "../../services/api";
import "../../styles/students.css"; // Reuse list styles

function Attendance() {
    const location = useLocation();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const facultyId = user?.faculty_id;

    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [lectureNo, setLectureNo] = useState("1");
    const [attendanceDate, setAttendanceDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [students, setStudents] = useState([]);
    const [sessionDetails, setSessionDetails] = useState(null);
    const [step, setStep] = useState(1); // Step 1: Config, Step 2: Mark
    const [loading, setLoading] = useState(false);

    // Fetch assignments for dropdown
    useEffect(() => {
        if (!facultyId) return;

        const fetchAssignments = async () => {
            try {
                const response = await api.get(`/faculty-subjects/faculty/${facultyId}`);
                if (response.data.success) {
                    setAssignments(response.data.data);
                    
                    // If redirected from Dashboard with assignment details in location state
                    if (location.state && location.state.faculty_subject_id) {
                        const matched = response.data.data.find(
                            a => a.faculty_subject_id === location.state.faculty_subject_id
                        );
                        if (matched) {
                            setSelectedAssignment(matched);
                        }
                    } else if (response.data.data.length > 0) {
                        setSelectedAssignment(response.data.data[0]);
                    }
                }
            } catch (err) {
                console.error("Error loading faculty allocations:", err);
            }
        };
        fetchAssignments();
    }, [facultyId, location.state]);

    const handleAssignmentChange = (e) => {
        const id = parseInt(e.target.value, 10);
        const selected = assignments.find(a => a.faculty_subject_id === id);
        setSelectedAssignment(selected);
    };

    const handleStartSession = async (e) => {
        e.preventDefault();
        if (!selectedAssignment) {
            alert("No allocation selected.");
            return;
        }

        try {
            setLoading(true);
            // 1. Create attendance session
            const sessionResponse = await api.post("/attendance/session", {
                faculty_subject_id: selectedAssignment.faculty_subject_id,
                attendance_date: attendanceDate,
                lecture_no: parseInt(lectureNo, 10)
            });

            if (sessionResponse.data.success) {
                const session = sessionResponse.data.data;
                setSessionDetails(session);

                // 2. Fetch students for the assigned class
                const studentsResponse = await api.get(`/attendance/class/${selectedAssignment.class_id}`);
                if (studentsResponse.data.success) {
                    // Map students to include a default status of 'Present'
                    const mappedStudents = studentsResponse.data.data.map(student => ({
                        ...student,
                        status: "Present"
                    }));
                    setStudents(mappedStudents);
                    setStep(2);
                }
            }
        } catch (err) {
            console.error("Error starting attendance session:", err);
            alert(err.response?.data?.message || "Failed to initiate session. It may already exist for this date/lecture.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, newStatus) => {
        setStudents(prev => prev.map(student => 
            student.student_id === studentId 
                ? { ...student, status: newStatus } 
                : student
        ));
    };

    const handleSubmitAttendance = async () => {
        if (!sessionDetails) return;

        try {
            setLoading(true);
            const response = await api.post("/attendance/mark", {
                session_id: sessionDetails.session_id,
                attendance: students.map(s => ({
                    student_id: s.student_id,
                    status: s.status
                }))
            });

            if (response.data.success) {
                alert("Attendance submitted successfully!");
                navigate("/faculty/dashboard");
            }
        } catch (err) {
            console.error("Error marking attendance:", err);
            alert(err.response?.data?.message || "Failed to submit attendance records.");
        } finally {
            setLoading(false);
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
                <div className="student-header" style={{ marginBottom: "20px" }}>
                    <h2>Mark Student Attendance</h2>
                    {step === 2 && (
                        <span style={{ fontSize: "15px", color: "#4f46e5", fontWeight: "bold" }}>
                            Session Active: {selectedAssignment?.subject_name} ({selectedAssignment?.subject_code})
                        </span>
                    )}
                </div>

                {step === 1 ? (
                    <form onSubmit={handleStartSession} style={{ maxWidth: "600px", margin: "0 auto", padding: "20px 0" }}>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Select Subject & Allocation *</label>
                            <select 
                                value={selectedAssignment?.faculty_subject_id || ""}
                                onChange={handleAssignmentChange}
                                required
                                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                            >
                                <option value="" disabled>-- Select Allocation --</option>
                                {assignments.map(a => (
                                    <option key={a.faculty_subject_id} value={a.faculty_subject_id}>
                                        {a.subject_code} - {a.subject_name} [Semester {a.semester} Sec {a.section}]
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: "flex", gap: "20px", marginBottom: "25px" }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Date *</label>
                                <input 
                                    type="date" 
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    required
                                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                                />
                            </div>

                            <div style={{ flex: 1 }}>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Lecture Number *</label>
                                <select 
                                    value={lectureNo} 
                                    onChange={(e) => setLectureNo(e.target.value)}
                                    required
                                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                        <option key={num} value={num}>Lecture {num}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !selectedAssignment}
                            style={{
                                width: "100%",
                                padding: "14px",
                                backgroundColor: "#4f46e5",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                opacity: (!selectedAssignment || loading) ? 0.6 : 1
                            }}
                        >
                            {loading ? "Starting session..." : "Start Attendance Session"}
                        </button>
                    </form>
                ) : (
                    <div>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: "#f8fafc",
                            padding: "15px 20px",
                            borderRadius: "10px",
                            marginBottom: "25px",
                            border: "1px solid #e2e8f0"
                        }}>
                            <div>
                                <p style={{ fontSize: "14px", color: "#64748b" }}>Class Details</p>
                                <h4 style={{ color: "#334155" }}>
                                    Semester {selectedAssignment?.semester} - Section {selectedAssignment?.section} ({selectedAssignment?.department_name})
                                </h4>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p style={{ fontSize: "14px", color: "#64748b" }}>Date & Lecture</p>
                                <h4 style={{ color: "#334155" }}>{attendanceDate} • Lecture {lectureNo}</h4>
                            </div>
                        </div>

                        <table className="student-table" style={{ marginBottom: "25px" }}>
                            <thead>
                                <tr>
                                    <th>Roll No</th>
                                    <th>Student Name</th>
                                    <th style={{ textAlign: "center" }}>Present</th>
                                    <th style={{ textAlign: "center" }}>Absent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.student_id}>
                                        <td style={{ fontWeight: "bold" }}>{student.roll_no}</td>
                                        <td>{student.full_name}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <input 
                                                type="radio" 
                                                name={`status_${student.student_id}`}
                                                checked={student.status === "Present"}
                                                onChange={() => handleStatusChange(student.student_id, "Present")}
                                                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                                            />
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <input 
                                                type="radio" 
                                                name={`status_${student.student_id}`}
                                                checked={student.status === "Absent"}
                                                onChange={() => handleStatusChange(student.student_id, "Absent")}
                                                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px" }}>
                            <button 
                                onClick={() => setStep(1)}
                                style={{ padding: "12px 24px", border: "1px solid #cbd5e1", background: "#f8fafc", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleSubmitAttendance}
                                disabled={loading}
                                style={{
                                    padding: "12px 30px",
                                    border: "none",
                                    background: "#16a34a",
                                    color: "white",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    opacity: loading ? 0.6 : 1
                                }}
                            >
                                {loading ? "Saving..." : "Submit Attendance"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </FacultyLayout>
    );
}

export default Attendance;