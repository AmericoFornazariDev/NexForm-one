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
    <div className="group h-full rounded-3xl bg-white p-6 shadow-lg shadow-violet-100 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <h2 className="text-lg font-semibold text-slate-900">Distribuição de Sentimentos</h2>
      <p className="mb-6 text-sm text-slate-500">Resumo geral das perceções dos utilizadores</p>
      {hasValues ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="label" innerRadius={60} outerRadius={90} paddingAngle={4}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: "1rem", borderColor: "#E5E7EB" }} formatter={(value) => `${value} respostas`} />
            <Legend formatter={(value) => <span className="text-slate-500">{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[250px] items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
          Sem dados suficientes para apresentar.
        </div>
      )}
    </div>
  );
}
