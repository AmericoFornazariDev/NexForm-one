export default function DashboardCard({ title, value, icon: Icon, accent, description }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-violet-100 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <span className="absolute -right-12 -top-16 h-32 w-32 rounded-full bg-violet-100/70 transition-all duration-300 ease-in-out group-hover:-right-10 group-hover:-top-12" />
      <div className="relative flex flex-col gap-4">
        <div
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
            accent || "bg-violet-100 text-violet-600"
          } shadow-sm shadow-violet-100 transition-all duration-300 ease-in-out group-hover:scale-105`}
        >
          {Icon ? <Icon className="h-6 w-6" /> : null}
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
          {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}
