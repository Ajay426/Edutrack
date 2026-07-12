import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/login";

import Dashboard from "../pages/admin/Dashboard";
import Students from "../pages/admin/Students";
import Faculty from "../pages/admin/faculty";
import Subjects from "../pages/admin/Subjects";
import AssignFaculty from "../pages/admin/AssignFaculty";
import Reports from "../pages/admin/Reports";

import FacultyDashboard from "../pages/faculty/Dashboard";
import Attendance from "../pages/faculty/Attendance";
import FacultyReports from "../pages/faculty/Reports";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public */}

                <Route path="/" element={<Login />} />

                {/* Admin */}

                <Route
                    path="/admin/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/admin/students"
                    element={<Students />}
                />

                <Route
                    path="/admin/faculty"
                    element={<Faculty />}
                />

                <Route
                    path="/admin/subjects"
                    element={<Subjects />}
                />

                <Route
                    path="/admin/assign-faculty"
                    element={<AssignFaculty />}
                />

                <Route
                    path="/admin/reports"
                    element={<Reports />}
                />

                {/* Faculty */}

                <Route
                    path="/faculty/dashboard"
                    element={<FacultyDashboard />}
                />

                <Route
                    path="/faculty/attendance"
                    element={<Attendance />}
                />

                <Route
                    path="/faculty/reports"
                    element={<FacultyReports />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;