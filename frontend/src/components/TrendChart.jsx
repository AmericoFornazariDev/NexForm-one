import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function TrendChart({ data }) {
  const chartData = Array.isArray(data)
    ? data.map((item) => ({
        date: item?.date ?? "",
        positive: Number(item?.positive ?? item?.positivo ?? 0) || 0,
        neutral: Number(item?.neutral ?? item?.neutro ?? 0) || 0,
        negative: Number(item?.negative ?? item?.negativo ?? 0) || 0
      }))
    : [];

  const hasValues = chartData.some(
    (item) => item.positive > 0 || item.neutral > 0 || item.negative > 0
  );

  return (
    <div className="group h-full rounded-3xl bg-white p-6 shadow-lg shadow-violet-100 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <h2 className="text-lg font-semibold text-slate-900">Tendência de Satisfação</h2>
      <p className="mb-6 text-sm text-slate-500">Resultados semanais por sentimento</p>
      {hasValues ? (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="4 8" stroke="#E2E8F0" />
            <XAxis dataKey="date" tick={{ fill: "#94A3B8" }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#94A3B8" }} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ strokeDasharray: "4 4" }}
              contentStyle={{ borderRadius: "1rem", borderColor: "#E5E7EB" }}
            />
            <Legend formatter={(value) => <span className="text-slate-500">{value}</span>} />
            <Line type="monotone" dataKey="positive" stroke="#22C55E" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="neutral" stroke="#EAB308" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[280px] items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
          Sem dados suficientes para apresentar.
        </div>
      )}
    </div>
  );
}
