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
    <div className="bg-white p-6 rounded-xl shadow h-full">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        Tendência de Satisfação
      </h2>
      {hasValues ? (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="positive" stroke="#22c55e" strokeWidth={2} />
            <Line type="monotone" dataKey="neutral" stroke="#eab308" strokeWidth={2} />
            <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[280px] flex items-center justify-center text-slate-500">
          Sem dados suficientes para apresentar.
        </div>
      )}
    </div>
  );
}
