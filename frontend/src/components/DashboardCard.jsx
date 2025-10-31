export default function DashboardCard({ title, value, icon }) {
  return (
    <div className="bg-white shadow-md p-6 rounded-xl text-center hover:shadow-lg transition">
      <div className="text-4xl mb-2" aria-hidden="true">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
    </div>
  );
}
