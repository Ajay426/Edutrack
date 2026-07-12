import "./../styles/adminLayout.css";

function DashboardCard({ title, value, color }) {
    return (
        <div className="dashboard-card">

            <div
                className="card-strip"
                style={{ background: color }}
            />

            <h4>{title}</h4>

            <h2>{value}</h2>

        </div>
    );
}

export default DashboardCard;