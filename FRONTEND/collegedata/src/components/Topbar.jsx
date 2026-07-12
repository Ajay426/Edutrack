import { Notifications, AccountCircle } from "@mui/icons-material";

function Topbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="topbar">

      <div>
        <h2>Attendance Hub</h2>
      </div>

      <div className="topbar-right">

        <Notifications />

        <div className="profile">

          <AccountCircle />

          <span>{user?.full_name}</span>

        </div>

      </div>

    </div>
  );
}

export default Topbar;