import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "CSE", value: 45 },
  { name: "ECE", value: 25 },
  { name: "EE", value: 15 },
  { name: "ME", value: 15 },
];

const COLORS = [
  "#6366F1",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
];

function DepartmentChart() {
  return (
    <div className="chart-box">
      <h3>Students by Department</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={100}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DepartmentChart;