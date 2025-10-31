import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const COLORS = ["#22c55e", "#eab308", "#ef4444"];

export default function SentimentChart({ data }) {
  const chartData = Array.isArray(data)
    ? data.map((item) => ({
        label: item?.label ?? "",
        value: Number(item?.value ?? 0) || 0
      }))
    : [];

  const hasValues = chartData.some((item) => item.value > 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow h-full">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        Distribuição de Sentimentos
      </h2>
      {hasValues ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="label" outerRadius={90}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[250px] flex items-center justify-center text-slate-500">
          Sem dados suficientes para apresentar.
        </div>
      )}
    </div>
  );
}
