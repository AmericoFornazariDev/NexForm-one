export default function DashboardCard({ title, value, icon }) {
  return (
    <div className="bg-white shadow-md p-6 rounded-xl text-center">
      <div className="text-3xl mb-3" aria-hidden="true">
        {icon}
      </div>
      <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
        {title}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
