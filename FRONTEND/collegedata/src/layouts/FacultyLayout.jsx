import "../styles/adminLayout.css";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function FacultyLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default FacultyLayout;
