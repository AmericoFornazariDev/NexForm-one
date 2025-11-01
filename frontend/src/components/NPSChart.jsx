import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

const COLORS = ["#7C3AED", "#22C55E", "#F97316"];

export default function NPSChart({ data }) {
  return (
    <div className="group rounded-3xl bg-white p-6 shadow-lg shadow-violet-100 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <h2 className="text-lg font-semibold text-slate-900">NPS</h2>
      <p className="mb-6 text-sm text-slate-500">Promotores, neutros e detratores</p>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="4 8" stroke="#E2E8F0" />
          <XAxis dataKey="label" tick={{ fill: "#94A3B8" }} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "#94A3B8" }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: "1rem", borderColor: "#E5E7EB" }} />
          <Bar dataKey="value" radius={[10, 10, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
