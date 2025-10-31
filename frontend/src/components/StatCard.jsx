export default function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow text-center">
      <h3 className="text-slate-600 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
    </div>
  );
}
