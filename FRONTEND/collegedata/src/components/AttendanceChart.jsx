import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { day: "Mon", attendance: 83 },
  { day: "Tue", attendance: 86 },
  { day: "Wed", attendance: 80 },
  { day: "Thu", attendance: 91 },
  { day: "Fri", attendance: 88 },
  { day: "Sat", attendance: 94 },
];

function AttendanceChart() {
  return (
    <div className="chart-box">
      <h3>Attendance Trend</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="5 5" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="attendance"
            stroke="#6366F1"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AttendanceChart;