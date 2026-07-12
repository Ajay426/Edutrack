import {
  Dashboard,
  People,
  School,
  MenuBook,
  Assignment,
  BarChart,
  Logout,
} from "@mui/icons-material";

import { NavLink, useNavigate } from "react-router-dom";
import "./../styles/adminLayout.css";

const adminMenus = [
  {
    title: "Dashboard",
    icon: <Dashboard />,
    path: "/admin/dashboard",
  },
  {
    title: "Students",
    icon: <People />,
    path: "/admin/students",
  },
  {
    title: "Faculty",
    icon: <School />,
    path: "/admin/faculty",
  },
  {
    title: "Subjects",
    icon: <MenuBook />,
    path: "/admin/subjects",
  },
  {
    title: "Assign Faculty",
    icon: <Assignment />,
    path: "/admin/assign-faculty",
  },
  {
    title: "Reports",
    icon: <BarChart />,
    path: "/admin/reports",
  },
];

const facultyMenus = [
  {
    title: "Dashboard",
    icon: <Dashboard />,
    path: "/faculty/dashboard",
  },
  {
    title: "Take Attendance",
    icon: <Assignment />,
    path: "/faculty/attendance",
  },
  {
    title: "Reports",
    icon: <BarChart />,
    path: "/faculty/reports",
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "ADMIN";

  const menus = role === "FACULTY" ? facultyMenus : adminMenus;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="sidebar">

      <div className="logo">

        <div className="logo-icon">
          🎓
        </div>

        <div>
          <h2>EduTrack</h2>
          <p>Attendance System</p>
        </div>

      </div>

      <div className="menu">

        {menus.map((item) => (
          <NavLink
            key={item.title}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            {item.icon}

            <span>{item.title}</span>

          </NavLink>
        ))}

      </div>

      <div className="logout">

        <button onClick={handleLogout}>

          <Logout />

          Logout

        </button>

      </div>

    </div>
  );
}

export default Sidebar;