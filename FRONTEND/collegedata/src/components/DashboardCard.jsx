import "./../styles/adminLayout.css";

function DashboardCard({ title, value, color }) {
  return (
    <div className="dashboard-card">
      <div
        className="card-strip"
        style={{ backgroundColor: color }}
      ></div>

      <h4 className="card-title">{title}</h4>

      <h2 className="card-value">{value}</h2>
    </div>
  );
}

export default DashboardCard;
