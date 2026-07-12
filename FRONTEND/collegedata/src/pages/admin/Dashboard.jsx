import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import DashboardCard from "../../components/DashboardCard";
import AttendanceChart from "../../components/AttendanceChart";
import DepartmentChart from "../../components/DepartmentChart";
import api from "../../services/api";

function Dashboard() {
    const [stats, setStats] = useState({
        total_students: 0,
        total_faculty: 0,
        total_subjects: 0,
        total_classes: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get("/dashboard/admin");
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <AdminLayout>
            <h1>Dashboard Overview</h1>
            <p>Track real-time institutional performance.</p>

            {loading ? (
                <p style={{ marginTop: "20px" }}>Loading statistics...</p>
            ) : (
                <div className="dashboard-grid">
                    <DashboardCard
                        title="Students"
                        value={stats.total_students.toString()}
                        color="#6366F1"
                    />
                    <DashboardCard
                        title="Faculty"
                        value={stats.total_faculty.toString()}
                        color="#06B6D4"
                    />
                    <DashboardCard
                        title="Subjects"
                        value={stats.total_subjects.toString()}
                        color="#10B981"
                    />
                    <DashboardCard
                        title="Classes"
                        value={stats.total_classes.toString()}
                        color="#F59E0B"
                    />
                </div>
            )}

            <div className="chart-grid">
                <AttendanceChart />
                <DepartmentChart />
            </div>
        </AdminLayout>
    );
}

export default Dashboard;